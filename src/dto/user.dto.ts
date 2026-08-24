export interface UserDto {
  id: number;
  title: string;
  description?: string | null;
  age: number | null;
  image: string | null;
}
