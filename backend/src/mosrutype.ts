// hall.types.ts

export interface Hall {
  id: string;
  name: string;
  museum_name: string;
  museum_short_name: string;
  description: string;

  spot: Spot;

  price_starts_from: number;
  hall_type: string;

  location: Location;
  coordinates: Coordinates;

  metro: Metro[];

  capacity: Capacity;

  photos: string[];
  schema: string[];

  date_near_free: string;

  options: unknown[];

  slot_schedule: Slot[];

  event_hall_kind_id: number[];

  facilities: Facility[];
  equipment: Equipment[];
  services: Service[];
  rules: Rule[];
  accessibility: Accessibility[];

  floor: number;
  parking: ParkingType;

  auxiliary_rooms: unknown[];
  discounts: unknown[];
  loyalty_discount: number | null;
}

// =======================
// BASE TYPES
// =======================

export interface Spot {
  id: string;
  name: string;
  phone: string;
}

export interface Location {
  district_id: string;
  region_id: string;
  address: string;
  short_address: string;
  full_address: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Metro {
  metro_id: string;
  distance: number;
}

export interface Capacity {
  area: number;
  visitor_count: number;
  seat_count: number;
}

// =======================
// SCHEDULE
// =======================

export interface Slot {
  id: string;
  price: number;
  date_from: string;
  date_to: string;
  time_from: string;
  time_to: string;
  available: boolean;
}

// =======================
// COMMON STRUCTURES
// =======================

export interface BaseAttributes {
  available: boolean;
}

export interface Facility {
  id: string;
  name: string;
  attributes: BaseAttributes & {
    item_count?: number;
  };
}

export interface Equipment {
  id: string;
  name: string;
  attributes: BaseAttributes & {
    item_count: number;
    price_per_item: number;
  };
}

export interface Service {
  id: string;
  name: string;
  attributes: BaseAttributes & {
    price_starts_from?: number;
    free?: boolean;
  };
}

export interface Rule {
  id: string;
  name: string;
  attributes: BaseAttributes & {
    time?: string | null;
    duration_in_minutes?: number;
  };
}

export interface Accessibility {
  id: string;
  name: string;
  accessibility: "accessible" | "not_accessible" | "limited";
}

// =======================
// ENUMS
// =======================

export type ParkingType =
  | "no_parking"
  | "city"
  | "private";
