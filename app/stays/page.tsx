"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { currency, formatDate } from "@/lib/utils";
import type { Guest } from "@/lib/types";

type StayRow = {
  id: string;
  arrival_date: string;
  departure_date: string;
  villa_room: string;
  booking_source: string;
  travel_agent: string | null;
  total_spend: number;
  guests?: { full_name: string };
};

const initialStay = {
  guest_id: "",
  arrival_date: "",
  departure_date: "",
  villa_room: "",
  booking_source: "direct",
  travel_agent: "",
  total_spend: "",
};

export default function StaysPage() {
  const [stays, setStays] = useState<StayRow[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [form, setForm] = useState(initialStay);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [stayRows, guestRows] = await Promise.all([
        api<StayRow[]>("/api/stays"),
        api<Guest[]>("/api/guests"),
      ]);
      setStays(stayRows);
      setGuests(guestRows);
      if (!form.guest_id && guestRows[0]?.id) setForm((state) => ({ ...state, guest_id: guestRows[0].id }));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createStay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api("/api/stays", {
        method: "POST",
        body: JSON.stringify({ ...form, total_spend: Number(form.total_spend) }),
      });
      setForm((state) => ({ ...initialStay, guest_id: state.guest_id }));
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <AdminShell title="Stay History Tracking">
      {error && <p className="mb-4 rounded-xl bg-red-900/40 p-3 text-sm">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <Card>
          <h2 className="text-lg font-semibold">Add Stay</h2>
          <form className="mt-4 space-y-3" onSubmit={createStay}>
            <Select value={form.guest_id} onChange={(e) => setForm({ ...form, guest_id: e.target.value })} required>
              <option value="">Select guest</option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>{guest.full_name}</option>
              ))}
            </Select>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" value={form.arrival_date} onChange={(e) => setForm({ ...form, arrival_date: e.target.value })} required />
              <Input type="date" value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })} required />
            </div>
            <Input placeholder="Villa / room" value={form.villa_room} onChange={(e) => setForm({ ...form, villa_room: e.target.value })} required />
            <Input placeholder="Booking source" value={form.booking_source} onChange={(e) => setForm({ ...form, booking_source: e.target.value })} required />
            <Input placeholder="Travel agent" value={form.travel_agent} onChange={(e) => setForm({ ...form, travel_agent: e.target.value })} />
            <Input placeholder="Total spend" type="number" min="0" value={form.total_spend} onChange={(e) => setForm({ ...form, total_spend: e.target.value })} required />
            <Button type="submit">Save Stay</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Stay Records</h2>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Guest</Th>
                  <Th>Arrival</Th>
                  <Th>Departure</Th>
                  <Th>Villa</Th>
                  <Th>Source</Th>
                  <Th>Agent</Th>
                  <Th>Spend</Th>
                </tr>
              </thead>
              <tbody>
                {stays.map((stay) => (
                  <tr className="border-t border-[#302B24]" key={stay.id}>
                    <Td>{stay.guests?.full_name || "Unknown"}</Td>
                    <Td>{formatDate(stay.arrival_date)}</Td>
                    <Td>{formatDate(stay.departure_date)}</Td>
                    <Td>{stay.villa_room}</Td>
                    <Td>{stay.booking_source}</Td>
                    <Td>{stay.travel_agent || "-"}</Td>
                    <Td>{currency(stay.total_spend)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
