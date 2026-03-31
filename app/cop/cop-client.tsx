"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import BackNav from "@/components/back-nav/back-nav";
import type { CopVesCrossRate } from "@/lib/cop-ves";

type CopChannel = "bcv" | "private";

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

export default function CopClient() {
  const searchParams = useSearchParams();
  const channel: CopChannel =
    searchParams.get("channel") === "private" ? "private" : "bcv";

  const [amount, setAmount] = useState("");
  const [amountUnit, setAmountUnit] = useState<"cop" | "ves">("cop");
  const [privateVesPerCop, setPrivateVesPerCop] = useState("");
  const [bundle, setBundle] = useState<{
    data: CopVesCrossRate | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cop-ves")
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch");
        return res.json() as Promise<CopVesCrossRate>;
      })
      .then((data) => {
        if (!cancelled) {
          setBundle({ data, error: null });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBundle({
            data: null,
            error: "No se pudieron cargar las tasas de referencia.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cross = bundle?.data ?? null;
  const crossError = bundle?.error ?? null;
  const loading = bundle === null;

  const refVesPerCop = cross?.vesPerCop ?? null;
  const refCopPerVes = cross?.copPerVes ?? null;
  const privateRate = channel === "private" ? parseRate(privateVesPerCop) : null;
  const vesPerCopEff =
    channel === "private" ? privateRate : refVesPerCop;
  const copPerVesEff =
    channel === "private" && privateRate !== null
      ? 1 / privateRate
      : refCopPerVes;

  const amountN = parseAmount(amount);
  const result =
    amountN !== null && vesPerCopEff !== null && copPerVesEff !== null
      ? amountUnit === "cop"
        ? amountN * vesPerCopEff
        : amountN * copPerVesEff
      : null;

  const formatBs = useCallback((n: number) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }, []);

  const formatRate = useCallback((n: number) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(n);
  }, []);

  const formatCop = useCallback((n: number) => {
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);
  }, []);

  const titleEyebrow = useMemo(
    () =>
      channel === "private"
        ? "Peso colombiano · particular"
        : "Peso colombiano · referencia (BCV + COP/USD)",
    [channel],
  );

  const [copiedHint, setCopiedHint] = useState(false);
  const copyResult = useCallback(async () => {
    if (result === null) return;
    const text =
      amountUnit === "cop" ? formatBs(result) : formatCop(result);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHint(true);
      window.setTimeout(() => setCopiedHint(false), 2000);
    } catch {
      // ignore
    }
  }, [amountUnit, formatBs, formatCop, result]);

  return (
    <main className="cop relative mx-auto flex min-h-full max-w-3xl flex-col gap-8 px-4 pb-10 pt-14">
      <BackNav href="/home">Volver</BackNav>
      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        {titleEyebrow}
      </p>
      <h1 className="pb-2 text-center text-2xl font-semibold tracking-tight">
        COP y bolívares
      </h1>
      <p className="mx-auto max-w-md text-center text-sm text-neutral-600 dark:text-neutral-400">
        La referencia cruza el{" "}
        <span className="font-medium">USD del BCV</span> con un{" "}
        <span className="font-medium">COP por USD</span> de mercado (no es TRM
        oficial de Colombia).
      </p>

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-4">
          <div
            className="flex rounded-xl border border-neutral-200 p-1 dark:border-neutral-700"
            role="group"
            aria-label="Unidad del monto"
          >
            <button
              type="button"
              onClick={() => setAmountUnit("cop")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                amountUnit === "cop"
                  ? "bg-amber-500 text-white shadow-sm dark:bg-amber-600"
                  : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              Monto en COP
            </button>
            <button
              type="button"
              onClick={() => setAmountUnit("ves")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                amountUnit === "ves"
                  ? "bg-amber-500 text-white shadow-sm dark:bg-amber-600"
                  : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              Monto en VES
            </button>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium">
            {amountUnit === "cop" ? "Cantidad en pesos colombianos" : "Cantidad en bolívares"}
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label={amountUnit === "cop" ? "Monto en COP" : "Monto en VES"}
                className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-3 pr-[3.5rem] text-right text-lg tabular-nums dark:border-neutral-600 dark:bg-neutral-950"
              />
              <span
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center border-l border-neutral-200 bg-amber-500 pl-2 pr-2.5 text-[0.7rem] font-medium uppercase tracking-wide text-white dark:border-neutral-600 dark:bg-amber-600"
                aria-hidden
              >
                {amountUnit === "cop" ? "COP" : "VES"}
              </span>
            </div>
          </label>

          {channel === "private" ? (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Precio particular (VES por 1 COP)
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Ej. 0,05"
                  value={privateVesPerCop}
                  onChange={(e) => setPrivateVesPerCop(e.target.value)}
                  aria-label="Bolívares por un peso colombiano acordados"
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
          {loading ? (
            <p className="text-neutral-500">Cargando tasas…</p>
          ) : crossError ? (
            <p className="text-red-600 dark:text-red-400">{crossError}</p>
          ) : channel === "bcv" && cross?.ok ? (
            <>
              <p className="font-medium text-neutral-800 dark:text-neutral-100">
                Referencia del día
              </p>
              {cross.bcvRateLabel ? (
                <p className="mt-2 text-neutral-700 dark:text-neutral-300">
                  {cross.bcvRateLabel}
                </p>
              ) : null}
              {(cross.bcvDate || cross.bcvTime) && (
                <p className="mt-1 text-sm text-neutral-500">
                  {[cross.bcvDate, cross.bcvTime].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                COP/USD (mercado)
                {cross.copQuoteDate ? (
                  <span className="tabular-nums"> · {cross.copQuoteDate}</span>
                ) : null}
                {cross.copPerUsd != null ? (
                  <>
                    <br />
                    <span className="font-medium tabular-nums text-neutral-800 dark:text-neutral-100">
                      1 USD ≈ {formatCop(cross.copPerUsd)} COP
                    </span>
                  </>
                ) : null}
              </p>
            </>
          ) : channel === "bcv" ? (
            <p className="text-neutral-600 dark:text-neutral-400">
              Faltan datos para armar el cruce COP↔VES. Revisa la conexión o
              intenta más tarde.
            </p>
          ) : (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Indica cuántos <strong>VES</strong> te dan por{" "}
              <strong>1 COP</strong> según tu acuerdo.
            </p>
          )}

          <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700">
            {channel === "private" &&
            (!privateVesPerCop.trim() || privateRate === null) ? (
              <p className="text-neutral-600 dark:text-neutral-400">
                Escribe el precio particular (VES por 1 COP) para ver el
                equivalente.
              </p>
            ) : result === null ? (
              <p className="text-neutral-600 dark:text-neutral-400">
                Escribe un monto válido para ver la conversión.
              </p>
            ) : (
              <div className="text-lg text-neutral-800 dark:text-neutral-100">
                <span className="block text-sm font-normal text-neutral-500">
                  {amountUnit === "cop" ? (
                    <>
                      {formatCop(amountN!)} COP ×{" "}
                      <span className="tabular-nums">
                        {formatRate(vesPerCopEff!)}
                      </span>{" "}
                      VES/COP
                    </>
                  ) : (
                    <>
                      {formatBs(amountN!)} VES ×{" "}
                      <span className="tabular-nums">
                        {formatRate(copPerVesEff!)}
                      </span>{" "}
                      COP/VES
                    </>
                  )}
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    ≈
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyResult()}
                    className="inline-flex min-h-[2.75rem] flex-col items-start justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-amber-500 hover:bg-amber-50/60 active:scale-[0.99] dark:border-neutral-600 dark:bg-neutral-950 dark:hover:border-amber-500 dark:hover:bg-amber-950/20"
                    aria-label="Copiar resultado"
                  >
                    <span className="font-semibold tabular-nums">
                      {amountUnit === "cop"
                        ? `${formatBs(result)} Bs.S`
                        : `${formatCop(result)} COP`}
                    </span>
                    <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                      {copiedHint ? "Copiado" : "Toca para copiar"}
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
