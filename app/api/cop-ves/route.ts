import { NextResponse } from "next/server";
import { getCopVesCrossRate } from "@/lib/cop-ves";

export async function GET() {
  const data = await getCopVesCrossRate();
  return NextResponse.json(data);
}
