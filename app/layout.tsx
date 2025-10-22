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
      <body>{children}</body>
    </html>
  )
}
