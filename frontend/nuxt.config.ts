// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/icon",
    "@nuxt/ui",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "@vueuse/motion/nuxt",
  ],
  css: ["~/assets/css/main.css"],

  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
        },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || "http://localhost:5000/api",
      vapidKey: process.env.NUXT_PUBLIC_VAPID_KEY || "",
    },
  },

  pwa: {
    // --- NEW: Tell Vite PWA we are writing our own Service Worker ---
    strategies: "injectManifest",
    srcDir: "public",
    filename: "sw.js",
    // --------------------------------------------------------------

    registerType: "autoUpdate",
    manifest: {
      name: "The Vineyard's Voice",
      short_name: "The Vineyard",
      description: "Team collaboration and editorial management platform.",
      theme_color: "#4f46e5",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },

    // --- NEW: Replaces the 'workbox' block so offline caching still works ---
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    // ------------------------------------------------------------------------

    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: "module",
    },
  },
});
