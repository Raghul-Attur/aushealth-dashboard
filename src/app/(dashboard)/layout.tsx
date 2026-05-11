import { AppBar } from "@/components/shell/app-bar"
import { FilterBar } from "@/components/shell/filter-bar"
import { TabStrip } from "@/components/shell/tab-strip"
import { Footer } from "@/components/shell/footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="scene flex min-h-screen flex-col">
      <div className="grain" />
      <AppBar />
      <TabStrip />
      <FilterBar />
      <main className="relative z-[2] flex-1">
        <div className="mx-auto max-w-[1440px] px-10 pt-6 pb-10">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
