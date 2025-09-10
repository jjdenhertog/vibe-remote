import { spawn } from 'node:child_process';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getTaskAttempt } from '@vibe-remote/vibe-kanban-api/api/task-attempts/getTaskAttempt';
import { getTask } from '@vibe-remote/vibe-kanban-api/api/tasks/getTask';
import { readAutomationPreferences, type AutomationPreferences } from '@vibe-remote/shared-utils/preferences';
import { 
    readPromptTemplate, 
    readPreferenceFiles, 
    prependContextToPrompt, 
    processTemplate 
} from '@vibe-remote/shared-utils/prompt-utils';

/**
 * Executes Claude command with the given prompt file
 */
function runClaudeCommand(promptFile: string, additionalArgs: string[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
        const baseArgs = [
            '-p', `Read and execute the this file ${promptFile}`,
            '--dangerously-skip-permissions',
            '--verbose',
            '--output-format=stream-json'
        ];
        
        // Filter out base args from additionalArgs to prevent conflicts
        const baseArgKeys = new Set(['-p', '--dangerously-skip-permissions', '--verbose', '--output-format']);
        const filteredAdditionalArgs = additionalArgs.filter(arg => {
            const [argKey] = arg.split('=');
            
            return !baseArgKeys.has(arg) && !baseArgKeys.has(argKey ?? '');
        });
        
        const claude = spawn('claude', [...baseArgs, ...filteredAdditionalArgs], {
            stdio: ['inherit', 'pipe', 'pipe']
        });

        claude.stdout.on('data', (data) => {
            process.stdout.write(data);
        });

        claude.stderr.on('data', (data) => {
            process.stderr.write(data);
        });

        claude.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Claude command exited with code ${code}`));
            }
        });

        claude.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Gets auto-merge prompt template from file
 */
function getAutoMergePromptTemplate(): string | null {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const templatePath = join(__dirname, '..', '..', 'templates', 'auto-merge-prompt.md');
    
    const template = readPromptTemplate(templatePath, 'auto-merge-prompt.md');
    if (!template) {
        console.error('Error: Auto-merge template file not found at', templatePath);
    }
    
    return template;
}

/**
 * Runs auto-merge decision process with Claude
 * @param attemptId - The task attempt ID to fetch task context
 * @param prUrl - The PR URL to merge if Claude decides to
 * @param customPrompt - Optional custom prompt template (uses default if not provided)
 */
export async function runAutoMerge(attemptId: string, prUrl: string, customPrompt?: string): Promise<void> {
    let tempFile: string | null = null;
    
    try {
        // Get task data from vibe-kanban API
        console.log(`🔍 Fetching task attempt data for ID: ${attemptId}`);
        const taskAttempt = await getTaskAttempt(attemptId);
        
        if (!taskAttempt) {
            throw new Error(`Task attempt not found for ID: ${attemptId}`);
        }
        
        console.log(`✅ Task attempt found - Branch: ${taskAttempt.branch}, Base: ${taskAttempt.base_branch}`);

        // Get task details
        console.log(`🔍 Fetching task data for task ID: ${taskAttempt.task_id}`);
        const task = await getTask(taskAttempt.task_id);
        console.log(`✅ Task found - Title: "${task?.title || 'Unknown'}"`);

        // Get automation preferences
        const preferences: AutomationPreferences = readAutomationPreferences();
        
        // Get project context
        console.log(`📄 Reading project context and coding standards...`);
        const preferenceContext = readPreferenceFiles();
        
        if (preferenceContext.projectContext) {
            console.log(`✅ Project context loaded (${preferenceContext.projectContext.length} chars)`);
        } else {
            console.log(`⚠️  No project context found`);
        }
        
        if (preferenceContext.codingStandards) {
            console.log(`✅ Coding standards loaded (${preferenceContext.codingStandards.length} chars)`);
        } else {
            console.log(`⚠️  No coding standards found`);
        }

        // Get auto-merge prompt template (from parameter, preference, or file)
        let promptTemplate = customPrompt || preferences.autoMergePrompt;
        if (!promptTemplate) {
            const templateFromFile = getAutoMergePromptTemplate();
            if (!templateFromFile) {
                console.error('❌ No auto-merge template found, skipping auto-merge');

                return;
            }

            promptTemplate = templateFromFile;
        }
        
        // Log the PR URL that will be used for merging
        console.log(`🔗 PR URL to merge if approved: ${prUrl}`);
        console.log(`🎯 Merge decision mode: Claude will evaluate local changes`);

        // Replace PR_URL placeholder with actual PR URL
        promptTemplate = promptTemplate.replace(/\[PR_URL]/g, prUrl);
        promptTemplate = promptTemplate.replace(/{{PR_URL}}/g, prUrl);
        
        // Process template with context
        const processedPrompt = processTemplate(promptTemplate, {
            taskTitle: task?.title || 'Unknown Task',
            taskDescription: task?.description || 'No description available',
            ...(preferenceContext.projectContext && { projectContext: preferenceContext.projectContext }),
            ...(preferenceContext.codingStandards && { codingStandards: preferenceContext.codingStandards })
        });

        // The prompt is already enhanced with context via template processing
        // Only prepend additional context if not already included in template
        let enhancedPrompt = processedPrompt;
        if (!processedPrompt.includes('Project Context') && preferenceContext.projectContext) {
            enhancedPrompt = prependContextToPrompt(enhancedPrompt, preferenceContext);
        }

        // Create temporary file for the prompt
        const tempFileName = `auto-merge-${randomUUID()}.md`;
        tempFile = join(tmpdir(), tempFileName);
        
        writeFileSync(tempFile, enhancedPrompt, 'utf8');
        
        console.log(`📝 Created temporary prompt file: ${tempFile}`);
        console.log(`🤖 Executing Claude auto-merge decision...`);
        console.log(`📁 Working directory: ${process.cwd()}`);
        console.log(`🎯 Claude will analyze local worktree changes against task requirements`);

        // Execute Claude command
        await runClaudeCommand(tempFile);
        
        console.log(`✅ Auto-merge decision process completed`);
        console.log(`📋 Note: Check above output for Claude's merge decision and actions`);

    } catch (error) {
        console.error(`❌ Auto-merge execution failed:`, error);
        throw error;
    } finally {
        // Clean up temporary file
        if (tempFile && existsSync(tempFile)) {
            try {
                unlinkSync(tempFile);
                console.log(`🧹 Cleaned up temporary file: ${tempFile}`);
            } catch (cleanupError) {
                console.warn(`⚠️  Warning: Could not clean up temporary file ${tempFile}: ${String(cleanupError)}`);
            }
        }
    }
}