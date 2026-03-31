import { getBcvRate } from "./bcv-rate";

/** JSON `v1/currencies/usd.json`: COP por 1 USD (referencia de mercado). */
const USD_COP_JSON_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";

export type CopVesCrossRate = {
  vesPerUsd: number | null;
  copPerUsd: number | null;
  /** VES por 1 COP (vía USD: BCV × COP/USD). */
  vesPerCop: number | null;
  /** COP por 1 VES. */
  copPerVes: number | null;
  bcvRateLabel: string | null;
  bcvDate: string | null;
  bcvTime: string | null;
  copQuoteDate: string | null;
  /** Texto corto para UI. */
  copSourceNote: string;
  ok: boolean;
};

export async function fetchCopPerUsd(): Promise<{
  copPerUsd: number | null;
  quoteDate: string | null;
}> {
  try {
    const res = await fetch(USD_COP_JSON_URL, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return { copPerUsd: null, quoteDate: null };
    }
    const j = (await res.json()) as {
      date?: string;
      usd?: { cop?: number };
    };
    const cop = j.usd?.cop;
    const n =
      typeof cop === "number" && Number.isFinite(cop) && cop > 0 ? cop : null;
    return { copPerUsd: n, quoteDate: j.date ?? null };
  } catch {
    return { copPerUsd: null, quoteDate: null };
  }
}

/**
 * Cruce COP↔VES usando dólar: VES/USD (BCV) y COP/USD (referencia de mercado).
 */
export async function getCopVesCrossRate(): Promise<CopVesCrossRate> {
  const [usdBcv, { copPerUsd, quoteDate }] = await Promise.all([
    getBcvRate("usd"),
    fetchCopPerUsd(),
  ]);

  const vesPerUsd = usdBcv?.price ?? null;
  let vesPerCop: number | null = null;
  let copPerVes: number | null = null;

  if (
    vesPerUsd !== null &&
    vesPerUsd > 0 &&
    copPerUsd !== null &&
    copPerUsd > 0
  ) {
    vesPerCop = vesPerUsd / copPerUsd;
    copPerVes = copPerUsd / vesPerUsd;
  }

  return {
    vesPerUsd,
    copPerUsd,
    vesPerCop,
    copPerVes,
    bcvRateLabel: usdBcv?.rateLabel ?? null,
    bcvDate: usdBcv?.date ?? null,
    bcvTime: usdBcv?.time ?? null,
    copQuoteDate: quoteDate,
    copSourceNote: "COP/USD mercado · USD/VES BCV",
    ok: vesPerCop !== null && copPerVes !== null,
  };
}
