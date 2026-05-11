"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { currency, formatDate } from "@/lib/utils";
import type { Guest } from "@/lib/types";

const tags = ["VIP", "honeymoon", "family", "influencer", "returning guest", "corporate", "anniversary guest"];

const initialGuest = {
  full_name: "",
  phone: "",
  whatsapp_number: "",
  email: "",
  country: "",
  nationality: "",
  preferred_language: "English",
  date_of_birth: "",
  anniversary: "",
  passport: "",
  dietary_preferences: "",
  room_preferences: "",
  special_notes: "",
  vip_status: false,
  tags: ["VIP"],
};

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [form, setForm] = useState(initialGuest);
  const [search, setSearch] = useState("");
  const [nationality, setNationality] = useState("");
  const [vip, setVip] = useState("all");
  const [repeat, setRepeat] = useState("all");
  const [error, setError] = useState("");

  async function load() {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (nationality) query.set("nationality", nationality);
    if (vip !== "all") query.set("vip", String(vip === "yes"));
    if (repeat !== "all") query.set("repeat", String(repeat === "yes"));

    try {
      const response = await api<Guest[]>(`/api/guests?${query.toString()}`);
      setGuests(response);
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

  async function createGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api("/api/guests", { method: "POST", body: JSON.stringify(form) });
      setForm(initialGuest);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const guestNationalities = useMemo(
    () => Array.from(new Set(guests.map((guest) => guest.nationality).filter(Boolean))).sort(),
    [guests],
  );

  return (
    <AdminShell title="Guest Management">
      {error && <p className="mb-4 rounded-xl bg-red-900/40 p-3 text-sm">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_2fr]">
        <Card>
          <h2 className="text-lg font-semibold">Add Guest</h2>
          <form className="mt-4 grid gap-3" onSubmit={createGuest}>
            <Input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <Input placeholder="WhatsApp" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} required />
            </div>
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
              <Input placeholder="Nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} required />
              <Input placeholder="Language" value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              <Input type="date" value={form.anniversary} onChange={(e) => setForm({ ...form, anniversary: e.target.value })} />
            </div>
            <Input placeholder="Passport (optional)" value={form.passport} onChange={(e) => setForm({ ...form, passport: e.target.value })} />
            <Input placeholder="Dietary preferences" value={form.dietary_preferences} onChange={(e) => setForm({ ...form, dietary_preferences: e.target.value })} />
            <Input placeholder="Room preferences" value={form.room_preferences} onChange={(e) => setForm({ ...form, room_preferences: e.target.value })} />
            <Textarea placeholder="Special notes" value={form.special_notes} onChange={(e) => setForm({ ...form, special_notes: e.target.value })} />
            <Select value={form.tags[0]} onChange={(e) => setForm({ ...form, tags: [e.target.value], vip_status: e.target.value === "VIP" })}>
              {tags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </Select>
            <Button type="submit">Save Guest</Button>
          </form>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Input className="max-w-xs" placeholder="Search name, phone, email" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select className="max-w-[180px]" value={nationality} onChange={(e) => setNationality(e.target.value)}>
              <option value="">All nationalities</option>
              {guestNationalities.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </Select>
            <Select className="max-w-[140px]" value={vip} onChange={(e) => setVip(e.target.value)}>
              <option value="all">VIP: all</option>
              <option value="yes">VIP only</option>
              <option value="no">Non-VIP</option>
            </Select>
            <Select className="max-w-[160px]" value={repeat} onChange={(e) => setRepeat(e.target.value)}>
              <option value="all">Repeat: all</option>
              <option value="yes">Repeat only</option>
              <option value="no">Single visit</option>
            </Select>
            <Button size="sm" onClick={load} type="button">Apply</Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Nationality</Th>
                  <Th>VIP</Th>
                  <Th>Visits</Th>
                  <Th>Nights</Th>
                  <Th>Spend</Th>
                  <Th>Last stay</Th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr className="border-t border-[#302B24]" key={guest.id}>
                    <Td>{guest.full_name}</Td>
                    <Td>{guest.email}<br />{guest.phone}</Td>
                    <Td>{guest.nationality}</Td>
                    <Td>{guest.vip_status ? <Badge>VIP</Badge> : "-"}</Td>
                    <Td>{guest.total_visits || 0}</Td>
                    <Td>{guest.total_nights || 0}</Td>
                    <Td>{currency(guest.lifetime_spend || 0)}</Td>
                    <Td>{formatDate(guest.last_stay)}</Td>
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
