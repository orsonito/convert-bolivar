import { NextResponse } from "next/server";
import {
  type BcvCurrency,
  getBcvRate,
} from "@/lib/bcv-rate";

export async function GET(
  _request: Request,
  context: { params: Promise<{ currency: string }> },
) {
  const { currency } = await context.params;
  if (currency !== "usd" && currency !== "eur") {
    return NextResponse.json({ error: "invalid_currency" }, { status: 400 });
  }

  const data = await getBcvRate(currency as BcvCurrency);
  if (!data) {
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }

  return NextResponse.json(data);
}
