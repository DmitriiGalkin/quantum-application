export interface PlaceDto {
  id: number;
  title: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  image: string | null;
  priceFrom: number | null;

  meets: MeetDto[];
}
