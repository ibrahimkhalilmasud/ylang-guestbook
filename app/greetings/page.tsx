"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Guest, MessageTemplate } from "@/lib/types";

type GreetingRow = {
  id: string;
  send_at: string;
  channel: "email" | "whatsapp";
  status: "draft" | "scheduled" | "sent";
  guests?: { full_name: string; email: string; whatsapp_number: string };
  message_templates?: { name: string; body: string };
};

const initialForm = {
  guest_id: "",
  template_id: "",
  send_at: "",
  channel: "email",
  status: "scheduled",
};

export default function GreetingsPage() {
  const [greetings, setGreetings] = useState<GreetingRow[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [greetingRows, guestRows, templateRows] = await Promise.all([
        api<GreetingRow[]>("/api/greetings"),
        api<Guest[]>("/api/guests"),
        api<MessageTemplate[]>("/api/templates"),
      ]);
      setGreetings(greetingRows);
      setGuests(guestRows);
      setTemplates(templateRows);
      setForm((state) => ({
        ...state,
        guest_id: state.guest_id || guestRows[0]?.id || "",
        template_id: state.template_id || templateRows[0]?.id || "",
      }));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api("/api/greetings", { method: "POST", body: JSON.stringify(form) });
      setForm((state) => ({ ...initialForm, guest_id: state.guest_id, template_id: state.template_id }));
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === form.template_id),
    [templates, form.template_id],
  );

  return (
    <AdminShell title="Seasonal Greeting System">
      {error && <p className="mb-4 rounded-xl bg-red-900/40 p-3 text-sm">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <Card>
          <h2 className="text-lg font-semibold">Schedule Greeting</h2>
          <form className="mt-4 space-y-3" onSubmit={schedule}>
            <Select value={form.guest_id} onChange={(e) => setForm({ ...form, guest_id: e.target.value })} required>
              <option value="">Select guest</option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>{guest.full_name}</option>
              ))}
            </Select>
            <Select value={form.template_id} onChange={(e) => setForm({ ...form, template_id: e.target.value })} required>
              <option value="">Select template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.name} ({template.occasion})</option>
              ))}
            </Select>
            <Input type="datetime-local" value={form.send_at} onChange={(e) => setForm({ ...form, send_at: e.target.value })} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as "email" | "whatsapp" })}>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </Select>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
              </Select>
            </div>
            <Button type="submit">Save Greeting</Button>
          </form>
          {selectedTemplate && (
            <p className="mt-4 rounded-xl border border-[#5D5344] bg-[#111] p-3 text-sm text-[#DDCCAE]">
              Preview: {selectedTemplate.body}
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Upcoming & Sent Greetings</h2>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Guest</Th>
                  <Th>Template</Th>
                  <Th>Channel</Th>
                  <Th>Send Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {greetings.map((greeting) => (
                  <tr className="border-t border-[#302B24]" key={greeting.id}>
                    <Td>{greeting.guests?.full_name || "Unknown"}</Td>
                    <Td>{greeting.message_templates?.name || "Template"}</Td>
                    <Td>{greeting.channel}</Td>
                    <Td>{formatDate(greeting.send_at)}</Td>
                    <Td><Badge>{greeting.status}</Badge></Td>
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
