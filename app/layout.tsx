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
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
