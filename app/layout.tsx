import type { Metadata } from "next";
import "./globals.css";
import "./cat-assistant.css";
import "./desktop-v3.css";
import "./desktop-v4.css";
import "./desktop-v5.css";
import "./desktop-v6.css";
import "./desktop-v7.css";
import "./music-rooms.css";
import "./faroe.css";
import "./worlds.css";
import "./desktop-v8.css";
import "./arcade.css";
import "./archives.css";
import "./desktop-v9.css";
import "./desktop-v10.css";
import "./desktop-v11.css";
import "./desktop-v12.css";
import "./desktop-mobile.css";
import "./desktop-v15.css";
import "./desktop-v16.css";
import "./desktop-v17.css";
import "./desktop-v18.css";
import "./desktop-v19.css";
import "./desktop-v20.css";
import "./desktop-v21.css";
import "./desktop-v22.css";
import "./desktop-v23.css";
import "./desktop-v24.css";
import "./desktop-v25.css";
import "./desktop-v26.css";
import "./desktop-v31.css";
import "./dragon-flight.css";

export const metadata: Metadata = {
  title: "CTY AI STUDIO | Personal Works",
  description: "打开 CTY AI STUDIO 的复古电脑桌面，试玩 Minecraft Python、参观庭间的原始房屋设计，看看 AI 学习作品和家庭相册。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
