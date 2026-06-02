<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 antialiased font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200"
  >
    <main
      class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative flex flex-col"
    >
      <div
        class="h-1 w-full bg-gradient-to-r from-indigo-600 to-purple-500"
      ></div>

      <div class="px-6 py-8 flex flex-col gap-8">
        <div class="text-center flex flex-col items-center">
          <div
            class="inline-flex items-center justify-center w-15 h-15 rounded-xl mb-3"
          >
            <img
              src="/assets/images/the_vineyard_logo.webp"
              alt="Logo"
              class="w-full rounded-lg object-cover"
            />
          </div>
          <h1
            class="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-3"
          >
            Create your profile
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Join the Editorial Unit to manage your content.
          </p>
        </div>

        <form @submit.prevent="handleRegister" class="flex flex-col gap-5">
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              for="fullName"
            >
              First Name
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Icon
                  name="material-symbols:person-outline-rounded"
                  class="text-slate-400 dark:text-slate-500 text-xl"
                />
              </div>
              <input
                v-model="firstName"
                id="firstName"
                name="firstName"
                placeholder="Tunmise"
                required
                type="text"
                class="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              for="fullName"
            >
              Last Name
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Icon
                  name="material-symbols:person-outline-rounded"
                  class="text-slate-400 dark:text-slate-500 text-xl"
                />
              </div>
              <input
                v-model="lastName"
                id="lastName"
                name="lastName"
                placeholder="Nwobodo"
                required
                type="text"
                class="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              for="email"
            >
              Email Address
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Icon
                  name="material-symbols:mail-outline-rounded"
                  class="text-slate-400 dark:text-slate-500 text-xl"
                />
              </div>
              <input
                v-model="email"
                id="email"
                name="email"
                placeholder="shalomzimama@gmail.com"
                required
                type="email"
                class="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              for="password"
            >
              Password
            </label>
            <div class="relative">
              <!-- Left lock icon -->
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <Icon
                  name="material-symbols:lock-outline"
                  class="text-slate-400 dark:text-slate-500 text-xl"
                />
              </div>

              <!-- Input field -->
              <input
                v-model="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                :type="showPassword ? 'text' : 'password'"
                class="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors text-sm placeholder:text-slate-400 focus:outline-none"
              />

              <!-- Toggle button with eye icon -->
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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

            <p
              class="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono"
            >
              Must be at least 8 characters long.
            </p>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="!isFormValid || authStore.isLoading"
              class="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-sm font-mono text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 dark:focus:ring-offset-slate-900 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              <Icon
                v-if="authStore.isLoading"
                name="material-symbols:sync-rounded"
                class="text-xl animate-spin"
              />
              <span>{{
                authStore.isLoading ? "Creating..." : "Create account"
              }}</span>
            </button>
          </div>
        </form>

        <div class="text-center mt-2">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?
            <NuxtLink
              to="/login"
              class="font-mono text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors ml-1"
            >
              Log In
            </NuxtLink>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import { navigateTo } from "#app";

definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const { success: toastSuccess, error: toastError } = useAppToast();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);

// Computed validation
const isFormValid = computed(() => {
  return (
    firstName.value.trim().length > 0 &&
    lastName.value.trim().length > 0 &&
    email.value.trim().length > 0 &&
    password.value.length >= 8
  );
});

const handleRegister = async () => {
  try {
    await authStore.register(
      `${firstName.value} ${lastName.value}`,
      email.value,
      password.value,
    );
    toastSuccess(
      "Your profile has been created. Please log in.",
      "Registration Successful",
    );
    await navigateTo("/auth/login");
  } catch (err) {
    console.error(err);
    toastError(
      err.data?.error || "Could not create account.",
      "Registration Failed",
    );
  }
};
</script>
