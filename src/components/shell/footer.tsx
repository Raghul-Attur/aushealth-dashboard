export function Footer() {
    return (
      <footer className="border-t border-border-subtle bg-surface mt-12">
        <div className="mx-auto max-w-[1440px] px-8 py-6 flex items-center justify-between text-micro text-text-tertiary">
          <div>
            Data: APRA Quarterly Private Health Insurance Statistics, December 2025 · Licensed under{" "}
            <a href="https://creativecommons.org/licenses/by/3.0/au/" className="underline hover:text-text-secondary">
              CC BY 3.0 AU
            </a>
          </div>
          <div className="flex gap-4">
            <a href="#methodology" className="hover:text-text-secondary">Methodology</a>
            <a href="#export" className="hover:text-text-secondary">Export</a>
          </div>
        </div>
      </footer>
    )
  }