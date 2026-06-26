import {
  type ChatDto,
  type ChatMessagesResult,
  type CreateChatBody,
  type CreateMessageDto,
  type CreateIdeaUser,
  type CreateMeet,
  type CreateMeetUser,
  type CreatePlace,
  type CreateProject,
  type CreateProjectUser,
  type DeleteIdeaUser,
  type DeleteMeetUser,
  type DeleteProjectUser,
  type GetIdeasQuery,
  type IdeaExtendedDto,
  type IdeaFullDto,
  type MeetDto,
  type PassportExtendedDto,
  type PlaceFullDto,
  type ProjectDto,
  type ProjectFullDto,
  type TeacherDto,
  type UpdateMeet,
} from '@shared/types';
import { del, get, post, put, toQuery } from './api.ts';

export const fetchIdea = (id: string, params: GetIdeasQuery) => get<IdeaFullDto>(`/idea/${id}?${toQuery(params)}`);
export const fetchCreateChatMessages = (chatId: number, messages: CreateMessageDto[]) => post<ChatMessagesResult>(`/chat/${chatId}/messages`, messages);
export const fetchIdeas = (params: GetIdeasQuery) => get<IdeaExtendedDto[]>(`/ideas?${toQuery(params)}`);
export const fetchCreateProject = (params: CreateProject) => post<number>('/project', params);
export const fetchProject = (id: string) => get<ProjectFullDto>(`/project/${id}`);
export const createProject = (ideaId: number) => post<number>('/project', { ideaId });
export const fetchPlaces = () => get<PlaceFullDto[]>('/places');
export const fetchChat = (chatId: number) => get<ChatDto>(`/chat/${chatId}`);
export const fetchCreateChat = (params: CreateChatBody) => post<number>('/chat', params);
export const createMeetUser = (params: CreateMeetUser) => post<void>('/meetUser', params);
export const deleteMeetUser = (meetUserId: number) => del<void>(`/meetUser/${meetUserId}`);
export const generateImage = (ideaId: number) => post<void>(`/idea/${ideaId}/generateImage`, {});
export const fetchPassport = () => get<PassportExtendedDto>('/passport');
export const fetchUserIdeas = (userId: number) => get<IdeaExtendedDto[]>(`/user/${userId}/ideas`);
export const fetchCreateUser = (params: { title: string; description?: string }) => post<number>('/user', params);
export const fetchProjects = () => get<ProjectDto[]>('/projects');
export const fetchUserProjects = (userId: number) => get<ProjectFullDto[]>(`/user/${userId}/projects`);
export const fetchPassportProjects = () => get<ProjectFullDto[]>('/passport/projects');
export const fetchCreateMeet = (params: CreateMeet) => post<void>('/meet', params);
export const fetchLike = (params: CreateIdeaUser) => post<void> ('/ideaUser', params);
export const fetchUnlike = (params: DeleteIdeaUser) => del<void>(`/ideaUser?userId=${params.userId}&ideaId=${params.ideaId}`);
export const fetchCreateMeetUser = (params: CreateMeetUser) => post<void>('/meetUser', params);
export const fetchDeleteMeetUser = ({ userId, meetId }: DeleteMeetUser) => del<void>(`/meetUser?userId=${userId}&meetId=${meetId}`);
export const fetchMeet = (id: number) => get<MeetDto>(`/meet/${id}`);
export const fetchUpdateMeet = (id: number, params: UpdateMeet) => put<void>(`/meet/${id}`, params);
export const fetchCreateProjectUser = (params: CreateProjectUser) => post<void>('/projectUser', params);
export const fetchDeleteProjectUser = (params: DeleteProjectUser) => del<void>(`/projectUser?userId=${params.userId}&projectId=${params.projectId}`);
export const fetchTeacherMeets = () => get<MeetDto[]>('/teacher/meets');
export const fetchTeacherIdeas = () => get<IdeaExtendedDto[]>('/teacher/ideas');
export const fetchCreatePlace = (params: CreatePlace) => post<void>('/place', params);
export const fetchAddTeacher = (passportId: number) => post<void>('/place/teachers', { passportId });
export const fetchPlaceTeachers = () => get<TeacherDto[]>('/place/teachers');
export const fetchRemoveTeacher = (passportId: number) => del<void>(`/place/teachers/${passportId}`);