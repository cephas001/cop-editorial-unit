<template>
  <div
    class="antialiased min-h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200"
  >
    <header
      :class="[
        'fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full md:w-[calc(100%-16rem)] transition-all duration-300',
        isScrolled
          ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl backdrop-saturate-150 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm'
          : 'bg-transparent border-b border-transparent',
      ]"
    >
      <div class="flex items-center gap-4 w-full max-w-md">
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden text-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center"
        >
          <Icon name="material-symbols:menu-rounded" class="text-xl" />
        </button>
        <!-- 
        <div class="relative w-full hidden md:block">
          <Icon
            name="material-symbols:search-rounded"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl"
          />
          <input
            class="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 transition-all duration-200"
            placeholder="Search articles, tasks, or users..."
            type="text"
          />
        </div> -->
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <ToggleModeButton />
        <NotificationButton />

        <NuxtLink
          class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-semibold overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
          to="/profile"
        >
          <img
            :src="user?.avatarUrl"
            alt="Profile Picture"
            class="w-full rounded-full"
            v-if="user?.avatarUrl"
          />

          <span class="flex items-center justify-center" v-else>
            <Icon
              name="material-symbols:person-outline-rounded"
              class="text-xl"
            />
          </span>
        </NuxtLink>
      </div>
    </header>

    <aside
      :class="[
        'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen w-64 fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 md:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
      ]"
    >
      <div
        class="p-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between md:justify-start gap-3"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 flex items-center justify-center">
            <img
              src="assets/images/the_vineyard_logo.webp"
              alt="Logo"
              class="w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <h1
              class="font-mono font-bold text-black dark:text-white leading-tight"
            >
              Editorial Unit
            </h1>
          </div>
        </div>
        <button
          @click="isMobileMenuOpen = false"
          class="md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md p-1 flex items-center justify-center"
        >
          <Icon name="material-symbols:close-rounded" class="text-2xl" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto flex flex-col h-full p-4 gap-1 mt-2">
        <SidebarLink
          to="/"
          icon="material-symbols:dashboard-outline-rounded"
          label="Dashboard"
          @click="isMobileMenuOpen = false"
        />

        <SidebarLink
          to="/articles"
          icon="material-symbols:description-outline-rounded"
          label="Articles & Drafts"
          @click="isMobileMenuOpen = false"
        />

        <SidebarLink
          to="/brainstorming"
          icon="material-symbols:psychology-outline-rounded"
          label="Brainstorming"
          @click="isMobileMenuOpen = false"
        />

        <SidebarLink
          to="/calendar"
          icon="material-symbols:calendar-today-outline-rounded"
          label="Calendar & Tasks"
          @click="isMobileMenuOpen = false"
        />

        <SidebarLink
          to="/profile"
          icon="material-symbols:person-outline-rounded"
          label="User Profile"
          @click="isMobileMenuOpen = false"
        />

        <SidebarLink
          to="/team"
          icon="material-symbols:group-outline-rounded"
          label="The Best Team"
          @click="isMobileMenuOpen = false"
        />

        <div
          class="mt-auto pt-4 mb-2 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-1"
        >
          <SidebarLink
            to="/settings"
            icon="material-symbols:settings-outline-rounded"
            label="Settings"
            @click="isMobileMenuOpen = false"
          />
        </div>
      </nav>

      <div
        class="p-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-1"
      >
        <SidebarLink
          to="/help"
          icon="material-symbols:help-outline-rounded"
          label="Help Center"
          @click="isMobileMenuOpen = false"
        />

        <a
          v-if="user?.email"
          href="#"
          class="flex items-center gap-3 px-3 py-2 text-black dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-sm font-mono transition-colors duration-200 hover:text-rose-600 dark:hover:text-rose-400"
          @click.prevent="logout"
        >
          <Icon name="material-symbols:logout-rounded" class="text-xl" />
          <span>Logout</span>
        </a>

        <a
          v-else
          href="#"
          class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg text-sm font-mono transition-colors duration-200 hover:text-green-600 dark:hover:text-green-400"
          @click.prevent="login"
        >
          <Icon name="material-symbols:login-rounded" class="text-xl" />
          <span>Login</span>
        </a>
      </div>
    </aside>

    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>

    <main
      class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 md:ml-64 min-h-screen max-w-7xl mx-auto"
    >
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";

const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const { success: toastSuccess, error: toastError } = useAppToast();

const handleScroll = () => {
  // Toggle the glass effect after scrolling down 10 pixels
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

const login = async () => {
  try {
    isMobileMenuOpen.value = false;
    await navigateTo("/auth/login");
  } catch (err) {
    toastError("Failed to redirect to login");
    console.error("Login error:", err);
  }
};

const logout = async () => {
  try {
    await authStore.logout();
    toastSuccess("Logged out successfully");
    isMobileMenuOpen.value = false;
    await navigateTo("/auth/login");
  } catch (err) {
    toastError("Failed to log out");
    console.error("Logout error:", err);
  }
};
</script>
