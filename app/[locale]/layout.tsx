import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { routing } from '@/i18n/routing'
import { Locale } from '@/i18n/config'
import { setRequestLocale } from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

// 静态生成所有语言的路由
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

type SupportedLocales = 'en' | 'zh';

export default async function RootLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as SupportedLocales; // 类型断言
  
  // 验证语言是否支持，不支持则返回404
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  
  // 设置请求的语言
  setRequestLocale(locale);
  
  return (
    <NextIntlClientProvider>
      {children}
    </NextIntlClientProvider>
  )
}
