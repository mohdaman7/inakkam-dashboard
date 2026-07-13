import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 7001,
        proxy: {
            '/api': {
                // target: 'http://localhost:7000',
                target: 'http://82.29.165.57:7000',
                changeOrigin: true,
            },
        },
    },
});
