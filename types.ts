export enum SupportedLanguage {
  Hindi = 'Hindi',
  Tamil = 'Tamil',
  Telugu = 'Telugu',
  Kannada = 'Kannada',
  Malayalam = 'Malayalam',
  Marathi = 'Marathi',
  Gujarati = 'Gujarati',
  Bengali = 'Bengali',
  English = 'English'
}

export interface AppConfig {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  speechSpeed: number; // 0.5 to 2.0
}

export interface HistoryItem {
  id: string;
  text: string;
  type: 'TTS' | 'STT';
  timestamp: number;
  language: SupportedLanguage;
}

export type ViewMode = 'TTS' | 'STT' | 'HISTORY';