import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@genkit-ai/google-genai',
    '@genkit-ai/core',
    'genkit',
    'firebase-admin',
    'google-auth-library',
  ],
};

export default nextConfig;
