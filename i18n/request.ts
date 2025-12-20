// src/i18n/request.ts
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * 翻译模块配置接口
 */
export interface TranslationModuleConfig {
  namespace: string; // 翻译键的命名空间
  fileName: string; // 文件名
}

// 定义所有翻译模块
const TRANSLATION_MODULES: readonly TranslationModuleConfig[] = [
  { namespace: 'Navbar', fileName: 'nav_bar' },
  { namespace: 'TextAnnotation', fileName: 'text_annotation' },
  { namespace: 'ExportDialog', fileName: 'export_dialog' },
];

// 动态加载单个翻译模块
const importTranslationModule = async (
  locale: string,
  moduleConfig: TranslationModuleConfig
) => {
  try {
    const modulePath = `./messages/${locale}/${moduleConfig.fileName}.json`;
    const importedModule = await import(modulePath);
    
    return {
      namespace: moduleConfig.namespace,
      content: importedModule.default,
      success: true,
    };
  } catch (error) {
    console.error(
      `[i18n] Failed to load module "${moduleConfig.fileName}" for locale "${locale}":`,
      error
    );
    
    return {
      namespace: moduleConfig.namespace,
      content: {},
      success: false,
      error,
    };
  }
};

// 加载指定语言的所有翻译消息
const loadMessages = async (locale: string) => {
  // 并行导入所有翻译模块以提高性能
  const moduleLoadPromises = TRANSLATION_MODULES.map(moduleConfig =>
    importTranslationModule(locale, moduleConfig)
  );
  
  const loadResults = await Promise.all(moduleLoadPromises);
  
  // 合并所有成功加载的模块内容
    return loadResults.reduce((acc, result) => {
      if (result.success) {
        acc[result.namespace] = result.content;
      }
      return acc;
    }, {} as Record<string, any>);
};

// 验证语言代码是否有效
const validateLocale = (locale: string | undefined): string => {
  if (typeof locale !== 'string') {
    console.warn(`[i18n] Invalid locale type: ${typeof locale}, falling back to default`);
    return routing.defaultLocale;
  }
  
  if (!hasLocale(routing.locales, locale)) {
    console.warn(
      `[i18n] Locale "${locale}" not supported, falling back to default (${routing.defaultLocale})`
    );
    return routing.defaultLocale;
  }
  
  return locale;
};

// 导出请求配置
export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const validatedLocale = validateLocale(requestedLocale);
  
  const messages = await loadMessages(validatedLocale);
  
  return {
    locale: validatedLocale,
    messages,
  };
});