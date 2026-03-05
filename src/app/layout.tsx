import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Floor Plan 3D Builder",
  description: "AI-powered floor plan to 3D model converter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
