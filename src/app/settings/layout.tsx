import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "アカウント設定 | FitStamp",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
