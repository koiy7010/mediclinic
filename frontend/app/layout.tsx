import type { Metadata } from "next"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import Providers from "@/components/Providers"
import PatientPanel from "@/components/PatientPanel"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "MediClinic",
  description: "Health Records System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex bg-[hsl(var(--background))]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 md:pl-64">
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
          <PatientPanel />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
