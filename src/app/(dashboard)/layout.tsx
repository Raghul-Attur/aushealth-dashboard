import { AppBar } from "@/components/shell/app-bar"
import { Footer } from "@/components/shell/footer"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <AppBar />
      <main className="flex-1">
        <div className="mx-auto max-w-[1440px] px-8 py-6">
          {children}
        </div>
      </main>
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  )
}

<style>{`[data-novu-root], #novu-notification-center { display: none !important; }`}</style>