import type { BcvRateSnapshot } from "@/lib/bcv-rate";
import type { CopVesCrossRate } from "@/lib/cop-ves";
import "./rate-ticker.css";

type RateTickerProps = {
  usd: BcvRateSnapshot | null;
  eur: BcvRateSnapshot | null;
  copCross: CopVesCrossRate;
};

function formatFallbackPrice(price: number) {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatVesPerCop(n: number) {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(n);
}

function formatCopPerVes(n: number) {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function rateCell(snapshot: BcvRateSnapshot | null, unit: string): string {
  if (!snapshot) {
    return "—";
  }
  if (snapshot.rateLabel) {
    return snapshot.rateLabel;
  }
  if (snapshot.price != null) {
    return `1 ${unit} ≈ ${formatFallbackPrice(snapshot.price)} VES`;
  }
  return "—";
}

function copCrossCell(cross: CopVesCrossRate): string {
  if (!cross.ok || cross.vesPerCop == null || cross.copPerVes == null) {
    return "—";
  }
  return `1 COP ≈ ${formatVesPerCop(cross.vesPerCop)} VES · 1 VES ≈ ${formatCopPerVes(cross.copPerVes)} COP`;
}

function footNote(
  usd: BcvRateSnapshot | null,
  eur: BcvRateSnapshot | null,
  cross: CopVesCrossRate,
): string | null {
  const bcv =
    usd?.date && usd?.time
      ? `BCV ${usd.date} · ${usd.time}`
      : eur?.date && eur?.time
        ? `BCV ${eur.date} · ${eur.time}`
        : null;
  const cop = cross.copQuoteDate ? `COP/USD ${cross.copQuoteDate}` : null;
  const parts = [bcv, cop].filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  return parts.join(" · ");
}

export default function RateTicker({ usd, eur, copCross }: RateTickerProps) {
  const stamp = footNote(usd, eur, copCross);

  return (
    <div
      className="rate-ticker"
      role="region"
      aria-label="Tasas de referencia del día"
    >
      <div className="rate-ticker__wrap">
        <table className="rate-ticker__table">
          <caption className="rate-ticker__caption">
            Referencia · BCV y COP
          </caption>
          <thead>
            <tr>
              <th scope="col">Moneda</th>
              <th scope="col">Tasa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dólar (USD)</td>
              <td className="rate-ticker__rate">{rateCell(usd, "USD")}</td>
            </tr>
            <tr>
              <td>Euro (EUR)</td>
              <td className="rate-ticker__rate">{rateCell(eur, "EUR")}</td>
            </tr>
            <tr>
              <td>Peso (COP)</td>
              <td className="rate-ticker__rate">{copCrossCell(copCross)}</td>
            </tr>
          </tbody>
          {stamp ? (
            <tfoot>
              <tr>
                <td colSpan={2} className="rate-ticker__foot">
                  {stamp}
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}
