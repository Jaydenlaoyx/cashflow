import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          message: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      connected: true,
      message: "CashFlow is connected to Supabase.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected connection error occurred.";

    return NextResponse.json(
      {
        connected: false,
        message,
      },
      {
        status: 500,
      },
    );
  }
}