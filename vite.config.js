import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [nodePolyfills()],
  resolve: {
    alias: {
      crypto: 'crypto-browserify', // Polyfill for crypto module
    },
  },
});
