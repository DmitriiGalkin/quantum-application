import type { Project, User } from './types';

export type SpeechRecognitionConstructor = new () => SpeechRecognition;

export type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export type SpeechRecognitionEvent = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
};

interface Meta {
  target: string;
  data: Project | User;
}

export function getObjectFromMetadata(metadata: unknown): Meta | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === 'string') {
    try {
      console.log(metadata, 'metadata metadata');

      console.log(JSON.parse(metadata), 'getProjectFromMetadata metadata');
      const m = JSON.parse(metadata);

      return m as Meta;
    } catch {
      return null;
    }
  }

  return metadata as Meta;
}
