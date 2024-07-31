export interface IChat {
    id: number;
    sender: 'user' | 'ai';
    question: string;
    answer?: string;
    timestamp: string;
}