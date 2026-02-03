import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>DevTools Dashboard</title>
        <meta name="description" content="Graphical management dashboard for skills and tools" />
      </head>
      <body>{children}</body>
    </html>
  )
}