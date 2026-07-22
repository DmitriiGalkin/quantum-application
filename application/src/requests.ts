import type {
  ChatDto,
  ChatMessagesResult,
  CreateChatBody,
  CreateMessageDto,
  TeacherDashboardDto,
  CreateIdeaUser,
  DeleteIdeaUser,
  GetIdeasQuery,
  IdeaExtendedDto,
  IdeaFullDto,
  CreateMeet,
  CreateMeetUser,
  DeleteMeetUser,
  GetMeetsQuery,
  MeetDto,
  MeetExtendedDto,
  UpdateMeet,
  PassportExtendedDto,
  PaymentCreateDto,
  PaymentCreateResponseDto,
  PaymentDto,
  CreatePlace,
  PlaceFullDto,
  CreateProject,
  CreateProjectUser,
  ProjectFullDto,
  TeacherDto,
} from '@shared/types';
import { del, get, post, put, toQuery } from './api.ts';

export const fetchIdeas = (params: GetIdeasQuery) => get<IdeaExtendedDto[]>(`/ideas?${toQuery(params)}`);
export const fetchIdea = (id: string, params: GetIdeasQuery) => get<IdeaFullDto>(`/idea/${id}?${toQuery(params)}`);
export const fetchUserIdeas = (userId: number) => get<IdeaExtendedDto[]>(`/user/${userId}/ideas`);
export const fetchTeacherIdeas = () => get<IdeaExtendedDto[]>('/teacher/ideas');
export const generateImage = (ideaId: number) => post<void>(`/idea/${ideaId}/generateImage`, {});
export const fetchLike = (params: CreateIdeaUser) => post<void>('/ideaUser', params);
export const fetchUnlike = (params: DeleteIdeaUser) => del<void>(`/ideaUser?userId=${params.userId}&ideaId=${params.ideaId}`);

export const fetchChat = (chatId: number) => get<ChatDto>(`/chat/${chatId}`);
export const fetchCreateChat = (params: CreateChatBody) => post<number>('/chat', params);
export const fetchCreateChatMessages = (chatId: number, messages: CreateMessageDto[]) =>
  post<ChatMessagesResult>(`/chat/${chatId}/messages`, messages);

export const fetchProject = (id: string) => get<ProjectFullDto>(`/project/${id}`);
export const fetchCreateProject = (params: CreateProject) => post<number>('/project', params);
export const fetchUpdateProject = (id: number, params: CreateProject) => post<number>(`/project/${id}/update`, params);
export const fetchUserProjects = (userId: number) => get<ProjectFullDto[]>(`/user/${userId}/projects`);
export const fetchPassportProjects = () => get<ProjectFullDto[]>('/passport/projects');
export const fetchCreateProjectUser = (params: CreateProjectUser) => post<void>('/projectUser', params);
export const fetchProjectLeave = (id: number) => del<void>(`/project/${id}/leave`);

export const fetchMeets = (params: GetMeetsQuery) => get<MeetExtendedDto[]>(`/meets?${toQuery(params)}`);
export const fetchMeet = (id: number) => get<MeetDto>(`/meet/${id}`);
export const fetchCreateMeet = (params: CreateMeet) => post<void>('/meet', params);
export const fetchUpdateMeet = (id: number, params: UpdateMeet) => put<void>(`/meet/${id}`, params);
export const fetchDeleteMeet = (id: number) => del<void>(`/meet/${id}`);
export const fetchCreateMeetUser = (params: CreateMeetUser) => post<void>('/meetUser', params);
export const fetchDeleteMeetUser = ({ userId, meetId }: DeleteMeetUser) => del<void>(`/meetUser?userId=${userId}&meetId=${meetId}`);
export const fetchTeacherMeets = () => get<MeetExtendedDto[]>('/teacher/meets');

export const fetchPlace = (id: number) => get<PlaceFullDto>(`/place/${id}`);
export const fetchPlaces = () => get<PlaceFullDto[]>('/places');
export const fetchCreatePlace = (params: CreatePlace) => post<number>('/place', params);
export const fetchAddTeacher = (passportId: number) => post<void>('/place/teachers', { passportId });
export const fetchAddTeacher2 = (params: { passportId: number; placeId: number }) => post<number>(`/place/${params.placeId}/teacher`, params);
export const fetchPlaceTeachers = (id: number) => get<TeacherDto[]>(`/place/${id}/teachers`);
export const fetchPlaceProjects = (id: number) => get<ProjectFullDto[]>(`/place/${id}/projects`);
export const fetchRemoveTeacher = (passportId: number) => del<void>(`/place/teachers/${passportId}`);

export const fetchPassport = () => get<PassportExtendedDto>('/passport');
export const fetchCreateUser = (params: { title: string; description?: string }) => post<number>('/user', params);

export const fetchPayment = (id: number) => get<PaymentDto>(`/payment/${id}`);
export const fetchCreatePayment = (params: PaymentCreateDto) => post<PaymentCreateResponseDto>('/payments', params);

export const fetchTeacherDashboard = () => get<TeacherDashboardDto>(`/teacher/dashboard`);
