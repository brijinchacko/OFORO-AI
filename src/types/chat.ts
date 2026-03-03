export interface Model {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  productUrl?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchImage {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
}

export interface UploadedFile {
  fileName: string;
  fileType: string;
  content: string;
  base64?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  sources?: SearchResult[];
  images?: SearchImage[];
  timestamp: Date;
  attachment?: UploadedFile;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  pinned?: boolean;
}

export interface VoiceThread {
  id: string;
  title: string;
  messages: { id: string; role: "user" | "assistant"; text: string; timestamp: number }[];
  createdAt: number;
  updatedAt: number;
}
