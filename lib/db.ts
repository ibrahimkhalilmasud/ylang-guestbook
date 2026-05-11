import { aggregateGuestFromStays } from "@/lib/metrics";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { DashboardStats, Guest, MessageTemplate, SeasonalGreeting, Stay } from "@/lib/types";

export async function listGuests(filters: {
  q?: string;
  nationality?: string;
  vip?: string;
  repeat?: string;
}) {
  const supabase = getSupabaseServerClient();
  let query = supabase.from("guests").select("*").order("full_name", { ascending: true });

  if (filters.q) {
    query = query.or(`full_name.ilike.%${filters.q}%,phone.ilike.%${filters.q}%,email.ilike.%${filters.q}%`);
  }
  if (filters.nationality) query = query.eq("nationality", filters.nationality);
  if (filters.vip === "true") query = query.eq("vip_status", true);
  if (filters.vip === "false") query = query.eq("vip_status", false);
  if (filters.repeat === "true") query = query.gt("total_visits", 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Guest[];
}

export async function createGuest(guest: Partial<Guest>) {
  const supabase = getSupabaseServerClient();
  const payload = {
    full_name: guest.full_name,
    phone: guest.phone,
    whatsapp_number: guest.whatsapp_number,
    email: guest.email,
    country: guest.country,
    nationality: guest.nationality,
    preferred_language: guest.preferred_language,
    date_of_birth: guest.date_of_birth || null,
    anniversary: guest.anniversary || null,
    passport: guest.passport || null,
    dietary_preferences: guest.dietary_preferences || null,
    room_preferences: guest.room_preferences || null,
    special_notes: guest.special_notes || null,
    vip_status: Boolean(guest.vip_status),
    tags: guest.tags || [],
  };

  const { data, error } = await supabase.from("guests").insert(payload).select("*").single();
  if (error) throw error;
  return data as Guest;
}

export async function listStays() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("stays")
    .select("*, guests:guest_id (full_name)")
    .order("arrival_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createStay(stay: Partial<Stay>) {
  const supabase = getSupabaseServerClient();
  const payload = {
    guest_id: stay.guest_id,
    arrival_date: stay.arrival_date,
    departure_date: stay.departure_date,
    villa_room: stay.villa_room,
    booking_source: stay.booking_source,
    travel_agent: stay.travel_agent || null,
    total_spend: Number(stay.total_spend || 0),
  };

  const { data, error } = await supabase.from("stays").insert(payload).select("*").single();
  if (error) throw error;
  await recalculateGuestMetrics(stay.guest_id!);
  return data as Stay;
}

export async function recalculateGuestMetrics(guestId: string) {
  const supabase = getSupabaseServerClient();
  const { data: stays, error: stayError } = await supabase
    .from("stays")
    .select("*")
    .eq("guest_id", guestId);
  if (stayError) throw stayError;

  const metrics = aggregateGuestFromStays((stays || []) as Stay[]);
  const { error } = await supabase
    .from("guests")
    .update({
      total_visits: metrics.totalVisits,
      total_nights: metrics.totalNights,
      lifetime_spend: metrics.lifetimeSpend,
      last_stay: metrics.lastStay,
      vip_status: metrics.vipStatus,
      tags: metrics.totalVisits > 1 ? ["returning guest"] : [],
    })
    .eq("id", guestId);

  if (error) throw error;
}

export async function listTemplates() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("message_templates").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as MessageTemplate[];
}

export async function createTemplate(template: Partial<MessageTemplate>) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("message_templates")
    .insert({
      name: template.name,
      channel: template.channel,
      occasion: template.occasion,
      subject: template.subject || null,
      body: template.body,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as MessageTemplate;
}

export async function listGreetings() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("seasonal_greetings")
    .select("*, guests:guest_id(full_name,email,whatsapp_number), message_templates:template_id(name,body)")
    .order("send_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createGreeting(greeting: Partial<SeasonalGreeting>) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("seasonal_greetings")
    .insert({
      guest_id: greeting.guest_id,
      template_id: greeting.template_id,
      send_at: greeting.send_at,
      channel: greeting.channel,
      status: greeting.status || "scheduled",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as SeasonalGreeting;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseServerClient();
  const [{ data: guests, error: guestsError }, { data: stays, error: staysError }] = await Promise.all([
    supabase.from("guests").select("id,country,total_visits,created_at"),
    supabase.from("stays").select("id,arrival_date"),
  ]);

  if (guestsError) throw guestsError;
  if (staysError) throw staysError;

  const guestRows = guests || [];
  const stayRows = stays || [];
  const returningGuests = guestRows.filter((guest) => (guest.total_visits || 0) > 1).length;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyArrivals = stayRows.filter((stay) => {
    const date = new Date(stay.arrival_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const countryMap = guestRows.reduce<Record<string, number>>((acc, guest) => {
    const key = guest.country || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const previousCount = guestRows.filter((guest) => new Date(guest.created_at || 0) < lastMonthDate).length;
  const currentCount = guestRows.length;
  const guestGrowthTrend = previousCount
    ? Math.round(((currentCount - previousCount) / previousCount) * 100)
    : 100;

  return {
    totalGuests: guestRows.length,
    repeatGuestPercent: guestRows.length ? Math.round((returningGuests / guestRows.length) * 100) : 0,
    returningGuests,
    monthlyArrivals,
    guestGrowthTrend,
    topCountries,
  };
}

export async function getGuestsWithStaysForExport() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("guests")
    .select("full_name,email,phone,nationality,country,vip_status,total_visits,total_nights,lifetime_spend,last_stay");
  if (error) throw error;
  return data || [];
}
