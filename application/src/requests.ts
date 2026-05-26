import { apiFetch, getAccessToken } from './api';
import type { Passport, Place, Project, User } from './types';
import type { ExtendedMeet } from './MeetCard';
import type { ProjectFormValues } from './ProjectForm';
import { useQuery } from '@tanstack/react-query';

export interface ExtendedProject extends Project {
  passport?: {
    title: string;
  };
  place?: {
    address: string;
    title: string;
    description: string;
  };
  meets?: ExtendedMeet[];
  participations?: {
    age: null;
    title: string;
    id: string;
    image: string;
  }[];
}

export type ChatTarget = 'user' | 'idea' | 'project' | 'none';

export type Workflow = 'user_idea_passport' | 'passport_project' | 'idea';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: number;
  chatId: number;
  passportId: number | null;
  role: ChatMessageRole;
  content: string;
  source: 'text' | 'voice';
  metadata: unknown;
  createdAt: string;
};

export type Chat = {
  target: ChatTarget;
  messages: ChatMessage[];
};

export type SendMessageResponse = {
  chatId: number;
  message: ChatMessage;
};

export async function fetchProject(id: string): Promise<ExtendedProject> {
  return apiFetch<ExtendedProject>(`/project/${id}`);
}

export async function createProject(values: ProjectFormValues): Promise<number> {
  return apiFetch<number>('/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: values.title,
      description: values.description,
      image: values.image || null,
    }),
  });
}

export async function updateProject(projectId: number, values: ProjectFormValues) {
  return apiFetch(`/project/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: values.title,
      description: values.description,
      image: values.image || null,
    }),
  });
}

export async function fetchPlaces(): Promise<Place[]> {
  return apiFetch<Place[]>('/places');
}

export async function fetchMessages(chatId: number): Promise<Chat> {
  return apiFetch<Chat>(`/chat/${chatId}`);
}

export async function fetchCreateChat({ workflow }: { workflow: Workflow }): Promise<number> {
  return apiFetch<any>('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow,
    }),
  });
}

export async function fetchSendMessage({
  chatId,
  message,
  target,
}: {
  chatId: number | null;
  message: string;
  target: ChatTarget;
}): Promise<SendMessageResponse> {
  return apiFetch<SendMessageResponse>('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatId,
      message,
      target,
    }),
  });
}

export async function createUser(user: User): Promise<{ id: number; message: string }> {
  return apiFetch<{ id: number; message: string }>('/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
}

export async function createVisit(meetId: number) {
  return apiFetch('/visit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ meetId, userId: 2 }),
  });
}

export async function deleteVisit(visitId: number) {
  return apiFetch(`/visit/${visitId}`, {
    method: 'DELETE',
  });
}

export async function generateImage(messageId: number) {
  return apiFetch(`/message/${messageId}/generateImage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: undefined,
  });
}

export type Type = 'self' | 'ideas' | 'projects' | null;

interface ExtendedPassport extends Passport {
  users?: User[];
}

export async function fetchPassport(): Promise<ExtendedPassport> {
  return apiFetch<ExtendedPassport>('/passport');
}

export async function fetchProjects(type: Type, userId: number): Promise<Project[]> {
  return apiFetch<Project[]>('/projects' + '?variant=' + type + '&userId=' + userId);
}

export const usePassport = () => {
  const accessToken = getAccessToken();

  const { data: passport } = useQuery({
    queryKey: ['passport'],
    queryFn: fetchPassport,
    enabled: Boolean(accessToken),
  });

  return passport;
};
