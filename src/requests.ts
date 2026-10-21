import {
  type Conversation,
  type ConversationHistory,
  type CreateIdea,
  type CreateIdeaUser,
  type CreateLocation,
  type CreateMeet,
  type CreateMeetUser,
  type CreatePlace,
  type CreateProject,
  type CreateProjectUser,
  type DeleteIdeaUser,
  type DeleteMeetUser,
  type GetIdeasQuery,
  type GetProjectsQuery,
  type IdeaDto,
  type IdeaDashboard,
  type MeetDto,
  type MeetStatus,
  type Message,
  type NotificationPage,
  type PassportExtendedDto,
  type PaymentCreateDto,
  type PaymentCreateResponseDto,
  type PaymentDto,
  type PlaceDashboardDto,
  type PlaceDto,
  type PlaceStatsDto,
  type ProjectDto,
  type ProjectCampaign,
  type CreateProjectCampaign,
  type StartConversationResponse,
  type TeacherDashboardDto,
  type TeacherDto,
  type TeacherPublicDto,
  type UpdateMeet,
  type UpdatePassportInput,
  type UserDashboardDto,
  type UserDto,
  type UpdateUserInput,
} from 'entities';
import { del, get, post, put, patch, toQuery, postMultipart } from './utils/api.ts';
import type { PlaceFormValues } from './features/place/PlaceForm.tsx';
import { campaignVisitorId } from './shared/lib/campaign-visitor.ts';
export const fetchMessageReceipt = (id: number, messageId: number, read: boolean) => put<void>(`/conversation/${id}/receipt`, { messageId,read });
export const fetchNotifications = (unreadOnly = false, beforeId: number | null = null) =>
  get<NotificationPage>(`/notifications?unread=${unreadOnly}${beforeId === null ? '' : `&beforeId=${beforeId}`}`);
export const fetchNotificationUnreadCount = () => get<{ count: number }>('/notifications/unread-count');
export const fetchReadNotification = (id: number) => put<void>(`/notification/${id}/read`, {});
export const fetchPushConfig = () => get<{ publicKey: string | null }>('/push/config');
export const fetchPushSubscribe = (subscription: PushSubscriptionJSON) => post<void>('/push/subscription',subscription);
export const fetchPushUnsubscribe = (endpoint: string) => post<void>('/push/unsubscribe',{ endpoint });
import type { PlaceProfile, RoomDto, UpdateLocation } from 'entities';

export const fetchPlaceProfile = (id: number) => get<PlaceProfile>(`/place/${id}/profile`);
export const fetchUpdateLocation = (id: number, body: UpdateLocation) => put<void>(`/place/location/${id}`, body);
export const fetchDeleteLocation = (id: number) => del<void>(`/place/location/${id}`);

export const fetchIdeas = (params: GetIdeasQuery) => get<IdeaDto[]>(`/ideas${toQuery(params)}`);
export const fetchProjects = (params: GetProjectsQuery) => get<ProjectDto[]>(`/projects${toQuery(params)}`);
export const fetchIdea = (id: string, params: GetIdeasQuery) => get<IdeaDashboard>(`/idea/${id}${toQuery(params)}`);
export const fetchCreateIdea = (params: CreateIdea) => post<number>('/idea', params);
export const fetchUpdateIdea = (id: number, params: CreateIdea) => put<IdeaDto>(`/idea/${id}`, params);
export const uploadIdeaPhoto = (file: File) => {
  const body = new FormData();
  body.append('image', file);
  return postMultipart<{ url: string }>('/image', body);
};
export const fetchUserIdeas = () => get<IdeaDto[]>(`/user/ideas`);
export const fetchTeacherIdeas = () => get<import('entities').TeacherStudentIdeaDto[]>('/teacher/ideas');
export const generateImage = (ideaId: number) => post<void>(`/idea/${ideaId}/generateImage`, {});
export const fetchLike = (params: CreateIdeaUser) => post<void>('/ideaUser', params);
export const fetchUnlike = (params: DeleteIdeaUser) => del<void>(`/ideaUser?userId=${params.userId}&ideaId=${params.ideaId}`);

export const fetchProject = (id: string) => get<ProjectDto>(`/project/${id}`);
export const fetchCreateProject = (params: CreateProject) => post<number>('/project', params);
export const fetchUpdateProject = (id: number, params: CreateProject) => post<number>(`/project/${id}/update`, params);
export const fetchUserProjects = () => get<ProjectDto[]>(`/user/projects`);
export const fetchPassportProjects = () => get<ProjectDto[]>('/passport/projects');
export const fetchCreateProjectUser = (params: CreateProjectUser) => post<void>('/projectUser', params);
export const fetchProjectLeave = (id: number) => del<void>(`/project/${id}/leave`);

export const fetchMeets = () => get<MeetDto[]>(`/user/meets`);
export const fetchCreateMeet = (params: CreateMeet) => post<void>('/meet', params);
export const fetchUpdateMeet = (id: number, params: UpdateMeet) => put<void>(`/meet/${id}`, params);
export const fetchUpdateMeetStatus = (id: number, params: { status: MeetStatus; reason?: string }) => put<void>(`/meet/${id}/status`, params);
export const fetchCancelBooking = (id: number, reason: string, full = false) => post<void>(`/meet/${id}/cancel-booking`,{ reason,full });
export const fetchMeetChange = (id: number,userId: number) => get<{ revision:number; response?:string }>(`/meet/${id}/change?userId=${userId}`);
export const fetchMeetChangeResponse = (id: number,userId: number,revision: number,accepted: boolean) => post<void>(`/meet/${id}/change-response`,{ userId,revision,accepted });
export const fetchDeleteMeet = (id: number) => del<void>(`/meet/${id}`);
export const fetchCreateMeetUser = (params: CreateMeetUser) => post<void>('/meetUser', { ...params, visitorId: campaignVisitorId() });
export const fetchDeleteMeetUser = ({ userId, meetId }: DeleteMeetUser) => del<void>(`/meetUser?userId=${userId}&meetId=${meetId}`);
export const fetchTeacherMeets = () => get<MeetDto[]>('/teacher/meets');

export const fetchPlace = (id: number) => get<PlaceDto>(`/place/${id}`);
export const fetchPlaces = () => get<PlaceDto[]>('/places');
export const fetchCreatePlace = (params: CreatePlace) => post<number>('/place', params);
export const fetchUpdatePlace = (params: PlaceFormValues) => put<void>(`/place`, params);
export const fetchAddTeacher = (passportId: number) => post<void>('/place/teachers', { targetPassportId: passportId });
export const fetchAddTeacher2 = (params: { passportId: number; placeId: number }) => post<number>(`/place/${params.placeId}/teacher`, params);
export const fetchCreateLocation = (params: CreateLocation) => post<number>('/place/location', params);
export const fetchPlaceDashboard = () => get<PlaceDashboardDto>(`/place/dashboard`);
export const fetchPlaceStats = (days: 7 | 30 | 90) => get<PlaceStatsDto>(`/place/stats?days=${days}`);
export const fetchPlaceTeachers = () => get<TeacherDto[]>(`/place/teachers`);
export const fetchPlaceProjects = () => get<ProjectDto[]>(`/place/projects`);
export const fetchPlaceMeets = () => get<MeetDto[]>(`/place/meets`);
export const fetchPlaceUsers = () => get<UserDto[]>(`/place/users`);
export const fetchPlaceLocations = () => get<RoomDto[]>(`/place/locations`);
export const fetchLocationsByPlace = (placeId: number) => get<RoomDto[]>(`/place/${placeId}/locations`);
export const fetchRemoveTeacher = (placeId: number, passportId: number) => del<void>(`/place/${placeId}/teacher/${passportId}`);
export const fetchLeavePlace = (id: number) => del<void>(`/place/${id}/leave`);

export const fetchPassport = () => get<PassportExtendedDto>('/passport');
export const fetchUpdatePassport = (params: UpdatePassportInput) => put<void>('/passport', params);
export const fetchCreateUser = (params: { title: string; description?: string }) => post<number>('/user', params);
export const fetchUpdateUser = (id: number, params: UpdateUserInput) => put<void>(`/user/${id}`, params);

export const fetchPayment = (id: number) => get<PaymentDto>(`/payment/${id}`);
export const fetchCreatePayment = (params: PaymentCreateDto) => post<PaymentCreateResponseDto>('/payments', params);

export const fetchUser = (id: number) => get<UserDto>(`/users/${id}`);
export const fetchUserDashboard = () => get<UserDashboardDto>(`/user/dashboard`);

export const fetchTeacher = (id: number) => get<TeacherPublicDto>(`/teachers/${id}`);
export const fetchTeacherDashboard = () => get<TeacherDashboardDto>(`/teacher/dashboard`);
export const fetchProjectCampaigns = (projectId: number) => get<ProjectCampaign[]>(`/project/${projectId}/campaigns`);
export const fetchCreateProjectCampaign = (body: CreateProjectCampaign) => post<number>('/project-campaign', body);
export const fetchCampaignVisit = (token: string, projectId: number, visitorId: string) => post<void>('/project-campaign/visit', { token, projectId, visitorId });

// Conversation methods
export const fetchConversations = () => get<Conversation[]>('/conversation');
export const fetchStartChat = (passportId: number) => post<StartConversationResponse>('/conversation/start', { targetPassportId: passportId });
export const fetchConversation = (id: number) => get<ConversationHistory>(`/conversation/${id}`);

// Message methods
export const fetchCreateMessage = (conversationId: number, content: string) => post<Message>(`/conversation/${conversationId}/messages`, { content });
export const fetchUpdateMessage = (id: number, content: string) => patch<void>(`/message2s/${id}`, { content });
export const fetchDeleteMessage = (id: number) => del<void>(`/message2s/${id}`);

export const fetchParentConversation = (userId: number) => post<import('entities').StartConversationResponse>(`/user/${userId}/parent-conversation`, {});
