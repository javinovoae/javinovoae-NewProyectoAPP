import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const environment = config.env.environment || 'development';

      const envs = {
        development: {
          baseUrl: 'http://localhost:8100',
          apiUrl: 'http://127.0.0.1:8000',
        },
        staging: {
          baseUrl: 'https://staging.tu-app.com',
          apiUrl: 'https://api.staging.tu-app.com',
        },
      };
      
      config.baseUrl = envs[environment].baseUrl;
      config.env.apiUrl = envs[environment].apiUrl;
      
      return config;
    },
    excludeSpecPattern: ['**/*.spec.ts', '**/node_modules/**'],
  }
});