import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentalRep — Rate. Trust. Rent with Confidence.",
  description: "South Africa's rental reputation platform. Verify tenants, rate landlords, and build trust in the rental market.",
  themeColor: "#0E9E92",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RentalRep",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
