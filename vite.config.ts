import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// ============================================================
// Two-pass build for web extension compatibility:
//   Pass 1 (mode=firefox / chrome): background + sidebar (ES modules, code-splitting OK)
//   Pass 2 (mode=firefox-content / chrome-content): content script (IIFE, self-contained)
//
// Build scripts run both passes sequentially.
// ============================================================

function getBuildTarget(mode: string): string {
  return mode.startsWith('firefox') ? 'firefox' : 'chrome';
}

function isContentBuild(mode: string): boolean {
  return mode.endsWith('-content');
}

function getOutDir(mode: string): string {
  return getBuildTarget(mode) === 'firefox' ? 'dist-firefox' : 'dist-chromium';
}

function getManifestSource(mode: string): string {
  return getBuildTarget(mode) === 'firefox' ? 'src/manifest.v2.json' : 'src/manifest.v3.json';
}

function copyStaticAssets(mode: string) {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      // Only copy static assets on the app build (first pass), not content build
      if (isContentBuild(mode)) return;

      const outDir = getOutDir(mode);
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      copyFileSync(getManifestSource(mode), resolve(outDir, 'manifest.json'));
      copyFileSync('src/sidebar/sidebar.html', resolve(outDir, 'sidebar.html'));

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
  const buildTarget = getBuildTarget(mode);
  const outDir = getOutDir(mode);
  const contentBuild = isContentBuild(mode);

  const shared = {
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
    plugins: [copyStaticAssets(mode)],
  };

  if (contentBuild) {
    // Pass 2: Content script only — IIFE, no code splitting, no imports
    return {
      ...shared,
      build: {
        outDir,
        emptyOutDir: false, // Don't wipe pass 1 output
        sourcemap: buildTarget === 'firefox' ? 'inline' : false,
        rollupOptions: {
          input: {
            'content/content': resolve(__dirname, 'src/content/index.ts'),
          },
          output: {
            entryFileNames: '[name].js',
            format: 'iife',
          },
        },
      },
    };
  }

  // Pass 1: Background + Sidebar — ES modules, code splitting OK
  return {
    ...shared,
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: buildTarget === 'firefox' ? 'inline' : false,
      rollupOptions: {
        input: {
          'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
          'sidebar/sidebar': resolve(__dirname, 'src/sidebar/index.tsx'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          format: 'es',
        },
      },
    },
  };
});