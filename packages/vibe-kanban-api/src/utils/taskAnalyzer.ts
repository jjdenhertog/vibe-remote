import type { Task } from '../types/api';

/**
 * Simple project analysis result - only focuses on blocking conditions
 */
export type ProjectAnalysis = {
    projectId: string;
    tasks: Task[];
    shouldStop: boolean;
    stopReason?: string;
    inReviewTasks: Task[];
    inProgressTasks: Task[];
};

/**
 * Analyze project to determine if we should proceed with Claude task selection
 * Only checks for blocking conditions - leaves task selection to Claude
 */
export function analyzeProject(projectId: string, tasks: Task[]): ProjectAnalysis {
    // Find blocking tasks
    const inReviewTasks = tasks.filter(t => t.status === 'inreview');
    const inProgressTasks = tasks.filter(t => t.status === 'inprogress');
    
    // Determine if we should stop (blocking conditions)
    const hasInReviewTasks = inReviewTasks.length > 0;
    const hasInProgressTasks = inProgressTasks.length > 0;
    const shouldStop = hasInReviewTasks || hasInProgressTasks;
    
    // Generate stop reason if needed
    let stopReason: string | undefined;
    if (hasInReviewTasks) {
        stopReason = `${inReviewTasks.length} task(s) in review need attention first`;
    } else if (hasInProgressTasks) {
        stopReason = `${inProgressTasks.length} task(s) already in progress`;
    }
    
    const result: ProjectAnalysis = {
        projectId,
        tasks,
        shouldStop,
        inReviewTasks,
        inProgressTasks
    };
    
    if (stopReason) {
        result.stopReason = stopReason;
    }
    
    return result;
}