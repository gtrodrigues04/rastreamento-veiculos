import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThemeRegistry from './components/ThemeRegistry/TeamRegistry'
import { NavBar } from './components/NavBar'
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Imersão 14 sistema de rastreabilidade de veículos',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <NavBar/>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
