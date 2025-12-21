/**
 * Copyright 2025 Kurok1
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { routing } from '@/i18n/routing'
import { Locale } from '@/i18n/config'
import { setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

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

export default async function RootLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale; // 类型断言
  
  // 验证语言是否支持，不支持则返回404
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  
  // 设置请求的语言
  setRequestLocale(locale);
  
  return (
    <NextIntlClientProvider locale={locale}>
          <ThemeProvider 
            attribute="data-theme" 
            defaultTheme="light"
            enableSystem={false} // 如果你只想在 light 和 dracula 切换，建议禁用系统同步
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
  )
}
