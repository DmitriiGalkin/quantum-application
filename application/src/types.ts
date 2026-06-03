export interface Meet {
  id: number;
  projectId: number;
  price: number | null;
  duration: string | null;
  startedAt: string;
  deletedAt: string | null;
  passportId: number | null;
}

export interface User {
  id: number | null;
  passportId: number | null;
  title: string | null;
  description: string | null;
  age: number | null;
  image: string | null;
  createdAt: string | null;
  deletedAt: string | null;
}

export interface Passport {
  id: number | null;
  provider: string | null;
  providerId: string | null;
  title: string | null;
  description?: string | null;
  email: string | null;
  image: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  accessToken: string | null;
}

export interface Project {
  id: number;
  userId: number | null;
  passportId: number | null;
  placeId: number | null;
  ideaId: number | null;
  latitude: number | null;
  longitude: number | null;
  title: string | null;
  description: string | null;
  image?: string | null;
  deletedAt: string | null;
}

export interface Idea {
  id: number;
  userId: number | null;
  passportId: number | null;
  title: string | null;
  description: string | null;
  image: string | null;
  deletedAt: string | null;
}

export interface Place {
  id: number;
  title?: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  image?: string;
}

export interface Visit {
  id: number;
  meetId: number;
  userId: number;
}

export interface IdeaUser {
  id: number;
  ideaId: number;
  userId: number;
}

export interface ProjectUser {
  id: number;
  projectId: number;
  userId: number;
}
