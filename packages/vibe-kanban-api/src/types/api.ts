/**
 * Normalized API Response wrapper - all endpoints return this format
 */
export type ApiResponse<T, E = any> = {
  success: boolean;
  data: T;
  error_data: E | null;
  message: string | null;
};

/**
 * Task status values
 */
export type TaskStatus = 'todo' | 'inprogress' | 'inreview' | 'done' | 'cancelled';

/**
 * Task execution status information
 */
export type TaskExecutionStatus = {
  has_in_progress_attempt: boolean;
  has_merged_attempt: boolean;
  last_attempt_failed: boolean;
  executor: string;
};

/**
 * Complete task with execution status (from list tasks API)
 */
export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  parent_task_attempt: string | null;
  created_at: string;
  updated_at: string;
} & TaskExecutionStatus;

/**
 * Basic task (from create/get single task APIs)
 */
export type BasicTask = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  parent_task_attempt: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Task creation request
 */
export type CreateTaskRequest = {
  project_id: string;
  title: string;
  description?: string | null;
  parent_task_attempt?: string | null;
  image_ids?: string[] | null;
};

/**
 * Available executors
 */
export type ExecutorType = 'CLAUDE_CODE' | 'GEMINI' | 'CODEX' | 'AMP' | 'OPENCODE' | 'CURSOR' | 'QWEN_CODE';

/**
 * Executor profile
 */
export type ExecutorProfile = {
  executor: ExecutorType;
  variant: string | null;
};

/**
 * Task attempt data
 */
export type TaskAttempt = {
  id: string;
  task_id: string;
  executor: string;
  base_branch: string;
  branch: string | null;
  created_at: string;
};

/**
 * Task attempt creation request
 */
export type CreateTaskAttemptRequest = {
  task_id: string;
  executor_profile_id: ExecutorProfile;
  base_branch: string;
};

/**
 * Follow-up request
 */
export type FollowUpRequest = {
  prompt: string;
  variant?: string | null;
  image_ids?: string[] | null;
};

/**
 * Pull request creation request
 */
export type CreatePRRequest = {
  title: string;
  body?: string | null;
  base_branch?: string | null;
};

/**
 * Project data
 */
export type Project = {
  id: string;
  name: string;
  git_repo_path: string;
  setup_script: string | null;
  dev_script: string | null;
  cleanup_script: string | null;
  copy_files: string[] | null;
  created_at: string;
  updated_at: string;
};

/**
 * Pull request information
 */
export type PRInfo = {
  number: number;
  url: string;
  status: 'open' | 'merged' | 'closed';
  merged_at: string | null;
  merge_commit_sha: string | null;
};

/**
 * Merge information
 */
export type MergeInfo = {
  type: 'pr';
  id: string;
  task_attempt_id: string;
  created_at: string;
  target_branch_name: string;
  pr_info: PRInfo;
};

/**
 * Branch status information
 */
export type BranchStatus = {
  commits_behind: number | null;
  commits_ahead: number | null;
  has_uncommitted_changes: boolean | null;
  head_oid: string;
  uncommitted_count: number;
  untracked_count: number;
  base_branch_name: string;
  remote_commits_behind: number | null;
  remote_commits_ahead: number | null;
  merges: MergeInfo[];
};

/**
 * Container info (from cleanup package)
 */
export type ContainerInfo = {
  attempt_id: string;
  task_id: string;
  project_id: string;
};

/**
 * Branch information
 */
export type BranchInfo = {
  name: string;
  is_current: boolean;
  is_remote: boolean;
  last_commit_date: string;
};

/**
 * Project branches response
 */
export type ProjectBranchesResponse = {
  projectId: string;
  projectName: string;
  branches: BranchInfo[];
};

/**
 * API Configuration
 */
export type ApiConfig = {
  baseUrl: string;
  timeout: number;
};