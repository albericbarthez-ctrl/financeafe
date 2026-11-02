export const idr = (v: { toString(): string } | number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v.toString()));
export const dateId = (d: Date) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(d);
