"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { MessageTemplate } from "@/lib/types";

const initialTemplate = {
  name: "",
  channel: "email",
  occasion: "Eid Mubarak",
  subject: "",
  body: "Dear {{guest_name}}, welcome back to {{villa_name}} in {{stay_year}}.",
};

function personalize(body: string) {
  return body
    .replaceAll("{{guest_name}}", "Aisha Rahman")
    .replaceAll("{{villa_name}}", "Ylang Ocean Villa")
    .replaceAll("{{stay_year}}", String(new Date().getFullYear()));
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [form, setForm] = useState(initialTemplate);
  const [error, setError] = useState("");

  async function load() {
    try {
      setTemplates(await api<MessageTemplate[]>("/api/templates"));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function saveTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api("/api/templates", { method: "POST", body: JSON.stringify(form) });
      setForm(initialTemplate);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const preview = useMemo(() => personalize(form.body), [form.body]);

  return (
    <AdminShell title="Message Template Manager">
      {error && <p className="mb-4 rounded-xl bg-red-900/40 p-3 text-sm">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">Create Template</h2>
          <form className="mt-4 space-y-3" onSubmit={saveTemplate}>
            <Input placeholder="Template name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as "email" | "whatsapp" })}>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </Select>
              <Select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value as typeof form.occasion })}>
                <option>Eid Mubarak</option>
                <option>Christmas</option>
                <option>New Year</option>
                <option>birthday</option>
                <option>anniversary</option>
              </Select>
            </div>
            <Input placeholder="Subject (for email)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
            <p className="text-xs text-[#BDAF95]">Variables: {"{{guest_name}}"}, {"{{villa_name}}"}, {"{{stay_year}}"}</p>
            <Button type="submit">Save Template</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Live Preview</h2>
          <p className="mt-4 rounded-xl border border-[#5D5344] bg-[#111] p-4 text-sm whitespace-pre-wrap">{preview}</p>
          <h3 className="mt-6 text-md font-semibold">Saved Templates</h3>
          <div className="mt-3 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Occasion</Th>
                  <Th>Channel</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr className="border-t border-[#302B24]" key={template.id}>
                    <Td>{template.name}</Td>
                    <Td>{template.occasion}</Td>
                    <Td>{template.channel}</Td>
                    <Td>{formatDate(template.created_at)}</Td>
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
