import type { RowDataPacket } from 'mysql2/promise';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

/** Original catalog fields remain intact, including unknown fields and explicit nulls. */
export interface IdeaPhoto extends Record<string, JsonValue> {
  id: string;
  fileName: string;
  driveFileId: string;
  url: string;
  isCover: boolean;
}

export interface IdeaCardInput extends Record<string, JsonValue> {
  id: string;
  name: string;
  description: string;
  photos: IdeaPhoto[];
}

export interface IdeaCatalog extends Record<string, JsonValue> {
  schemaVersion: number;
  items: IdeaCardInput[];
}

export interface IdeaCard extends IdeaCardInput {
  ideaId: number;
}

export interface IdeaCardRow extends RowDataPacket {
  id: number;
  passportId: number | null;
  catalogId: string;
  cardData: Record<string, JsonValue> | string;
  catalogMetadata: Record<string, JsonValue> | string | null;
}

export interface IdeaPhotoRow extends RowDataPacket {
  id: string;
  ideaId: number;
  photoData: IdeaPhoto | string;
}

export interface IdeaCardModel {
  catalogId: string;
  title: string;
  description: string;
  image: string | null;
  cardData: Record<string, JsonValue>;
  catalogMetadata: Record<string, JsonValue> | null;
  passportId: number | null;
}
