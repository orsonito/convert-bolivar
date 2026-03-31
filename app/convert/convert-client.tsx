"use client";

import { useRouter, useSearchParams } from "next/navigation";
import BackNav from "@/components/back-nav/back-nav";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  convertPageEyebrow,
  convertPageHeading,
  currencyStepHref,
  isActionSlug,
  isCurrencySlug,
  isPrivateAction,
  type CurrencySlug,
} from "@/lib/flow";

type RatePayload = {
  price: number | null;
  rateLabel: string | null;
  source: string | null;
  date: string | null;
  time: string | null;
  success: boolean;
};

const CURRENCY_UNIT: Record<CurrencySlug, string> = {
  usd: "USD",
  eur: "EUR",
};

function parseAmount(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parseRate(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export default function ConvertClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionRaw = searchParams.get("action");
  const currencyRaw = searchParams.get("currency");

  const action = useMemo(() => {
    return isActionSlug(actionRaw) ? actionRaw : null;
  }, [actionRaw]);
  const currency = useMemo(() => {
    return isCurrencySlug(currencyRaw) ? currencyRaw : null;
  }, [currencyRaw]);

  const [amount, setAmount] = useState("");
  const [privateRateInput, setPrivateRateInput] = useState("");
  const [rateBundle, setRateBundle] = useState<{
    currency: CurrencySlug;
    payload: RatePayload | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!currency) return;
    let cancelled = false;
    fetch(`/api/rate/${currency}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch");
        return res.json() as Promise<RatePayload>;
      })
      .then((data) => {
        if (!cancelled) {
          setRateBundle({ currency, payload: data, error: null });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRateBundle({
            currency,
            payload: null,
            error: "No se pudo cargar la tasa del día.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  const rateReady =
    rateBundle !== null && rateBundle.currency === currency;
  const bcvRate = rateReady ? rateBundle.payload : null;
  const rateError = rateReady ? rateBundle.error : null;
  const loadingRate = currency !== null && !rateReady;

  useEffect(() => {
    if (action === null || currency === null) {
      router.replace("/home");
    }
  }, [action, currency, router]);

  const isPrivate = action !== null && isPrivateAction(action);
  const refPrice = bcvRate?.price ?? null;
  const privateRate = isPrivate ? parseRate(privateRateInput) : null;
  const effectiveRate = isPrivate ? privateRate : refPrice;

  const amountN = parseAmount(amount);
  const result =
    amountN !== null && effectiveRate !== null
      ? amountN * effectiveRate
      : null;

  const formatBs = useCallback((n: number) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }, []);

  const [copiedBsHint, setCopiedBsHint] = useState(false);

  const copyConvertedBs = useCallback(async () => {
    if (result === null) return;
    const text = `${formatBs(result)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBsHint(true);
      window.setTimeout(() => setCopiedBsHint(false), 2000);
    } catch {
      // Sin permiso o contexto no seguro
    }
  }, [formatBs, result]);

  if (action === null || currency === null) {
    return null;
  }

  const unitLabel = CURRENCY_UNIT[currency];

  return (
    <main className="convert relative mx-auto flex min-h-full max-w-3xl flex-col gap-8 px-4 pb-10 pt-14">
      <BackNav href={currencyStepHref(action)}>Volver</BackNav>
      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        {convertPageEyebrow(action, unitLabel)}
      </p>
      <h1 className="pb-4 text-center text-2xl font-semibold tracking-tight">
        {convertPageHeading()}
      </h1>

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Monto en {unitLabel}
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label={`Monto en ${unitLabel}`}
                className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-3 pr-[3.25rem] text-right text-lg tabular-nums dark:border-neutral-600 dark:bg-neutral-950"
              />
              <span
                className={`text-white pointer-events-none absolute inset-y-0 right-0 flex items-center border-l pl-2 pr-2.5 text-[0.7rem] font-medium uppercase tracking-wide ${
                  unitLabel === "USD"
                    ? "border-neutral-200 text-neutral-400 bg-emerald-600 dark:border-neutral-600 dark:text-neutral-500"
                    : "border-neutral-200 text-neutral-400 bg-indigo-600 dark:border-neutral-600 dark:text-neutral-500"
                }`}
                aria-hidden
              >
                {unitLabel}
              </span>
            </div>
          </label>

          {isPrivate ? (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Precio del particular (VES por 1 {unitLabel})
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Ej. 480"
                  value={privateRateInput}
                  onChange={(e) => setPrivateRateInput(e.target.value)}
                  aria-label={`Precio en VES por 1 ${unitLabel}`}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-3 pr-[3rem] text-right text-lg tabular-nums dark:border-neutral-600 dark:bg-neutral-950"
                />
                <span
                  className="pointer-events-none absolute inset-y-0 right-0 flex items-center border-l border-neutral-200 pl-2 pr-2.5 text-[0.7rem] font-medium uppercase tracking-wide text-neutral-400 dark:border-neutral-600 dark:text-neutral-500"
                  aria-hidden
                >
                  VES
                </span>
              </div>
            </label>
          ) : null}
        </div>

        <aside className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-base leading-relaxed dark:border-neutral-700 dark:bg-neutral-900">
          {loadingRate ? (
            <p className="text-neutral-500">Cargando tasa del día…</p>
          ) : rateError ? (
            <p className="text-red-600 dark:text-red-400">{rateError}</p>
          ) : (
            <>
              <p className="font-medium text-neutral-800 dark:text-neutral-100">
                Referencia BCV (hoy)
              </p>
              {bcvRate?.rateLabel ? (
                <p className="mt-2 text-neutral-700 dark:text-neutral-300">
                  {bcvRate.rateLabel}
                </p>
              ) : null}
              {(bcvRate?.date || bcvRate?.time) && (
                <p className="mt-1 text-sm text-neutral-500">
                  {[bcvRate?.date, bcvRate?.time].filter(Boolean).join(" · ")}
                </p>
              )}
            </>
          )}

          <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700">
            {isPrivate &&
            (!privateRateInput.trim() || privateRate === null) ? (
              <p className="text-neutral-600 dark:text-neutral-400">
                Indica el precio acordado con el particular para ver el total
                en bolívares.
              </p>
            ) : result === null ? (
              <p className="text-neutral-600 dark:text-neutral-400">
                Escribe un monto válido para ver la conversión al instante.
              </p>
            ) : (
              <div className="text-lg text-neutral-800 dark:text-neutral-100">
                <span className="block text-sm font-normal text-neutral-500">
                  {amountN} {unitLabel} × {formatBs(effectiveRate!)} VES
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    ≈
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyConvertedBs()}
                    className="inline-flex min-h-[2.75rem] flex-col items-start justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-[#15803d] hover:bg-emerald-50/60 active:scale-[0.99] dark:border-neutral-600 dark:bg-neutral-950 dark:hover:border-green-500 dark:hover:bg-emerald-950/25"
                    aria-label="Copiar monto en bolívares"
                  >
                    <span className="font-semibold tabular-nums">
                      {formatBs(result)} Bs.S
                    </span>
                    <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                      {copiedBsHint ? "Copiado al portapapeles" : "Toca para copiar"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
