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
  
  const percent1 = new Intl.NumberFormat("en-AU", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  
  const ppFormatter = new Intl.NumberFormat("en-AU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "always",
  })
  
  export const fmt = {
    /** "$8.6B", "$417M" */
    currency: (n: number) => compactCurrency.format(n),
    /** "$8,627,365,235" */
    currencyFull: (n: number) => fullCurrency.format(n),
    /** "8.6B", "417M", "14.7M" */
    number: (n: number) => compactNumber.format(n),
    /** "85.1%" · input is decimal (0.851) */
    percent: (n: number) => percent1.format(n),
    /** "+0.6pp" or "-1.2pp" · input is decimal points (0.006) */
    pp: (n: number) => `${ppFormatter.format(n * 100)}pp`,
    /** "▲ 4.8%" or "▼ 28.2%" · input is decimal */
    delta: (n: number) => {
      const sign = n > 0 ? "▲" : n < 0 ? "▼" : "·"
      return `${sign} ${percent1.format(Math.abs(n))}`
    },
  }