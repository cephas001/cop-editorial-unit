<template>
  <div>
    <VitePwaManifest />
    <NuxtLayout>
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
import { onMounted } from "vue";
import { usePresence } from "~/composables/usePresence";

const { initPresence } = usePresence();

const settings = useSettingsStore();

// Run once when component mounts
settings.initTheme();

const bootGlobalPreferences = () => {
  if (!process.client) return;

  // 1. Restore Theme Color & PWA Status Bar
  const savedColor = localStorage.getItem("app-theme-color");
  if (savedColor) {
    const colorObj = JSON.parse(savedColor);

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

  // 2. Restore Typography Suite
  const savedTypography = localStorage.getItem("app-typography-bundle");
  if (savedTypography) {
    const bundle = JSON.parse(savedTypography);
    document.documentElement.style.setProperty("--app-font-sans", bundle.sans);
    document.documentElement.style.setProperty(
      "--app-font-serif",
      bundle.serif,
    );
    document.documentElement.style.setProperty("--app-font-mono", bundle.mono);
  }
};

onMounted(() => {
  initPresence();
  bootGlobalPreferences();
});
</script>
