"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

const defaultStats: DashboardStats = {
  totalGuests: 0,
  repeatGuestPercent: 0,
  returningGuests: 0,
  monthlyArrivals: 0,
  guestGrowthTrend: 0,
  topCountries: [],
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardStats>("/api/dashboard")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  const cards = [
    { label: "Total Guests", value: stats.totalGuests },
    { label: "Repeat Guest %", value: `${stats.repeatGuestPercent}%` },
    { label: "Returning Guests", value: stats.returningGuests },
    { label: "Monthly Arrivals", value: stats.monthlyArrivals },
    { label: "Guest Growth Trend", value: `${stats.guestGrowthTrend}%` },
  ];

  return (
    <AdminShell title="Smart Dashboard">
      {error && <p className="mb-4 rounded-xl bg-red-900/40 p-3 text-sm">{error}</p>}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, index) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <Card>
              <p className="text-xs uppercase tracking-wide text-[#BDAF95]">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Top Countries</h2>
          <div className="mt-4 space-y-3">
            {stats.topCountries.length === 0 && <p className="text-sm text-[#BDAF95]">No data yet.</p>}
            {stats.topCountries.map((country) => (
              <div className="flex items-center justify-between" key={country.country}>
                <span>{country.country}</span>
                <span className="text-[#C8A76A]">{country.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Luxury Intelligence</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#DDCCAE]">
            <li>Track repeat stays automatically and prioritize retention campaigns.</li>
            <li>Use seasonal templates for birthdays, anniversaries, Eid, Christmas, and New Year.</li>
            <li>Focus concierge outreach on top countries and returning guest segments.</li>
          </ul>
        </Card>
      </section>
    </AdminShell>
  );
}
