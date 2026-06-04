<template>
  <div
    class="min-h-[110vh] flex items-center justify-center p-4 antialiased font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 px-6 py-8 flex flex-col gap-8"
    >
      <div class="flex flex-col items-center gap-2 text-center">
        <div
          class="w-15 h-15 bg-indigo-100 rounded-lg flex items-center justify-center mb-2"
        >
          <img
            src="/assets/images/the_vineyard_logo.webp"
            alt="Logo"
            class="w-full rounded-lg object-cover"
          />
        </div>
        <h1
          class="text-xl font-semibold text-slate-900 dark:text-white tracking-tight"
        >
          Sign in to your account
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Editorial Unit Access
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            for="email"
          >
            Email Address
          </label>
          <input
            v-model="email"
            id="email"
            name="email"
            placeholder="peter@example.com"
            required
            type="email"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 transition-all text-sm"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label
              class="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              for="password"
            >
              Password
            </label>
            <a
              href="#"
              class="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <div class="relative w-full">
            <input
              v-model="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              :type="showPassword ? 'text' : 'password'"
              class="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 transition-all text-sm"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Icon
                :name="
                  showPassword
                    ? 'material-symbols:visibility-off'
                    : 'material-symbols:visibility'
                "
                class="text-slate-400 dark:text-slate-500 text-xl"
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-2.5 px-4 rounded-lg text-sm font-mono transition-all hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          <Icon
            v-if="authStore.isLoading"
            name="material-symbols:sync-rounded"
            class="text-xl animate-spin"
          />
          <span v-else>Sign in</span>
          <Icon
            v-if="!authStore.isLoading"
            name="material-symbols:arrow-forward-rounded"
            class="text-xl"
          />
        </button>
      </form>

      <div class="text-center mt-2">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Don't have an account? <br />
          <NuxtLink
            to="/auth/register"
            class="text-indigo-600 dark:text-indigo-400 font-mono hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors ml-1"
          >
            Create Profile
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import { navigateTo } from "#app";

definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const { success: toastSuccess, error: toastError } = useAppToast();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value);
    toastSuccess(
      "Welcome back to the Editorial workspace.",
      "Login Successful",
    );
    // Redirect to the articles directory
    await navigateTo("/articles");
  } catch (err) {
    console.error(err);
    toastError(
      err.data?.error || "Invalid email or password.",
      "Authentication Failed",
    );
  }
};
</script>
