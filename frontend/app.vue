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

const settings = useSettingsStore();

// Run once when component mounts
settings.initTheme();
</script>
