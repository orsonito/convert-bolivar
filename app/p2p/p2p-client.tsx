"use client";

import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import BackNav from "@/components/back-nav/back-nav";
import {
  binanceAndroidIntentHref,
  binanceBncUrlFromWeb,
  isAndroidUserAgent,
  isIosUserAgent,
} from "@/lib/binance-app-open";
import {
  binanceP2pAdvertiserUrl,
  type BinanceP2pDataRow,
  type BinanceP2pSearchResponse,
} from "@/lib/binance-p2p";
import "./p2p.css";

/** Unidad monetaria pequeña y discreta junto a cifras. */
function CurrencySuffix({ children }: { children: ReactNode }) {
  return (
    <span className="ml-0.5 align-baseline text-[0.65rem] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
      {children}
    </span>
  );
}

const svgIconClass = "h-[1.125rem] w-[1.125rem] shrink-0";

/** Prioriza app Binance en móvil (intent / bnc://); en escritorio abre el enlace HTTPS. */
function BinanceAdvertiserLink({
  webUrl,
  className,
  children,
}: {
  webUrl: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={webUrl}
      className={className}
      rel="noopener noreferrer"
      target="_blank"
      onClick={(e) => {
        const ua =
          typeof navigator !== "undefined" ? navigator.userAgent : "";
        if (isAndroidUserAgent(ua)) {
          e.preventDefault();
          window.location.href = binanceAndroidIntentHref(webUrl);
          return;
        }
        if (isIosUserAgent(ua)) {
          e.preventDefault();
          const bnc = binanceBncUrlFromWeb(webUrl);
          window.location.href = bnc;
          const t = window.setTimeout(() => {
            if (document.visibilityState === "visible") {
              window.location.assign(webUrl);
            }
          }, 1500);
          const onVis = () => {
            if (document.visibilityState === "hidden") {
              window.clearTimeout(t);
              document.removeEventListener("visibilitychange", onVis);
            }
          };
          document.addEventListener("visibilitychange", onVis);
        }
      }}
    >
      {children}
    </a>
  );
}

type P2pSide = "comprar" | "vender";

function MobileSection({
  icon,
  children,
  first,
  side,
}: {
  icon: ReactNode;
  children: ReactNode;
  first?: boolean;
  side: P2pSide;
}) {
  const circle =
    side === "comprar"
      ? "bg-emerald-50 text-[#15803d] dark:bg-emerald-950/50 dark:text-green-400"
      : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400";
  return (
    <div
      className={
        first
          ? "flex gap-3"
          : "mt-3 flex gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800"
      }
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${circle}`}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function IconPriceTag() {
  return (
    <svg
      className={svgIconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg
      className={svgIconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg
      className={svgIconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function IconReceiveUsdt() {
  return (
    <svg
      className={svgIconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg
      className={svgIconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function IconBank() {
  return (
    <svg
      className={svgIconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg
      className={svgIconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

/** Espera tras escribir en el monto antes de llamar a la API (ms). */
const SEARCH_DEBOUNCE_MS = 450;

function parseAmount(raw: string | undefined): number | null {
  if (raw === undefined || raw === null) {
    return null;
  }
  const n = Number.parseFloat(String(raw).replace(",", ".").trim());
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return n;
}

/** USDT que corresponden a `vesAmount` VES al precio `pricePerUsdt` (VES por 1 USDT). */
function formatUsdtFromVes(
  vesInput: string,
  pricePerUsdt: string | undefined,
): string | null {
  const ves = parseAmount(vesInput);
  const price = parseAmount(pricePerUsdt);
  if (ves === null || price === null) {
    return null;
  }
  const usdt = ves / price;
  if (!Number.isFinite(usdt) || usdt <= 0) {
    return null;
  }
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(usdt);
}

function formatPayMethods(row: BinanceP2pDataRow): string {
  const methods = row.adv?.tradeMethods;
  if (!methods?.length) {
    return "—";
  }
  return methods
    .map((m) => m.tradeMethodName ?? m.payType ?? "")
    .filter(Boolean)
    .join(", ");
}

function formatPositivePercent(value: number | null | undefined): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  const pct = value > 1 ? value : value * 100;
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded}%`;
}

function ReputationSimple({
  row,
  size = "default",
}: {
  row: BinanceP2pDataRow;
  size?: "default" | "compact";
}) {
  const a = row.advertiser;
  if (!a) {
    return <span className="text-neutral-400">Sin datos</span>;
  }

  const pct = formatPositivePercent(a.positiveRate ?? undefined);
  const n = a.monthOrderCount;
  const ordersLabel =
    n === null || n === undefined
      ? null
      : `${n} ${n === 1 ? "orden" : "órdenes"}`;

  const pctClass =
    size === "compact"
      ? "text-base font-bold tabular-nums text-[#15803d] dark:text-green-400"
      : "text-lg font-bold tabular-nums text-[#15803d] dark:text-green-400";

  return (
    <div className="space-y-0.5">
      <p className="text-sm leading-snug">
        {pct !== null ? (
          <>
            <span className={pctClass}>{pct}</span>
          </>
        ) : (
          <span className="text-neutral-500">Sin %</span>
        )}
      </p>
      {ordersLabel ? (
        <p className="text-[0.6875rem] leading-tight text-neutral-500 dark:text-neutral-400">
          {ordersLabel} este mes
        </p>
      ) : null}
    </div>
  );
}

function p2pLabels(side: P2pSide) {
  if (side === "comprar") {
    return {
      title: "Binance P2P · Comprar USDT",
      blurb:
        "Anuncios en los que alguien vende USDT: tú pagas en bolívares. Indica cuántos VES quieres usar.",
      tradeType: "SELL" as const,
      counterparty: "Vendedor",
      usdtMobileTitle: "USDT por tus VES (monto consultado)",
      usdtDesktop: "USDT por tus VES",
      usdtDesktopHint: "monto en VES ÷ precio",
      surplusMobile: "USDT que puede venderte",
      surplusDesktop: "USDT en venta",
      surplusHint: "máx. que ofrece",
      accentText: "text-[#15803d] dark:text-green-400",
      accentLink: "text-[#15803d] underline-offset-2 hover:underline dark:text-green-400",
      consultBtn: "bg-[#15803d] hover:bg-[#166534]",
    };
  }
  return {
    title: "Binance P2P · Vender USDT",
    blurb:
      "Anuncios de quienes compran USDT: tú recibes bolívares. Escribe el monto en VES; la lista se actualiza al poco rato de dejar de escribir.",
    tradeType: "BUY" as const,
    counterparty: "Comprador",
    usdtMobileTitle: "USDT que venderías (monto consultado)",
    usdtDesktop: "USDT a vender",
    usdtDesktopHint: "monto VES ÷ precio",
    surplusMobile: "USDT máx. que compra",
    surplusDesktop: "Tope de compra",
    surplusHint: "máx. que acepta",
    accentText: "text-red-600 dark:text-red-400",
    accentLink: "text-red-600 underline-offset-2 hover:underline dark:text-red-400",
    consultBtn: "bg-red-600 hover:bg-red-700",
  };
}

function rowModel(
  row: BinanceP2pDataRow,
  index: number,
  vesAmountInput: string,
) {
  const adv = row.adv;
  const priceStr = adv?.price;
  const advertiserNo = row.advertiser?.userNo;
  const advNo = adv?.advNo;
  const binanceHref =
    advertiserNo != null && String(advertiserNo).trim() !== ""
      ? binanceP2pAdvertiserUrl(String(advertiserNo), advNo ?? null)
      : null;

  return {
    key: adv?.advNo ?? `row-${index}`,
    price: adv?.price ?? "—",
    fiat: adv?.fiatUnit ?? "",
    asset: adv?.asset ?? "USDT",
    name: row.advertiser?.nickName ?? "—",
    surplus: adv?.surplusAmount ?? "—",
    pays: formatPayMethods(row),
    usdtForYourVes: formatUsdtFromVes(vesAmountInput, priceStr),
    binanceHref,
    row,
  };
}

export default function P2pClient() {
  const searchParams = useSearchParams();
  const side: P2pSide =
    searchParams.get("side") === "vender" ? "vender" : "comprar";
  const L = useMemo(() => p2pLabels(side), [side]);

  const [transAmount, setTransAmount] = useState("");
  /** VES usados para la columna USDT; se alinea con la última consulta exitosa a la API. */
  const [searchedVes, setSearchedVes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BinanceP2pSearchResponse | null>(null);

  const searchReqIdRef = useRef(0);

  const performSearch = useCallback(
    async (amountTrimmed: string) => {
      if (amountTrimmed === "") {
        searchReqIdRef.current += 1;
        setResult(null);
        setError(null);
        setSearchedVes("");
        setLoading(false);
        return;
      }
      if (parseAmount(amountTrimmed) === null) {
        return;
      }

      const id = ++searchReqIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/p2p/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transAmount: amountTrimmed,
            tradeType: L.tradeType,
          }),
        });
        const json = (await res.json()) as
          | BinanceP2pSearchResponse
          | { error?: string };

        if (id !== searchReqIdRef.current) {
          return;
        }

        if (!res.ok) {
          const msg =
            "error" in json && json.error === "trans_amount_required"
              ? "Indica un monto en VES."
              : "No se pudo consultar Binance P2P.";
          setError(msg);
          setResult(null);
          setSearchedVes("");
          return;
        }

        setSearchedVes(amountTrimmed);
        setResult(json as BinanceP2pSearchResponse);
        if (
          (json as BinanceP2pSearchResponse).success === false ||
          (json as BinanceP2pSearchResponse).code !== "000000"
        ) {
          setError(
            (json as BinanceP2pSearchResponse).message ??
              "La API devolvió un error.",
          );
        } else {
          setError(null);
        }
      } catch {
        if (id !== searchReqIdRef.current) {
          return;
        }
        setError("Error de red. Intenta de nuevo.");
        setResult(null);
        setSearchedVes("");
      } finally {
        if (id === searchReqIdRef.current) {
          setLoading(false);
        }
      }
    },
    [L.tradeType],
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      void performSearch(transAmount.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [transAmount, performSearch]);

  const searchNow = useCallback(() => {
    void performSearch(transAmount.trim());
  }, [performSearch, transAmount]);

  const rows = result?.data ?? [];
  const models = rows.map((row, i) => rowModel(row, i, searchedVes));

  return (
    <main className="p2p relative mx-auto max-w-4xl px-4 pb-10 pt-14">
      <BackNav href="/home">Volver</BackNav>
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        {L.title}
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-600 dark:text-neutral-400">
        {L.blurb}
      </p>

      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
          Monto a consultar
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Ej. 473"
              value={transAmount}
              onChange={(e) => setTransAmount(e.target.value)}
              aria-label="Monto en bolívares (Bs. o VES)"
              className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-3 pr-[5.25rem] text-right text-lg tabular-nums dark:border-neutral-600 dark:bg-neutral-950"
            />
            <span
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center border-l border-neutral-200 pl-2.5 pr-3 text-[0.7rem] font-medium tracking-wide text-neutral-400 dark:border-neutral-600 dark:text-neutral-500"
              aria-hidden
            >
              Bs · VES
            </span>
          </div>
        </label>
      </div>

      {error ? (
        <p className="mt-6 text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {result && models.length > 0 ? (
        <>
          {/* Móvil: tarjetas apiladas, ancho completo */}
          <ul className="mt-8 flex flex-col gap-3 md:hidden">
            {models.map((m) => (
              <li
                key={m.key}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <MobileSection side={side} icon={<IconPriceTag />} first>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Precio del anuncio
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {m.price}
                    <CurrencySuffix>
                      {m.fiat} <span className="lowercase">por cada</span> {m.asset}
                    </CurrencySuffix>
                  </p>
                </MobileSection>
                <MobileSection side={side} icon={<IconUser />}>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {L.counterparty}
                  </p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {m.name}
                  </p>
                </MobileSection>
                <MobileSection side={side} icon={<IconStar />}>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Reputación
                  </p>
                  <div className="mt-0.5">
                    <ReputationSimple row={m.row} />
                  </div>
                </MobileSection>
                <MobileSection side={side} icon={<IconReceiveUsdt />}>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {L.usdtMobileTitle}
                  </p>
                  <p
                    className={`mt-0.5 text-base font-semibold tabular-nums ${L.accentText}`}
                  >
                    {m.usdtForYourVes ?? "—"}
                    {m.usdtForYourVes ? (
                      <CurrencySuffix>{m.asset}</CurrencySuffix>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {m.usdtForYourVes ? (
                      <>
                        <span className="tabular-nums">{searchedVes}</span>
                        <CurrencySuffix>VES</CurrencySuffix>
                        {" ÷ "}
                        <span className="tabular-nums">{m.price}</span>
                        <CurrencySuffix>
                          {m.fiat ? `${m.fiat}/` : ""}
                          {m.asset}
                        </CurrencySuffix>
                      </>
                    ) : (
                      "Indica un monto VES válido (la lista se actualiza al escribir) o revisa el precio de la fila."
                    )}
                  </p>
                </MobileSection>
                <MobileSection side={side} icon={<IconWallet />}>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {L.surplusMobile}
                  </p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums">
                    {m.surplus}
                    <CurrencySuffix>{m.asset}</CurrencySuffix>
                  </p>
                </MobileSection>
                <MobileSection side={side} icon={<IconBank />}>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Formas de pago
                  </p>
                  <p className="mt-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
                    {m.pays}
                  </p>
                </MobileSection>
                <MobileSection side={side} icon={<IconExternal />}>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Binance
                  </p>
                  {m.binanceHref ? (
                    <BinanceAdvertiserLink
                      webUrl={m.binanceHref}
                      className={`mt-1 inline-block text-sm font-medium ${L.accentLink}`}
                    >
                      Abrir en Binance
                    </BinanceAdvertiserLink>
                  ) : (
                    <p className="mt-1 text-sm text-neutral-400">—</p>
                  )}
                </MobileSection>
              </li>
            ))}
          </ul>

          {/* Tablet/desktop: tabla sin scroll horizontal forzado */}
          <div className="mt-8 hidden md:block">
            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
                    <th className="px-3 py-2.5 font-semibold">Precio</th>
                    <th className="px-3 py-2.5 font-semibold">
                      <span className="block">{L.usdtDesktop}</span>
                      <span className="block text-xs font-normal text-neutral-500 dark:text-neutral-400">
                        {L.usdtDesktopHint}
                      </span>
                    </th>
                    <th className="px-3 py-2.5 font-semibold">{L.counterparty}</th>
                    <th className="px-3 py-2.5 font-semibold">Reputación</th>
                    <th className="px-3 py-2.5 font-semibold">
                      <span className="block">{L.surplusDesktop}</span>
                      <span className="block text-xs font-normal text-neutral-500 dark:text-neutral-400">
                        {L.surplusHint}
                      </span>
                    </th>
                    <th className="px-3 py-2.5 font-semibold">Pagos</th>
                    <th className="px-3 py-2.5 font-semibold">Binance</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr
                      key={m.key}
                      className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800"
                    >
                      <td className="px-3 py-2.5 align-top font-medium tabular-nums">
                        {m.price}
                        <CurrencySuffix>
                          {m.fiat}/{m.asset}
                        </CurrencySuffix>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <span
                          className={`font-semibold tabular-nums ${L.accentText}`}
                        >
                          {m.usdtForYourVes ?? "—"}
                        </span>
                        {m.usdtForYourVes ? (
                          <CurrencySuffix>{m.asset}</CurrencySuffix>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 align-top">{m.name}</td>
                      <td className="px-3 py-2.5 align-top">
                        <ReputationSimple row={m.row} size="compact" />
                      </td>
                      <td className="px-3 py-2.5 align-top tabular-nums">
                        <span className="font-semibold">{m.surplus}</span>
                        <CurrencySuffix>{m.asset}</CurrencySuffix>
                      </td>
                      <td className="px-3 py-2.5 align-top text-xs leading-snug text-neutral-700 dark:text-neutral-300">
                        {m.pays}
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        {m.binanceHref ? (
                          <BinanceAdvertiserLink
                            webUrl={m.binanceHref}
                            className={`inline-flex items-center gap-1 font-medium ${L.accentLink}`}
                          >
                            Abrir
                            <span className="inline-block shrink-0" aria-hidden>
                              <IconExternal />
                            </span>
                          </BinanceAdvertiserLink>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {result && models.length === 0 && !error ? (
        <p className="mt-8 text-center text-neutral-600 dark:text-neutral-400">
          No hay anuncios para este monto. Prueba otro valor.
        </p>
      ) : null}

    </main>
  );
}
