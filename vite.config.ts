import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Collects all VITE_ environment variables to serialize for client-side use
const collectVercelEnvVars = () => {
  const envVars: Record<string, string> = {};
  for (const key in process.env) {
    if (key.startsWith('VITE_')) {
      envVars[key] = process.env[key] as string;
    }
  }
  return JSON.stringify(envVars);
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Define environment variables for both development and production
  define: {
    // This makes environment variables available at build time
    // Vercel will inject these at build time
    VITE_VERCEL_ENV_VARS: JSON.stringify(collectVercelEnvVars())
  }
}));
