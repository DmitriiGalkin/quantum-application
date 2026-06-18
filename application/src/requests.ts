import {
  type ChatDto,
  type ChatMessagesResult,
  type CreateChatBody,
  type CreateChatMessages,
  type CreateIdeaUser,
  type CreateMeetUser,
  type DeleteIdeaUser,
  type DeleteMeetUser, type GetIdeasQuery,
  type IdeaExtendedDto,
  type IdeaFullDto,
  type PassportExtendedDto,
  type PlaceFullDto,
  type ProjectDto,
  type ProjectFullDto,
} from '@shared/types';
import { api } from './api.ts';

export async function fetchProject(id: string) {
  return api<ProjectFullDto>(`/project/${id}`);
}

export async function fetchIdea(id: string) {
  return api<IdeaFullDto>(`/idea/${id}`);
}

export async function createProject(ideaId: number): Promise<number> {
  return api<number>('/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ideaId,
    }),
  });
}

export async function fetchPlaces() {
  return api<PlaceFullDto[]>('/places');
}

export async function fetchChat(chatId: number): Promise<ChatDto> {
  return api<ChatDto>(`/chat/${chatId}`);
}

export async function fetchCreateChat({ target, userId, projectId, ideaId }: CreateChatBody): Promise<number> {
  return api<number>('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target,
      userId,
      projectId,
      ideaId,
    }),
  });
}

export async function fetchCreateChatMessages({ chatId, messages }: CreateChatMessages): Promise<ChatMessagesResult> {
  return api(`/chat/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
    }),
  });
}

export async function createMeetUser(params: CreateMeetUser) {
  return api('/meetUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
}

export async function deleteMeetUser(meetUserId: number) {
  return api(`/meetUser/${meetUserId}`, {
    method: 'DELETE',
  });
}

export async function generateImage(ideaId: number) {
  return api(`/idea/${ideaId}/generateImage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: undefined,
  });
}

export async function fetchPassport() {
  return api<PassportExtendedDto>('/passport');
}

export async function fetchProjects(): Promise<ProjectDto[]> {
  return api<ProjectDto[]>('/projects');
}

export async function fetchUserProjects(userId: number) {
  return api<ProjectFullDto[]>(`/user/${userId}/projects`);
}

export async function fetchPassportProjects() {
  return api<ProjectFullDto[]>(`/passport/projects`);
}

export async function fetchIdeas({ when, sort, latitude, longitude }: GetIdeasQuery) {
  return api<IdeaExtendedDto[]>(`/ideas?sort=${sort}&latitude=${latitude}&longitude=${longitude}&when=${when}`);
}

export async function fetchUserIdeas(userId: number) {
  return api<IdeaExtendedDto[]>(`/user/${userId}/ideas`);
}

export async function fetchLike({ userId, ideaId }: CreateIdeaUser): Promise<void> {
  return api<void>('/ideaUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, ideaId }),
  });
}

export async function fetchUnlike({ userId, ideaId }: DeleteIdeaUser): Promise<void> {
  return api<void>(`/ideaUser?userId=${userId}&ideaId=${ideaId}`, {
    method: 'DELETE',
  });
}

export async function fetchCreateMeetUser({ userId, meetId }: CreateMeetUser): Promise<void> {
  return api<void>('/meetUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, meetId }),
  });
}

export async function fetchDeleteMeetUser({ userId, meetId }: DeleteMeetUser): Promise<void> {
  return api<void>(`/meetUser?userId=${userId}&meetId=${meetId}`, {
    method: 'DELETE',
  });
}