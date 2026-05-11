export function Footer() {
  return (
    <footer className="relative z-[2]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 py-10 font-sans text-micro text-text-tertiary">
        <div>
          AusHealth is a demonstration product. Data: APRA Quarterly Private
          Health Insurance Statistics, December 2025. Licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by/3.0/au/"
            className="underline hover:text-bupa-navy"
          >
            CC BY 3.0 AU
          </a>
          .
        </div>
        <div className="flex gap-5">
          <a href="#methodology" className="hover:text-bupa-navy">
            Methodology
          </a>
          <a href="#glossary" className="hover:text-bupa-navy">
            Glossary
          </a>
          <a href="#export" className="hover:text-bupa-navy">
            Export
          </a>
        </div>
      </div>
    </footer>
  )
}
