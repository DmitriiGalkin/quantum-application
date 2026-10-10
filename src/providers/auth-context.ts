import { createContext, useContext } from 'react';
import type { ActiveRole, PassportExtendedDto } from 'entities';
import type { QueryObserverResult } from '@tanstack/react-query';

export interface AuthContextValue {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  authHandler: (next?: string) => void;
  refetch: () => Promise<QueryObserverResult<PassportExtendedDto, Error>>;
  passport: PassportExtendedDto | null;
  role: ActiveRole;
  userId?: number;
  placeId?: number;
  switchUser: (userId: number) => void;
  switchTeacher: () => void;
  switchPlace: (placeId: number) => void;
  isPending: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth requires AuthProvider');
  return value;
}
