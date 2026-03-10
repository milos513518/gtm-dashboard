// app/layout.js
export const metadata = {
  title: "GTM Intelligence · PlusPlus",
  description: "Milos GTM Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#080810" }}>
        {children}
      </body>
    </html>
  );
}
