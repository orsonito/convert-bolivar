export type CurrencyPageProps = {
  searchParams: Promise<{
    action?: string;
    channel?: string;
    mode?: string;
  }>;
};
