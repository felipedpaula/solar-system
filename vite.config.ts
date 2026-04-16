import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const repository = process.env.GITHUB_REPOSITORY;
    const repositoryParts = repository?.split('/');
    const repositoryName = repositoryParts && repositoryParts.length > 1 ? repositoryParts[1] : undefined;
    const productionBase = repositoryName ? `/${repositoryName}/` : '/solar-system/';

    return {
      base: mode === 'production' ? productionBase : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
