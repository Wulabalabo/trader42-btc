import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DB_PATH: z.string().default('./db/trader42.db'),
  OPENBB_BASE_URL: z.string().url(),
  AKTOOLS_BASE_URL: z.string().url(),
  TWITTER_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  DEEPSEEK_API_KEY: z.string().min(1),
  BINANCE_BASE_URL: z.string().default('https://api.binance.com'),
  BINANCE_FUTURES_BASE_URL: z.string().default('https://fapi.binance.com'),
  BINANCE_WS_URL: z.string().default('wss://stream.binance.com:9443/ws'),
});

export type Env = z.infer<typeof EnvSchema>;
export const buildEnv = (input: Record<string, unknown>) => EnvSchema.parse(input);