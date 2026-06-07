import type { Chat, ChatMessage, ChatTarget, Idea, Meet, Passport, Place, Project, User } from '@shared/types';
import type { ExtendedMeet } from './components/MeetCard.tsx';
import { apiFetch, getAccessToken } from './api.ts';
import type { ProjectFormValues } from './ProjectForm';
import { useQuery } from '@tanstack/react-query';

export interface ExtendedProject extends Project {
  passport?: Passport;
  place?: {
    address: string;
    title: string;
    description: string;
  };
  meets?: ExtendedMeet[];
  users?: User[];
}

export type SendMessageResponse = {
  chatId: number;
  message: ChatMessage;
};

export async function fetchProject(id: string): Promise<ExtendedProject> {
  return apiFetch<ExtendedProject>(`/project/${id}`);
}

export interface ExtendedIdea extends Idea {
  user: User;
  projects: ExtendedProject[];
}

export async function fetchIdea(id: string): Promise<ExtendedIdea> {
  return apiFetch<ExtendedIdea>(`/idea/${id}`);
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
    }),
  });
}

export interface ExtendedMeetMap extends Meet {
  title: string;
}

export interface ExtendedPlace extends Place {
  meets: ExtendedMeetMap[];
}

export async function fetchPlaces(): Promise<ExtendedPlace[]> {
  return apiFetch<ExtendedPlace[]>('/places');
}

export async function fetchMessages(chatId: number): Promise<Chat> {
  return apiFetch<Chat>(`/chat/${chatId}`);
}

export async function fetchCreateChat({ target }: { target: ChatTarget }): Promise<number> {
  return apiFetch<any>('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target,
    }),
  });
}

export async function fetchSendMessage({
  chatId,
  message,
}: {
  chatId: number | null;
  message: string;
}): Promise<SendMessageResponse> {
  return apiFetch<SendMessageResponse>(`/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatId,
      message,
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

export async function createMeetUser(meetId: number) {
  return apiFetch('/meetUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ meetId, userId: 2 }),
  });
}

export async function deleteMeetUser(meetUserId: number) {
  return apiFetch(`/meetUser/${meetUserId}`, {
    method: 'DELETE',
  });
}

export async function generateImage(projectId: number) {
  return apiFetch(`/project/${projectId}/generateImage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: undefined,
  });
}

export type Type = 'self' | 'participation' | null;

interface ExtendedPassport extends Passport {
  users?: User[];
}

export async function fetchPassport(): Promise<ExtendedPassport> {
  return apiFetch<ExtendedPassport>('/passport');
}

export async function fetchProjects(type: Type, userId: number): Promise<Project[]> {
  return apiFetch<Project[]>('/projects' + '?variant=' + type + '&userId=' + userId);
}

export interface ExtendedIdea extends Idea {
  user: User;
}

export async function fetchIdeas(type: Type, userId?: number): Promise<ExtendedIdea[]> {
  return apiFetch<ExtendedIdea[]>('/ideas' + '?variant=' + type + (userId ? ('&userId=' + userId) : ''));
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
