export const BCV_RATE_URLS = {
  usd: "https://dolarflow.com/api/oficial/",
  eur: "https://dolarflow.com/api/euro",
} as const;

export type BcvCurrency = keyof typeof BCV_RATE_URLS;

export type BcvRateSnapshot = {
  price: number | null;
  rateLabel: string | null;
  source: string | null;
  date: string | null;
  time: string | null;
  success: boolean;
};

export async function getBcvRate(
  currency: BcvCurrency,
): Promise<BcvRateSnapshot | null> {
  const res = await fetch(BCV_RATE_URLS[currency], { next: { revalidate: 60 } });

  if (!res.ok) {
    return null;
  }

  const raw = (await res.json()) as {
    exito?: boolean;
    precio?: number;
    tasa?: string;
    fuente?: string;
    fecha?: string;
    hora?: string;
  };

  return {
    price: raw.precio ?? null,
    rateLabel: raw.tasa ?? null,
    source: raw.fuente ?? null,
    date: raw.fecha ?? null,
    time: raw.hora ?? null,
    success: raw.exito ?? false,
  };
}
