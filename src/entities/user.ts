export interface User {
  id: number;
  passportId: number;
  title: string;
  description: string;
  age: number | null;
  image: string | null;
}

export interface UserWithMeet extends User {
  meetUserId: number;
}