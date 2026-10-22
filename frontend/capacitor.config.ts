import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ntyr.crm',
  appName: 'NTYR CRM',
  webDir: 'dist',
  server: {
    port: 5173,
    url: 'http://10.0.2.2:5173',
  },
};

export default config;
