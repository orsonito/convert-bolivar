import Link from "next/link";
import React, { type ReactNode } from "react";
import { currencyChannelHref } from "@/lib/flow";
import "./home.css";
import type { HomeProps } from "./home.types";

const iconRow = "h-6 w-6 shrink-0 sm:h-7 sm:w-7";
const iconGrid = "h-5 w-5 shrink-0 sm:h-6 sm:w-6";

function IconArrowsUpDown({
  className = iconRow,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 4v6M9 7l3-3 3 3M12 20v-6M9 17l3 3 3-3" />
    </svg>
  );
}

function IconCop({ className = iconGrid }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 4v16M9 8h4.5a2.5 2.5 0 010 5H9M9 16h5a2.5 2.5 0 000-5H9" />
    </svg>
  );
}

function IconBinance({ className = iconRow }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174v-.001L9.2721 12l2.7164-2.7154zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z"
      />
    </svg>
  );
}

function HomeActionLink({
  href,
  label,
  icon,
  className,
  external,
  iconWrapperClassName,
  variant = "wide",
}: {
  href: string;
  label: ReactNode;
  icon: ReactNode;
  className: string;
  external?: boolean;
  iconWrapperClassName?: string;
  /** `grid`: dos columnas arriba. `wide`: fila completa (Binance). */
  variant?: "grid" | "wide";
}) {
  const iconWrap =
    iconWrapperClassName ??
    "bg-white/25 text-current shadow-inner dark:bg-black/20";

  const isGrid = variant === "grid";
  const iconBox = isGrid
    ? `flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${iconWrap}`
    : `flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14 ${iconWrap}`;

  const labelClass = isGrid
    ? "text-center text-[0.7rem] font-semibold leading-snug sm:text-xs"
    : "min-w-0 flex-1 text-left text-base font-semibold leading-snug sm:text-lg";

  const inner = isGrid ? (
    <>
      <span className={iconBox} aria-hidden>
        {icon}
      </span>
      <span className={labelClass}>{label}</span>
    </>
  ) : (
    <>
      <span className={iconBox} aria-hidden>
        {icon}
      </span>
      <span className={labelClass}>{label}</span>
    </>
  );

  const layout = isGrid
    ? "flex min-h-[6.75rem] w-full flex-col items-center justify-center gap-2 px-2 py-3 sm:min-h-[7.25rem] sm:gap-2.5 sm:px-3"
    : "flex min-h-[4.5rem] w-full items-center gap-3 px-4 py-3.5 sm:min-h-[4.75rem] sm:gap-4 sm:px-5 sm:py-4";

  const cls = `${layout} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

const Home = ({}: HomeProps) => {
  const btnBase =
    "rounded-2xl shadow-md transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <main className="home mx-auto flex min-h-full max-w-lg flex-col gap-8 px-4 py-8 sm:gap-10 sm:py-10">
      <h1 className="pb-2 text-center text-xl font-semibold tracking-tight sm:text-2xl">
        ¿Qué quieres hacer?
      </h1>

      <div className="flex flex-col gap-3 sm:gap-4">
        <ul className="grid grid-cols-2 gap-2 sm:gap-3">
          <li className="min-w-0">
            <HomeActionLink
              href="/currency?channel=bcv"
              variant="grid"
              label={
                <>
                  <span className="block">Comprar / Vender</span>
                  <span className="mt-1 block font-medium text-emerald-100/95 dark:text-emerald-100/90">
                    A BCV
                  </span>
                </>
              }
              icon={<IconArrowsUpDown className={iconGrid} />}
              className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500`}
            />
          </li>
          <li className="min-w-0">
            <HomeActionLink
              href={currencyChannelHref("private")}
              variant="grid"
              label={
                <>
                  <span className="block">Comprar / Vender</span>
                  <span className="mt-1 block font-medium text-emerald-900/90 dark:text-emerald-50/95">
                    A un particular
                  </span>
                </>
              }
              icon={<IconArrowsUpDown className={iconGrid} />}
              className={`${btnBase} border-2 border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 focus-visible:outline-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-50 dark:hover:bg-emerald-900/50`}
            />
          </li>
        </ul>

        <ul className="grid grid-cols-2 gap-2 sm:gap-3">
          <li className="min-w-0">
            <HomeActionLink
              href="/cop?channel=bcv"
              variant="grid"
              label={
                <>
                  <span className="block">Peso colombiano</span>
                  <span className="mt-1 block font-medium text-amber-50/95 dark:text-amber-50/90">
                    Referencia COP↔VES
                  </span>
                </>
              }
              icon={<IconCop className={iconGrid} />}
              className={`${btnBase} bg-amber-500 text-white hover:bg-amber-600 focus-visible:outline-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500`}
            />
          </li>
          <li className="min-w-0">
            <HomeActionLink
              href="/cop?channel=private"
              variant="grid"
              label={
                <>
                  <span className="block">Peso colombiano</span>
                  <span className="mt-1 block font-medium text-amber-950/90 dark:text-amber-50/95">
                    Particular COP↔VES
                  </span>
                </>
              }
              icon={<IconCop className={iconGrid} />}
              className={`${btnBase} border-2 border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100 focus-visible:outline-amber-500 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50 dark:hover:bg-amber-900/50`}
            />
          </li>
        </ul>

        <ul className="grid grid-cols-1">
          <li>
            <HomeActionLink
              href="/p2p"
              variant="wide"
              label="Consultar ofertas Binance"
              icon={<IconBinance />}
              iconWrapperClassName="bg-[#F0B90B]/15 text-[#F0B90B] shadow-inner ring-1 ring-[#F0B90B]/35"
              className={`${btnBase} border border-[#F0B90B]/25 bg-[#0B0E11] text-[#F0B90B] shadow-lg shadow-black/25 hover:border-[#F0B90B]/45 hover:bg-[#14181f] focus-visible:outline-[#F0B90B]`}
            />
          </li>
        </ul>
      </div>
    </main>
  );
};

export default Home;
