export type DemoEntity = 'passport' | 'user' | 'place' | 'placePassport' | 'placeSchedule' | 'idea' | 'project' | 'meet' | 'projectUser' | 'meetUser';

export interface DemoSeedRecord {
  seedKey: string;
  entityType: DemoEntity;
  entityKey: string;
  recordId: number;
}
