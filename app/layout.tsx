import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bad Bunny SB LX - First Song Predictor",
  description: "Prediction model for Bad Bunny's first song at Super Bowl LX. Model vs. market edge detection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
