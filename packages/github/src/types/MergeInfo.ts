import { PRInfo } from "./PRInfo";


export type MergeInfo = {
    type: 'pr';
    id: string;
    task_attempt_id: string;
    created_at: string;
    pr_info: PRInfo;
};
