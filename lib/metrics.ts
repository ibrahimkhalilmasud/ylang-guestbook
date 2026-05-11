import type { Stay } from "@/lib/types";

const VIP_VISITS_THRESHOLD = 3;
const VIP_SPEND_THRESHOLD = 20000;

export function stayNights(arrivalDate: string, departureDate: string) {
  const start = new Date(arrivalDate);
  const end = new Date(departureDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function aggregateGuestFromStays(stays: Stay[]) {
  const totalVisits = stays.length;
  const totalNights = stays.reduce(
    (sum, stay) => sum + stayNights(stay.arrival_date, stay.departure_date),
    0,
  );
  const lifetimeSpend = stays.reduce((sum, stay) => sum + (stay.total_spend || 0), 0);
  const lastStay = stays
    .map((stay) => stay.departure_date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

  return {
    totalVisits,
    totalNights,
    lifetimeSpend,
    lastStay,
    vipStatus: totalVisits >= VIP_VISITS_THRESHOLD || lifetimeSpend >= VIP_SPEND_THRESHOLD,
  };
}
