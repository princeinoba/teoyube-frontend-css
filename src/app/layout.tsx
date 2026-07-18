import "./globals.css";
import NavBar from "@/components/NavBar";
import { TeoyubeAppStateProvider } from "@/components/productization/TeoyubeAppStateProvider";
import type { ReactNode } from "react";

export const metadata = {
  title: "Teoyube",
  description: "A Scripture-linked promise language for prayer and spiritual growth."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TeoyubeAppStateProvider>
          <NavBar />
          {children}
        </TeoyubeAppStateProvider>
      </body>
    </html>
  );
}
