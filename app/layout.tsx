import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentalRep — Rate. Trust. Rent with Confidence.",
  description: "South Africa's rental reputation platform. Verify tenants, rate landlords, and build trust in the rental market.",
  themeColor: "#07312C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
