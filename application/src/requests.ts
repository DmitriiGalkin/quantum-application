import type { Chat, ChatTarget, IParams, IdeaDto, ProjectDto, PassportDto, PlaceDto } from '@shared/types';
import { apiFetch, getAccessToken } from './api.ts';
import type { ProjectFormValues } from './ProjectForm';
import { useQuery } from '@tanstack/react-query';

export async function fetchProject(id: string): Promise<ProjectDto> {
  return apiFetch<ProjectDto>(`/project/${id}`);
}

export async function fetchIdea(id: string): Promise<IdeaDto> {
  return apiFetch<IdeaDto>(`/idea/${id}`);
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

// export interface ExtendedMeetMap extends Meet {
//   title: string;
// }

export async function fetchPlaces(): Promise<PlaceDto[]> {
  return apiFetch<PlaceDto[]>('/places');
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

export async function fetchSendMessage({ chatId, message }: { chatId: number | null; message: string }): Promise<any> {
  return apiFetch<any>(`/message`, {
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

export async function createUser(user: any): Promise<{ id: number; message: string }> {
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


export async function fetchPassport(): Promise<PassportDto> {
  return apiFetch<PassportDto>('/passport');
}

export async function fetchProjects(): Promise<ProjectDto[]> {
  return apiFetch<ProjectDto[]>('/projects');
}

export async function fetchUserProjects({ userId }: IParams): Promise<ProjectDto[]> {
  return apiFetch<ProjectDto[]>(`/user/${userId}/projects`);
}

export async function fetchPassportProjects(): Promise<ProjectDto[]> {
  return apiFetch<ProjectDto[]>(`/passport/projects`);
}

export async function fetchIdeas(): Promise<IdeaDto[]> {
  return apiFetch<IdeaDto[]>('/ideas?currentUserId=2');
}

export async function fetchUserIdeas({ userId }: IParams): Promise<IdeaDto[]> {
  return apiFetch<IdeaDto[]>(`/user/${userId}/ideas`);
}

export async function fetchLike({ userId, ideaId }: IParams): Promise<IdeaDto[]> {
  return apiFetch<IdeaDto[]>(`/ideaUser?userId=${userId}&ideaId=${ideaId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: undefined,
  });
}

export async function fetchUnlike({ userId, ideaId }: IParams): Promise<IdeaDto[]> {
  return apiFetch<IdeaDto[]>(`/ideaUser?userId=${userId}&ideaId=${ideaId}`, {
    method: 'DELETE',
  });
}

;

export const usePassport = () => {
  const accessToken = getAccessToken();

  const { data: passport } = useQuery({
    queryKey: ['passport'],
    queryFn: fetchPassport,
    enabled: Boolean(accessToken),
  });

  return passport;
};
