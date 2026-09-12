function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const supabaseUrl = getRequiredEnvironmentVariable(
  "NEXT_PUBLIC_SUPABASE_URL",
);

export const supabasePublishableKey = getRequiredEnvironmentVariable(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
);