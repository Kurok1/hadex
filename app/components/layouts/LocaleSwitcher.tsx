// src/components/LocaleSwitcher.tsx
'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Locale } from '@/i18n/config';
import { routing } from '@/i18n/routing';

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const items = routing.locales;

  const languages = [
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  function onChange(value: Locale) {
    // 使用React的并发特性处理路由切换
    startTransition(() => {
      router.replace(
        { pathname },
        { locale: value }
      );
    });
  }

  return (
    <div className='text-base-content'>
      <select 
        className="select select-success"
        value={locale}
        onChange={(e) => onChange(e.target.value as Locale)}
        disabled={isPending}
      >
        {languages.map((cur) => (
          <option key={cur['code']} value={cur['code']}>
            {cur['flag']}{cur['name']}
          </option>
        ))}
      </select>
    </div>
  );
}