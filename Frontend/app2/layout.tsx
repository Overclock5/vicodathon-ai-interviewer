import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ViCodathon AI Interview Agent",
  description: "Adaptive AI technical interviewer built for ViCodathon."
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        {children}
      </body>
    </html>
  );
}