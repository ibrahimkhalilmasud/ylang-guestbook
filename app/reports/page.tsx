"use client";

import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function exportFile(format: "csv" | "excel" | "pdf") {
  window.location.href = `/api/export?format=${format}`;
}

export default function ReportsPage() {
  return (
    <AdminShell title="Guest Reports & Intelligence">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Export Guest Reports</h2>
          <p className="mt-2 text-sm text-[#BDAF95]">Download all guest metrics in CSV, Excel, or PDF format.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => exportFile("csv")}>Export CSV</Button>
            <Button onClick={() => exportFile("excel")} variant="outline">Export Excel</Button>
            <Button onClick={() => exportFile("pdf")} variant="ghost">Export PDF</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Bonus Intelligence</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#DDCCAE]">
            <li>AI insight starter: prioritize guests with 2+ visits but no stay in 12 months.</li>
            <li>Loyalty score model: score = (visits × 25) + (lifetime spend ÷ 1000).</li>
            <li>Returning guest alert rule: auto-flag when reservation booking source changes to direct.</li>
            <li>Sentiment notes: save service mood notes in guest special notes and concierge follow-up tasks.</li>
            <li>WhatsApp Cloud API integration entry point: seasonal greeting templates can route by channel.</li>
          </ul>
        </Card>
      </div>
    </AdminShell>
  );
}
