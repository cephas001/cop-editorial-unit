// stores/settings.js
import { defineStore } from "pinia";
import { ref, onMounted } from "vue";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    color_theme: ref("light"),
  }),

  actions: {
    setLightTheme() {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color_theme", "light");
      this.color_theme = "light";
    },

    setDarkTheme() {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color_theme", "dark");
      this.color_theme = "dark";
    },

    toggleDarkMode() {
      if (this.color_theme === "light") {
        this.setDarkTheme();
      } else {
        this.setLightTheme();
      }
    },

    initTheme() {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("color_theme");

        if (!stored) {
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            this.setDarkTheme();
          } else {
            this.setLightTheme();
          }
        } else if (stored === "dark") {
          this.setDarkTheme();
        } else {
          this.setLightTheme();
        }
      }
    },
  },
});
