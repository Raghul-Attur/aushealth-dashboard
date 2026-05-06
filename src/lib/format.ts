const compactCurrency = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    notation: "compact",
    maximumFractionDigits: 1,
  })
  
  const fullCurrency = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  })
  
  const compactNumber = new Intl.NumberFormat("en-AU", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
  
  const percent = new Intl.NumberFormat("en-AU", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  
  const percentPoints = new Intl.NumberFormat("en-AU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "always",
  })
  
  export const fmt = {
    currency: (n: number) => compactCurrency.format(n),
    currencyFull: (n: number) => fullCurrency.format(n),
    number: (n: number) => compactNumber.format(n),
    percent: (n: number) => percent.format(n),
    pp: (n: number) => `${percentPoints.format(n)}pp`,
    delta: (n: number, type: "percent" | "absolute" = "percent") => {
      const sign = n > 0 ? "▲" : n < 0 ? "▼" : "—"
      const formatted = type === "percent" ? percent.format(Math.abs(n)) : compactNumber.format(Math.abs(n))
      return `${sign} ${formatted}`
    },
  }