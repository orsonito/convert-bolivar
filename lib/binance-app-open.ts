/**
 * Abrir anuncio P2P en la app Binance (best effort). Binance no documenta rutas
 * `bnc://` estables; si falla, Android usa S.browser_fallback_url (HTTPS).
 *
 * Paquete Play Store: Binance global.
 */
export const BINANCE_ANDROID_PACKAGE = "com.binance.dev";

/** `bnc://` equivalente al enlace web p2p.binance.com (mismo path y query). */
export function binanceBncUrlFromWeb(webHttpsUrl: string): string {
  const u = new URL(webHttpsUrl);
  return `bnc://${u.host}${u.pathname}${u.search}`;
}

/**
 * Intent VIEW con esquema `bnc` y fallback al mismo URL HTTPS en el navegador.
 * @see https://developer.chrome.com/docs/multiscreen-android/intents
 */
export function binanceAndroidIntentHref(webHttpsUrl: string): string {
  const u = new URL(webHttpsUrl);
  const hostPathQuery = `${u.host}${u.pathname}${u.search}`;
  const fallback = encodeURIComponent(webHttpsUrl);
  return `intent://${hostPathQuery}#Intent;scheme=bnc;package=${BINANCE_ANDROID_PACKAGE};S.browser_fallback_url=${fallback};end`;
}

export function isAndroidUserAgent(ua: string): boolean {
  return /Android/i.test(ua);
}

export function isIosUserAgent(ua: string): boolean {
  return /iPhone|iPad|iPod/i.test(ua);
}
