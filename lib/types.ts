export const ROLE_VALUES = ["admin", "manager"] as const;
export type Role = (typeof ROLE_VALUES)[number];

export type GuestTag =
  | "VIP"
  | "honeymoon"
  | "family"
  | "influencer"
  | "returning guest"
  | "corporate"
  | "anniversary guest";

export type Guest = {
  id: string;
  full_name: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  country: string;
  nationality: string;
  preferred_language: string;
  date_of_birth: string | null;
  anniversary: string | null;
  passport: string | null;
  dietary_preferences: string | null;
  room_preferences: string | null;
  special_notes: string | null;
  vip_status: boolean;
  tags: GuestTag[];
  total_visits: number;
  total_nights: number;
  lifetime_spend: number;
  last_stay: string | null;
  created_at?: string;
};

export type Stay = {
  id: string;
  guest_id: string;
  arrival_date: string;
  departure_date: string;
  villa_room: string;
  booking_source: string;
  travel_agent: string | null;
  total_spend: number;
  created_at?: string;
};

export type MessageTemplate = {
  id: string;
  name: string;
  channel: "email" | "whatsapp";
  occasion: "Eid Mubarak" | "Christmas" | "New Year" | "birthday" | "anniversary";
  subject: string | null;
  body: string;
  created_at?: string;
};

export type SeasonalGreeting = {
  id: string;
  guest_id: string;
  template_id: string;
  send_at: string;
  channel: "email" | "whatsapp";
  status: "draft" | "scheduled" | "sent";
  created_at?: string;
};

export type DashboardStats = {
  totalGuests: number;
  repeatGuestPercent: number;
  returningGuests: number;
  monthlyArrivals: number;
  guestGrowthTrend: number;
  topCountries: Array<{ country: string; count: number }>;
};
