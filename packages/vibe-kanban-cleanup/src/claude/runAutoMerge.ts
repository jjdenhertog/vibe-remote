import { spawn } from 'node:child_process';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getTaskAttempt } from '@vibe-remote/vibe-kanban-api/api/task-attempts/getTaskAttempt';
import { getTask } from '@vibe-remote/vibe-kanban-api/api/tasks/getTask';
import { setApiConfig } from '@vibe-remote/vibe-kanban-api/api/config/setApiConfig';
import { readAutomationPreferences, type AutomationPreferences } from '@vibe-remote/shared-utils/preferences';

type PreferenceContext = {
    codingStandards?: string;
    projectContext?: string;
};

/**
 * Reads preference files from the workspace
 */
function readPreferenceFiles(): PreferenceContext {
    const context: PreferenceContext = {};

    // Check for coding standards (matching claude-wrapper patterns)
    const codingStandardsPaths = [
        '/workspace/data/preferences/coding-standards.md',
        '/workspace/docs/goal/02-coding-standards.md'
    ];
    
    for (const path of codingStandardsPaths) {
        if (existsSync(path)) {
            try {
                context.codingStandards = readFileSync(path, 'utf8');
                break;
            } catch (error) {
                console.warn(`Warning: Could not read ${path}: ${String(error)}`);
            }
        }
    }

    // Check for project context (matching claude-wrapper patterns)
    const projectContextPaths = [
        '/workspace/data/preferences/project-context.md',
        '/workspace/docs/goal/01-project-overview.md'
    ];
    
    for (const path of projectContextPaths) {
        if (existsSync(path)) {
            try {
                context.projectContext = readFileSync(path, 'utf8');
                break;
            } catch (error) {
                console.warn(`Warning: Could not read ${path}: ${String(error)}`);
            }
        }
    }

    return context;
}

/**
 * Prepends context information to the prompt
 */
function prependContextToPrompt(prompt: string, context: PreferenceContext): string {
    let enhancedPrompt = prompt;

    if (context.codingStandards) {
        enhancedPrompt = `# Coding Standards\n\n${context.codingStandards}\n\n---\n\n${enhancedPrompt}`;
    }

    if (context.projectContext) {
        enhancedPrompt = `# Project Context\n\n${context.projectContext}\n\n---\n\n${enhancedPrompt}`;
    }

    return enhancedPrompt;
}

/**
 * Processes template with context replacements
 */
function processTemplate(template: string, context: {
    taskTitle?: string;
    taskDescription?: string;
    pullRequestTitle?: string;
    pullRequestDescription?: string;
    pullRequestUrl?: string;
    branchName?: string;
    baseBranch?: string;
    worktreePath?: string;
    projectContext?: string;
    codingStandards?: string;
}): string {
    let processed = template;

    // Replace template variables - handle both formats (camelCase and UPPER_CASE)
    processed = processed.replace(/{{TASK_TITLE}}/g, context.taskTitle || '');
    processed = processed.replace(/{{taskTitle}}/g, context.taskTitle || '');
    processed = processed.replace(/{{TASK_DESCRIPTION}}/g, context.taskDescription || '');
    processed = processed.replace(/{{taskDescription}}/g, context.taskDescription || '');
    processed = processed.replace(/{{PR_TITLE}}/g, context.pullRequestTitle || '');
    processed = processed.replace(/{{pullRequestTitle}}/g, context.pullRequestTitle || '');
    processed = processed.replace(/{{PR_DESCRIPTION}}/g, context.pullRequestDescription || '');
    processed = processed.replace(/{{pullRequestDescription}}/g, context.pullRequestDescription || '');
    processed = processed.replace(/{{BRANCH_NAME}}/g, context.branchName || '');
    processed = processed.replace(/{{branchName}}/g, context.branchName || '');
    processed = processed.replace(/{{baseBranch}}/g, context.baseBranch || '');
    processed = processed.replace(/{{WORKTREE_PATH}}/g, context.worktreePath || process.cwd());
    processed = processed.replace(/{{PR_URL}}/g, context.pullRequestUrl || '');
    processed = processed.replace(/\[PR_URL]/g, context.pullRequestUrl || '');
    
    // Replace context placeholders
    processed = processed.replace(/{{PROJECT_CONTEXT}}/g, context.projectContext || 'No project context available');
    processed = processed.replace(/{{CODING_STANDARDS}}/g, context.codingStandards || 'No coding standards available');
    
    // Additional template variables from the actual template
    processed = processed.replace(/{{PR_AUTHOR}}/g, process.env.USER || 'automated');
    processed = processed.replace(/{{REPOSITORY_NAME}}/g, 'vibe-kanban');
    processed = processed.replace(/{{PROJECT_TYPE}}/g, 'TypeScript Monorepo');
    processed = processed.replace(/{{TECHNOLOGIES}}/g, 'TypeScript, React, Node.js, Docker');
    processed = processed.replace(/{{DEPENDENCIES}}/g, 'pnpm workspace dependencies');
    processed = processed.replace(/{{VERSION}}/g, process.env.npm_package_version || 'unknown');

    return processed;
}

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
 * Gets auto-merge prompt template from file or returns default
 */
function getAutoMergePromptTemplate(): string {
    // Try to read the template file first
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const templatePath = join(__dirname, '..', '..', 'templates', 'auto-merge-prompt.md');
    
    if (existsSync(templatePath)) {
        try {
            return readFileSync(templatePath, 'utf8');
        } catch (error) {
            console.warn(`Warning: Could not read auto-merge template file: ${String(error)}`);
        }
    }
    
    // Fallback to inline template if file not found (matching the expected format from task)
    return `You are evaluating whether to merge the current work into the main branch.

Task Context:
Title: {{TASK_TITLE}}
Description: {{TASK_DESCRIPTION}}

Project Context:
{{PROJECT_CONTEXT}}

Coding Standards:
{{CODING_STANDARDS}}

Your task:
1. Review the changes in the current worktree using git diff
2. Verify the implementation matches the task requirements
3. Run type checking: \`pnpm -r run type-check\`
4. Run linting: \`pnpm -r run lint\`
5. Assess if the changes are complete and meet quality standards

Criteria for merging:
- Implementation fulfills the task description
- No type errors (warnings are acceptable)
- No lint errors (warnings are acceptable)
- Code follows the project's coding standards
- Changes are complete and not work-in-progress

If you decide to merge, execute:
gh pr merge [PR_URL] --squash --body "Auto-merged by vibe-kanban" --delete-branch

Note: You may see an error about checking out the branch - this is expected in a worktree and can be ignored.

If you decide NOT to merge, explain why but don't execute any merge commands.`;
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
        // Configure API
        const apiBaseUrl = process.env.VIBE_KANBAN_API_URL || 'http://localhost:9091';
        setApiConfig({
            baseUrl: apiBaseUrl,
            timeout: 30_000
        });

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

        // Get auto-merge prompt template (from parameter, preference, or default)
        let promptTemplate = customPrompt || preferences.autoMergePrompt;
        if (!promptTemplate) {
            promptTemplate = getAutoMergePromptTemplate();
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
            pullRequestTitle: `Task: ${task?.title || 'Unknown'}`,
            pullRequestDescription: task?.description || 'Auto-generated PR',
            pullRequestUrl: prUrl,
            branchName: process.env.GITHUB_HEAD_REF || taskAttempt.branch || 'feature-branch',
            baseBranch: preferences.baseBranch || taskAttempt.base_branch || 'main',
            worktreePath: process.cwd(),
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