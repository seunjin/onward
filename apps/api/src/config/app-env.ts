export interface AppEnv {
  ACCESS_TOKEN_TTL?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY?: string;
  APPLE_TEAM_ID?: string;
  DATABASE_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  JWT_ACCESS_SECRET: string;
  PORT?: string;
  REFRESH_TOKEN_TTL_DAYS?: string;
}
