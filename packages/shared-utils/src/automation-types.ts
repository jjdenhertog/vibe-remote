/**
 * Consolidated automation settings type for Vibe Kanban.
 * This type is shared across all components and preferences.
 */
export type AutomationSettings = {
    automaticallyCreatePR: boolean;
    doCodeReviewBeforeFinishing: boolean;
    automaticTaskPicking: boolean;
    baseBranch: string;
    automaticallyMergePR: boolean;
    mergeDecisionMode: 'always' | 'claude-decision';
    claudeMergePrompt: string;
};

/**
 * Default automation settings used when no preferences are found.
 */
export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
    automaticallyCreatePR: false,
    doCodeReviewBeforeFinishing: false,
    automaticTaskPicking: false,
    baseBranch: 'main',
    automaticallyMergePR: false,
    mergeDecisionMode: 'always',
    claudeMergePrompt: 'Review this pull request and decide if it should be automatically merged.\n\n## Quick Assessment (Score 1-10):\n\n**1. Code Quality (40%)**\n- Clean, readable code\n- No obvious bugs or issues\n- Follows existing patterns\n\n**2. Safety & Risk (35%)**\n- No breaking changes\n- No security issues\n- Safe to deploy\n\n**3. Completeness (25%)**\n- Feature/fix is complete\n- No work-in-progress code\n- Addresses the requirements\n\n## Decision:\n\n**MERGE if total score ≥ 7/10**\n\n### If MERGING:\n```\nSCORE: [X]/10\nDECISION: MERGE\nREASON: [brief why]\n\ngh pr merge {{PR_URL}} --squash --body "Auto-merged: [X]/10" --delete-branch\n```\n\n### If NOT MERGING:\n```\nSCORE: [X]/10\nDECISION: DO NOT MERGE\nREASON: [main issues]\n```\n\nBe pragmatic - focus on shipping working code, not perfection.'
};