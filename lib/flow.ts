export type ActionSlug =
  | "buy-bcv"
  | "buy-private"
  | "sell-bcv"
  | "sell-private"
  | "convert-bcv"
  | "convert-private";

/** Paso previo a elegir moneda: tasa BCV vs particular. */
export type FlowChannel = "bcv" | "private";

export type CurrencySlug = "usd" | "eur";

/** Query en /currency para el flujo unificado comprar/vender (misma conversión). */
export const CURRENCY_CONVERT_MODE = "convert";

export const ACTIONS: { slug: ActionSlug; label: string }[] = [
  { slug: "buy-bcv", label: "Comprar a BCV" },
  { slug: "buy-private", label: "Comprar a un particular" },
  { slug: "sell-bcv", label: "Vender a BCV" },
  { slug: "sell-private", label: "Vender a un particular" },
  { slug: "convert-bcv", label: "Conversión BCV" },
  { slug: "convert-private", label: "Conversión particular" },
];

export const CURRENCIES: { slug: CurrencySlug; label: string }[] = [
  { slug: "usd", label: "Dólares" },
  { slug: "eur", label: "EUROS" },
];

export function isActionSlug(v: string | null): v is ActionSlug {
  return (
    v === "buy-bcv" ||
    v === "buy-private" ||
    v === "sell-bcv" ||
    v === "sell-private" ||
    v === "convert-bcv" ||
    v === "convert-private"
  );
}

export function isCurrencySlug(v: string | null): v is CurrencySlug {
  return v === "usd" || v === "eur";
}

export function actionLabel(slug: ActionSlug): string {
  return ACTIONS.find((a) => a.slug === slug)?.label ?? slug;
}

export function isPrivateAction(slug: ActionSlug): boolean {
  return (
    slug === "buy-private" ||
    slug === "sell-private" ||
    slug === "convert-private"
  );
}

export function isConvertFlowAction(slug: ActionSlug): boolean {
  return slug === "convert-bcv" || slug === "convert-private";
}

export function isFlowChannel(v: string | null | undefined): v is FlowChannel {
  return v === "bcv" || v === "private";
}

export function isConvertMode(v: string | null | undefined): boolean {
  return v === CURRENCY_CONVERT_MODE;
}

/** `/currency?channel=…&mode=convert` */
export function currencyChannelHref(channel: FlowChannel): string {
  return `/currency?channel=${channel}&mode=${CURRENCY_CONVERT_MODE}`;
}

/** Volver desde /convert al paso de moneda. */
export function currencyStepHref(action: ActionSlug): string {
  if (
    action === "convert-bcv" ||
    action === "buy-bcv" ||
    action === "sell-bcv"
  ) {
    return currencyChannelHref("bcv");
  }
  if (
    action === "convert-private" ||
    action === "buy-private" ||
    action === "sell-private"
  ) {
    return currencyChannelHref("private");
  }
  return `/currency?action=${action}`;
}

export function actionFromChannel(channel: FlowChannel): ActionSlug {
  return channel === "bcv" ? "convert-bcv" : "convert-private";
}

/** Texto introductorio en /currency?channel=… */
export function currencyChannelTitle(channel: FlowChannel): string {
  return channel === "bcv"
    ? "Conversión con tasa BCV"
    : "Conversión con un particular";
}

export function currencyPageEyebrow(action: ActionSlug): string {
  if (isConvertFlowAction(action)) {
    return action === "convert-bcv" ? "BCV" : "Particular";
  }
  const buy = action.startsWith("buy");
  const verb = buy ? "Comprar" : "Vender";
  const ctx = isPrivateAction(action) ? "Particular" : "BCV";
  return `${verb} · ${ctx}`;
}

export function currencyPageHeading(): string {
  return "¿En qué moneda?";
}

export function convertPageEyebrow(
  action: ActionSlug,
  unitLabel: string,
): string {
  if (action === "convert-bcv") {
    return `BCV · ${unitLabel}`;
  }
  if (action === "convert-private") {
    return `Particular · ${unitLabel}`;
  }
  const buy = action.startsWith("buy");
  const verb = buy ? "Comprar" : "Vender";
  const ctx = isPrivateAction(action) ? "Particular" : "BCV";
  return `${verb} · ${ctx} · ${unitLabel}`;
}

export function convertPageHeading(): string {
  return "¿Cuánto quieres convertir?";
}
