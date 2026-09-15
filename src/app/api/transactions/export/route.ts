import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  let text = String(value);

  // Prevent spreadsheet formula injection.
  if (/^[=+@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(`
      transaction_date,
      type,
      description,
      amount,
      notes,
      accounts (
        name
      ),
      categories (
        name
      )
    `)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to export transactions:", error);

    return NextResponse.json(
      { error: "Unable to export transactions." },
      { status: 500 },
    );
  }

  const headers = [
    "Date",
    "Type",
    "Description",
    "Category",
    "Account",
    "Amount",
    "Notes",
  ];

  const rows = (transactions ?? []).map((transaction) => [
    transaction.transaction_date,
    transaction.type,
    transaction.description,
    transaction.categories?.name ?? "",
    transaction.accounts?.name ?? "",
    transaction.amount,
    transaction.notes ?? "",
  ]);

  const csv = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");

  const filename = `cashflow-transactions-${
    new Date().toISOString().split("T")[0]
  }.csv`;

  return new NextResponse(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}