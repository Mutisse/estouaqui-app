import { defineConfig } from '#q-app/wrappers';
import { fileURLToPath } from 'node:url';

export default defineConfig((ctx) => {
  return {
    boot: ['i18n', 'axios'],
    css: ['app.scss'],
    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      typescript: {
        strict: true,
        vueShim: true,
      },
      vueRouterMode: 'hash',
      vitePlugins: [
        [
          '@intlify/unplugin-vue-i18n/vite',
          {
            ssr: ctx.modeName === 'ssr',
            include: [fileURLToPath(new URL('./src/i18n', import.meta.url))],
          },
        ],
        [
          'vite-plugin-checker',
          {
            vueTsc: true,
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Dialog', 'Loading'],
    },

    animations: [],
    ssr: {
      prodPort: 3000,
      middlewares: ['render'],
      pwa: false,
    },

    pwa: {
      workboxMode: 'GenerateSW',
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      injectPwaMetaTags: true,

      extendManifestJson() {
        return {
          name: 'EstouAqui',
          short_name: 'EstouAqui',
          description: 'Conectamos clientes e prestadores de serviços em Moçambique',
          theme_color: '#1976d2',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          lang: 'pt-MZ',
          icons: [
            { src: 'icons/icon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
          ]
        };
      },

      extendGenerateSWOptions(cfg) {
        cfg.navigateFallback = 'index.html';
        cfg.navigateFallbackDenylist = [/^\/api\//, /^\/admin\//];
        cfg.runtimeCaching = [];
        cfg.additionalManifestEntries = [];
        cfg.ignoreURLParametersMatching = [/^utm_/, /^fbclid$/];
        return cfg;
      }
    },

    cordova: {},
    capacitor: { hideSplashscreen: true },
    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: { appId: 'estouaqui-app' },
    },
    bex: { extraScripts: [] },
  };
});
