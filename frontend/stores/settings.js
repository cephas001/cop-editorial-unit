// stores/settings.js
import { defineStore } from "pinia";
import { useIndexedDB } from "~/composables/useIndexedDB";

const applyThemeClass = (theme) => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    color_theme: "light",
  }),

  actions: {
    async setLightTheme() {
      this.color_theme = "light";

      if (process.client) {
        applyThemeClass("light");
        const { setItem } = useIndexedDB();
        await setItem("color_theme", "light");
        localStorage.setItem("color_theme", "light");
      }
    },

    async setDarkTheme() {
      this.color_theme = "dark";

      if (process.client) {
        applyThemeClass("dark");
        const { setItem } = useIndexedDB();
        await setItem("color_theme", "dark");
        localStorage.setItem("color_theme", "dark");
      }
    },

    async toggleDarkMode() {
      if (this.color_theme === "light") {
        await this.setDarkTheme();
      } else {
        await this.setLightTheme();
      }
    },

    async initTheme() {
      if (process.client) {
        const { getItem } = useIndexedDB();
        const storedTheme =
          (await getItem("color_theme")) || localStorage.getItem("color_theme");

        if (!storedTheme) {
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            await this.setDarkTheme();
          } else {
            await this.setLightTheme();
          }
        } else if (storedTheme === "dark") {
          this.color_theme = "dark";
          applyThemeClass("dark");
        } else {
          this.color_theme = "light";
          applyThemeClass("light");
        }

        localStorage.setItem("color_theme", this.color_theme);
      }
    },
  },
});
