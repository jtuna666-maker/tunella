import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tunella | Your business is always answering",
  description: "Tunella answers your business calls 24/7, books jobs, and takes messages while you work. AI phone receptionist for local contractors. Request a demo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
