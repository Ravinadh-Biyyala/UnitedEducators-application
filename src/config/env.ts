/**
 * Type-safe environment variables. All env access goes through here.
 */
interface AppEnv {
  apiBaseUrl: string;
  appName: string;
  isDev: boolean;
  isProd: boolean;
}

export const env: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  appName: import.meta.env.VITE_APP_NAME ?? 'Underwriter Workbench',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
