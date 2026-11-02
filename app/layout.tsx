import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cờ Thú Việt Nam 3D — Cuộc phiêu lưu giữa đại ngàn",
  description:
    "Trò chơi Cờ Thú 3D lấy cảm hứng từ thiên nhiên và văn hóa dân gian Việt Nam. Điều khiển Voi Bản Đôn, Sư Tử Sơn Lâm, Hổ Đông Dương, Chó Phú Quốc, Mèo Nón Lá và Chuột Đồng!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${beVietnamPro.className} h-full antialiased`}
    >
      <body className={`${beVietnamPro.className} min-h-full flex flex-col overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
