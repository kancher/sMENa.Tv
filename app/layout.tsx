import './globals.css'

export const metadata = {
  title: 'sMeNa.Tv',
  description: 'Народное телевидение нового поколения',
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
