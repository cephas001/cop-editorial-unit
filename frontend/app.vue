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

const settings = useSettingsStore();

// Run once when component mounts
settings.initTheme();

onMounted(() => {
  const saved = localStorage.getItem("app-theme-color");
  if (saved) {
    const colorObj = JSON.parse(saved);
    for (const [shade, hex] of Object.entries(colorObj.values)) {
      document.documentElement.style.setProperty(`--primary-${shade}`, hex);
    }
  }
});
</script>
