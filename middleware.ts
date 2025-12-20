import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'zh' // 当访问 / 时，自动重定向到 /zh
});

export const config = {
  // 匹配所有路径，除了 api、_next 等静态资源
  matcher: ['/', '/(zh|en)/:path*']
};