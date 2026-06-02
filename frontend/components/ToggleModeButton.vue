<template>
  <button
    @click="toggleDarkMode"
    aria-label="Toggle Dark Mode"
    class="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 transition-colors duration-200 flex items-center justify-center"
  >
    <Icon
      :name="
        color_theme === 'light'
          ? 'material-symbols:light-mode-outline-rounded'
          : 'material-symbols:dark-mode-outline-rounded'
      "
      class="text-xl"
    />
  </button>
</template>

<script setup>
import { ref, onMounted } from "vue";

const color_theme = ref("light");

const toggleDarkMode = () => {
  if (color_theme.value === "light") {
    document.documentElement.classList.add("dark");
    localStorage.setItem("color_theme", "dark");
    color_theme.value = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("color_theme", "light");
    color_theme.value = "light";
  }
};

onMounted(() => {
  // Only run in browser
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("color_theme");

    if (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color_theme", "dark");
      color_theme.value = "dark";
    } else if (stored === "dark") {
      document.documentElement.classList.add("dark");
      color_theme.value = "dark";
    } else {
      color_theme.value = stored || "light";
    }
  }
});
</script>
