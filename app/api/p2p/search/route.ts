import { NextResponse } from "next/server";
import {
  BINANCE_P2P_SEARCH_URL,
  buildP2pSearchBody,
  type BinanceP2pSearchResponse,
} from "@/lib/binance-p2p";

type ClientBody = {
  transAmount?: string;
  page?: number;
  rows?: number;
  /** SELL = anuncios de quien vende USDT (tú compras). BUY = quien compra USDT (tú vendes). */
  tradeType?: string;
};

export async function POST(request: Request) {
  let body: ClientBody;
  try {
    body = (await request.json()) as ClientBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const raw = body.transAmount;
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return NextResponse.json({ error: "trans_amount_required" }, { status: 400 });
  }

  const page =
    typeof body.page === "number" && body.page >= 1 ? body.page : 1;
  const rows =
    typeof body.rows === "number" && body.rows >= 1 && body.rows <= 50
      ? body.rows
      : 10;

  const tt = body.tradeType;
  const tradeType =
    tt === "BUY" || tt === "SELL" ? tt : undefined;

  const payload = buildP2pSearchBody(String(raw), tradeType ? { tradeType } : undefined);
  payload.page = page;
  payload.rows = rows;

  const res = await fetch(BINANCE_P2P_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "binance_http_error", status: res.status },
      { status: 502 },
    );
  }

  const data = (await res.json()) as BinanceP2pSearchResponse;
  return NextResponse.json(data);
}
