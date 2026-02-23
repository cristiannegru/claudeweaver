import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

const target = process.env.VITE_TARGET || (process.argv.includes('firefox') ? 'firefox' : 'chrome');

function getManifestSource(): string {
  return target === 'firefox' ? 'src/manifest.v2.json' : 'src/manifest.v3.json';
}

function getOutDir(): string {
  return target === 'firefox' ? 'dist-firefox' : 'dist-chromium';
}

// Plugin to copy manifest + sidebar.html into dist
function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const outDir = getOutDir();
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      copyFileSync(getManifestSource(), resolve(outDir, 'manifest.json'));
      copyFileSync('src/sidebar/sidebar.html', resolve(outDir, 'sidebar.html'));

      // Copy icon assets
      const assetsDir = resolve(outDir, 'assets');
      if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true });
      for (const icon of ['icon-16.png', 'icon-48.png', 'icon-128.png']) {
        const src = resolve('src/assets', icon);
        if (existsSync(src)) copyFileSync(src, resolve(assetsDir, icon));
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const buildTarget = mode === 'firefox' ? 'firefox' : 'chrome';
  const outDir = buildTarget === 'firefox' ? 'dist-firefox' : 'dist-chromium';

  return {
    define: {
      __PLATFORM__: JSON.stringify(buildTarget),
    },
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'src/shared'),
        '@content': resolve(__dirname, 'src/content'),
        '@sidebar': resolve(__dirname, 'src/sidebar'),
        '@background': resolve(__dirname, 'src/background'),
      },
    },
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: buildTarget === 'firefox' ? 'inline' : false,
      rollupOptions: {
        input: {
          'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
          'content/content': resolve(__dirname, 'src/content/index.ts'),
          'sidebar/sidebar': resolve(__dirname, 'src/sidebar/index.tsx'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          format: 'es',
        },
      },
    },
    plugins: [copyStaticAssets()],
  };
});
