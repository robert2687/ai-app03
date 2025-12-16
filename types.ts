
export enum AgentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  model: string;
  systemInstruction?: string;
  tools?: string[];
  input: {
    title: string;
    content: string;
    language: string;
  } | null;
  output: {
    title: string;
    content: string;
    language: string;
  } | null;
  processingTime: number; // Estimated, mostly for UI pacing if needed
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
