<template>
  <div>
    <VitePwaManifest />

    <div
      v-if="isInitializing"
      class="min-h-screen flex flex-col items-center justify-center bg-indigo-100 transition-colors duration-200"
    >
      <PreferencesLoader size="80px" />
      <span
        class="mt-6 text-sm font-mono text-slate-500 dark:text-slate-400 animate-pulse tracking-wide"
      >
        Loading preferences...
      </span>
    </div>

    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>

    <ToastContainer />
    <LazyConfirmModal />
    <PwaInstallPrompt />
    <PwaUpdatePrompt />
  </div>
</template>

<script setup>
import { useSettingsStore } from "@/stores/settings";
import { onMounted, ref } from "vue";
import { usePresence } from "~/composables/usePresence";
import { useIndexedDB } from "~/composables/useIndexedDB";

const { initPresence } = usePresence();
const { getItem } = useIndexedDB(); // Pull in your new async storage!

const settings = useSettingsStore();

// NEW: State to block the UI from rendering prematurely
const isInitializing = ref(true);

useHead({
  bodyAttrs: {
    class: "bg-slate-50 dark:bg-slate-900 transition-colors duration-200",
  },
});

// NEW: Converted to an async flow
const bootGlobalPreferences = async () => {
  // If running on the server, just let it render immediately
  if (!process.client) {
    isInitializing.value = false;
    return;
  }

  try {
    await settings.initTheme();

    // 1. Restore Theme Color & PWA Status Bar via IndexedDB
    const colorObj = await getItem("app-theme-color");

    if (colorObj) {
      // Inject CSS variables
      for (const [shade, hex] of Object.entries(colorObj.values)) {
        document.documentElement.style.setProperty(`--primary-${shade}`, hex);
      }

      // Hijack PWA meta tag
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement("meta");
        metaTheme.setAttribute("name", "theme-color");
        document.head.appendChild(metaTheme);
      }
      metaTheme.setAttribute("content", colorObj.values[600]);
    }

    // 2. Restore Typography Suite via IndexedDB
    const bundle = await getItem("app-typography-bundle");

    if (bundle) {
      document.documentElement.style.setProperty(
        "--app-font-sans",
        bundle.sans,
      );
      document.documentElement.style.setProperty(
        "--app-font-serif",
        bundle.serif,
      );
      document.documentElement.style.setProperty(
        "--app-font-mono",
        bundle.mono,
      );
    }
  } catch (error) {
    console.error("Failed to load preferences from IndexedDB:", error);
  } finally {
    // No matter what happens, drop the loader and show the app!
    // A tiny 150ms timeout ensures the browser has painted the CSS variables before revealing the DOM
    setTimeout(() => {
      isInitializing.value = false;
    }, 150);
  }
};

onMounted(() => {
  initPresence();
  bootGlobalPreferences();
});
</script>
