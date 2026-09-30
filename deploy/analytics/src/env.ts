export interface Env {
   DB: D1Database;
   ASSETS: Fetcher;
   ADMIN_HOST: string;
   COLLECT_HOST: string;
   ALLOWED_ORIGINS: string;
   ACCESS_TEAM_DOMAIN: string;
   ACCESS_AUD: string;
   RETENTION_DAYS: string;
   DEV_NO_AUTH?: string;
}
