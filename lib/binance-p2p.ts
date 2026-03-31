export const BINANCE_P2P_SEARCH_URL =
  "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

export type BinanceP2pSearchPayload = {
  fiat: string;
  asset: string;
  tradeType: string;
  transAmount: string;
  page: number;
  rows: number;
  payTypes: string[];
  publisherType: string;
  merchantCheck: boolean;
};

export const DEFAULT_P2P_SEARCH: Omit<BinanceP2pSearchPayload, "transAmount"> = {
  fiat: "VES",
  asset: "USDT",
  tradeType: "SELL",
  page: 1,
  rows: 10,
  payTypes: ["PagoMovil", "BankTransfer"],
  publisherType: "merchant",
  merchantCheck: true,
};

export function buildP2pSearchBody(
  transAmount: string,
  overrides?: Partial<Pick<BinanceP2pSearchPayload, "tradeType">>,
): BinanceP2pSearchPayload {
  return {
    ...DEFAULT_P2P_SEARCH,
    ...overrides,
    transAmount: transAmount.trim(),
  };
}

export type BinanceP2pTradeMethod = {
  payType?: string;
  tradeMethodName?: string | null;
  tradeMethodShortName?: string | null;
};

export type BinanceP2pAdv = {
  advNo?: string;
  tradeType?: string;
  asset?: string;
  fiatUnit?: string;
  price?: string;
  surplusAmount?: string | null;
  minSingleTransAmount?: string | null;
  maxSingleTransAmount?: string | null;
  payTimeLimit?: number | null;
  tradeMethods?: BinanceP2pTradeMethod[];
};

export type BinanceP2pAdvertiser = {
  userNo?: string | null;
  nickName?: string | null;
  orderCount?: number | null;
  monthOrderCount?: number | null;
  monthFinishRate?: number | null;
  positiveRate?: number | null;
  userGrade?: number | null;
};

export type BinanceP2pDataRow = {
  adv?: BinanceP2pAdv;
  advertiser?: BinanceP2pAdvertiser;
};

export type BinanceP2pSearchResponse = {
  code?: string;
  message?: string | null;
  messageDetail?: string | null;
  data?: BinanceP2pDataRow[];
  total?: number;
  success?: boolean;
};

/**
 * URL HTTPS del anunciante (P2P). En la UI P2P se usa con intent Android / `bnc://` en iOS
 * (`lib/binance-app-open.ts`) para intentar abrir la app; este enlace sigue siendo el fallback.
 */
export function binanceP2pAdvertiserUrl(
  advertiserUserNo: string,
  advNo?: string | null,
  locale: "en" | "es" = "es",
): string {
  const u = new URL(
    `https://p2p.binance.com/${locale}/advertiserDetail`,
  );
  u.searchParams.set("advertiserNo", advertiserUserNo);
  if (advNo) {
    u.searchParams.set("advNo", String(advNo));
  }
  return u.toString();
}
