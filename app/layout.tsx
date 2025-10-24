// app/layout.tsx
import './globals.css'  

export const metadata = {
  title: 'sMeNa.Tv',
  description: 'Народное телевидение нового поколения',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
