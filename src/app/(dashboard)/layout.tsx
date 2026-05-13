import { AppBar } from "@/components/shell/app-bar"
import { Footer } from "@/components/shell/footer"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="scene">
      {/* Film grain overlay */}
      <div className="grain" aria-hidden />

      <AppBar />

      <main className="relative z-10 flex-1">
        <div className="mx-auto max-w-[1440px] px-10 py-8">
          {children}
        </div>
      </main>

      <div className="relative z-10 mt-16">
        <Footer />
      </div>
    </div>
  )
}