export type CreatePRRequest = {
    title: string;
    body?: string;
    base_branch?: string;
}