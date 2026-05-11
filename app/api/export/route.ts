import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import jsPDF from "jspdf";
import { getGuestsWithStaysForExport } from "@/lib/db";

const exportColumns = [
  "full_name",
  "email",
  "phone",
  "nationality",
  "country",
  "vip_status",
  "total_visits",
  "total_nights",
  "lifetime_spend",
  "last_stay",
] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const rows = await getGuestsWithStaysForExport();
    const data = rows.map((row) =>
      exportColumns.reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = row[key] ?? "";
        return acc;
      }, {}),
    );

    if (format === "csv") {
      const csv = Papa.unparse(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=ylang-guest-report.csv",
        },
      });
    }

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Guests");
      sheet.columns = exportColumns.map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      data.forEach((row) => sheet.addRow(row));
      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(Buffer.from(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=ylang-guest-report.xlsx",
        },
      });
    }

    if (format === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Ylang Guest Vault Report", 12, 16);
      doc.setFontSize(10);
      data.slice(0, 25).forEach((guest, index) => {
        doc.text(
          `${index + 1}. ${guest.full_name} | ${guest.email} | visits:${guest.total_visits} | spend:${guest.lifetime_spend}`,
          12,
          30 + index * 6,
        );
      });

      const pdf = doc.output("arraybuffer");
      return new NextResponse(Buffer.from(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=ylang-guest-report.pdf",
        },
      });
    }

    return NextResponse.json({ error: "Unsupported export format" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
