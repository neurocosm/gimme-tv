import { defineConfig } from 'vite';

const stripFallbackImportMap = {
  name: 'strip-fallback-importmap',
  transformIndexHtml(html) {
    return html.replace(
      /\s*<!-- Fallback Three\.js import map[\s\S]*?<script type="importmap" id="three-importmap">[\s\S]*?<\/script>/,
      ''
    );
  },
};

export default defineConfig({
  base: './',
  plugins: [stripFallbackImportMap],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
