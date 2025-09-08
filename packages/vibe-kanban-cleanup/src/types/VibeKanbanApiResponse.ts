export type VibeKanbanApiResponse<T> = {
    success: boolean;
    data: T;
    error_data: any;
    message: string | null;
};