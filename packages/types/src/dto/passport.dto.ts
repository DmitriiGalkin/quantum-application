export interface PassportDto {
  id: number;
  title: string;
  description: string | null;
  users: {
    id: number;
    title: string;
    age: number | null;
    image: string | null;
  }[];
}
