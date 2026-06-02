import { defineStore } from "pinia";
import { useCookie, navigateTo } from "#app";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // Initialize state directly from the cookie so it persists across page reloads
    user: useCookie("auth_user").value || null,
    isLoading: false,
  }),

  actions: {
    async login(email, password) {
      this.isLoading = true;
      try {
        const response = await useApiFetch("/auth/login", {
          method: "POST",
          body: { email, password },
        });

        // Store token and user data in secure cookies (expires in 7 days)
        const tokenCookie = useCookie("auth_token", {
          maxAge: 60 * 60 * 24 * 7,
        });
        const userCookie = useCookie("auth_user", { maxAge: 60 * 60 * 24 * 7 });

        tokenCookie.value = response.access_token;
        userCookie.value = response.user;

        // Update Pinia state
        this.user = response.user;

        return true;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async register(fullName, email, password) {
      this.isLoading = true;
      try {
        await useApiFetch("/auth/register", {
          method: "POST",
          body: { fullName, email, password },
        });

        return true;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      // Wipe the cookies
      const tokenCookie = useCookie("auth_token");
      const userCookie = useCookie("auth_user");

      tokenCookie.value = null;
      userCookie.value = null;

      // Wipe the state
      this.user = null;

      // Kick them back to the login page
      await navigateTo("/auth/login", { replace: true });
    },
  },
});
