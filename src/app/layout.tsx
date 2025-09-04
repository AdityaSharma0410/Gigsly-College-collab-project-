import type { Metadata } from 'next'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import WaterDroplets from '@/components/WaterDroplets'

export const metadata: Metadata = {
  title: 'GIGSLY - Professional Services Marketplace',
  description: 'A stunning platform where professionals connect and collaborate on high-value projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WaterDroplets />
        <CustomCursor />
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
} 