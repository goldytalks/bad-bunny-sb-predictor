import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BB_PREDICT | SB LX First Song Terminal",
  description: "Prediction model for Bad Bunny's first song at Super Bowl LX. Model vs. market edge detection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#EAEAEA] text-black min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
