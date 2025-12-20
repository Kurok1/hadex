import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Expose all HADEX_ prefixed environment variables to the client
  env: {
    HADEX_STORAGE_TYPE: process.env.HADEX_STORAGE_TYPE,
    HADEX_DB_NAME: process.env.HADEX_DB_NAME,
    HADEX_STORE_NAME: process.env.HADEX_STORE_NAME,
    HADEX_DB_VERSION: process.env.HADEX_DB_VERSION,
  },
};

export default withNextIntl(nextConfig);
