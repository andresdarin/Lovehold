export type Environment = 'development' | 'test' | 'production'
export type PlaygroundMode = 'sandbox' | 'real_readonly'
export type AiRecord = Record<string, any>

export interface AiState { data: any; loading: boolean; error: string | null; refresh: () => void }
