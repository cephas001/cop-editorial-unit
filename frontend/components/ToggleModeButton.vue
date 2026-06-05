<template>
  <button
    @click="settings.toggleDarkMode"
    aria-label="Toggle Dark Mode"
    class="text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 transition-colors duration-200 flex items-center justify-center"
  >
    <Icon
      :name="
        settings.color_theme === 'light'
          ? 'material-symbols:light-mode-outline-rounded'
          : 'material-symbols:dark-mode-outline-rounded'
      "
      class="text-xl"
    />
  </button>
</template>

<script setup>
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
</script>
