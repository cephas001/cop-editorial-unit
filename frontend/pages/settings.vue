<template>
  <div class="max-w-6xl mx-auto font-sans pb-24 space-y-6">
    <div
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
      class="mb-8"
    >
      <h1
        class="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2"
      >
        Settings
      </h1>
      <p class="text-sm md:text-base text-slate-500 dark:text-slate-400">
        Manage your workspace and team preferences.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
      <aside
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0, transition: { delay: 100, duration: 400 } }"
        class="md:col-span-3 flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar"
      >
        <button
          @click="activeTab = 'preferences'"
          :class="[
            'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-auto md:w-full text-left font-medium text-xs md:text-sm whitespace-nowrap',
            activeTab === 'preferences'
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          ]"
        >
          <Icon
            name="material-symbols:settings-outline-rounded"
            class="text-lg"
          />
          <span>Preferences</span>
        </button>

        <button
          @click="activeTab = 'notifications'"
          :class="[
            'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-auto md:w-full text-left font-medium text-xs md:text-sm whitespace-nowrap',
            activeTab === 'notifications'
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          ]"
        >
          <Icon
            name="material-symbols:notifications-outline-rounded"
            class="text-lg"
          />
          <span>Notifications</span>
        </button>

        <button
          v-if="user?.role === 'ADMIN'"
          @click="activeTab = 'team'"
          :class="[
            'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-auto md:w-full text-left font-medium text-xs md:text-sm whitespace-nowrap',
            activeTab === 'team'
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          ]"
        >
          <Icon name="material-symbols:group-outline-rounded" class="text-lg" />
          <span>Team Management</span>
        </button>
      </aside>

      <div
        v-motion
        :initial="{ opacity: 0, x: 20 }"
        :enter="{ opacity: 1, x: 0, transition: { delay: 200, duration: 400 } }"
        class="md:col-span-9"
      >
        <div
          v-auto-animate
          class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 min-h-[400px] relative overflow-hidden"
        >
          <div v-if="activeTab === 'preferences'" class="space-y-8">
            <div>
              <h2
                class="text-sm md:text-md font-bold text-slate-900 dark:text-white mb-4"
              >
                Theme Appearance
              </h2>

              <div
                class="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700"
              >
                <div>
                  <h3
                    class="text-xs md:text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    Dark Mode
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Adjust the interface to match your system preferences.
                  </p>
                </div>
                <ToggleModeButton />
              </div>

              <div
                class="flex gap-3 justify-between py-4 border-b border-slate-100 dark:border-slate-700 flex-col"
              >
                <div>
                  <h3
                    class="text-xs md:text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    Theme Color
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Personalize your workspace accent color.
                  </p>
                </div>
                <div
                  class="flex gap-3 overflow-x-auto pb-3 pt-1 pl-1 hide-scrollbar w-full"
                >
                  <button
                    v-for="color in themeColors"
                    :key="color.name"
                    @click="setThemeColor(color)"
                    class="w-8 h-8 shrink-0 rounded-full border-2 transition-transform"
                    :class="[
                      color.previewClass,
                      activeColorName === color.name
                        ? 'border-slate-900 dark:border-white scale-110'
                        : 'border-transparent hover:scale-105',
                    ]"
                    :title="color.name"
                  ></button>
                </div>
              </div>
            </div>

            <div>
              <h2
                class="text-sm md:text-md font-bold text-slate-900 dark:text-white mb-4"
              >
                Personal Details
              </h2>
              <div
                class="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6"
              >
                <div
                  class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4"
                >
                  <div
                    class="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg"
                  >
                    <img
                      v-if="user?.avatarUrl"
                      :src="user.avatarUrl"
                      class="w-full h-full object-cover"
                    />
                    <span v-else>{{ user?.fullName?.charAt(0) || "U" }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">
                      {{ user?.fullName || "Loading..." }}
                    </p>
                    <p
                      class="text-xs font-mono text-slate-500 dark:text-slate-400"
                    >
                      {{ user?.email }}
                    </p>
                  </div>
                </div>
                <p
                  class="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed whitespace-pre-wrap"
                >
                  {{
                    user?.bio ||
                    "No bio added yet. Tell the team a bit about yourself!"
                  }}
                </p>
              </div>
              <div class="flex justify-end">
                <button
                  @click="navigateTo('/profile')"
                  class="bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs md:text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="activeTab === 'notifications'"
            class="relative h-full flex flex-col"
          >
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
              App Notifications
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Select when you want to be alerted within the application.
            </p>

            <div class="space-y-3 flex-1">
              <label
                class="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div class="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    v-model="notificationPrefs.tasks"
                    class="w-4 h-4 text-primary-600 bg-white border-slate-300 rounded focus:ring-primary-600 focus:ring-2 dark:bg-slate-900 dark:border-slate-600 transition-colors"
                  />
                </div>
                <div>
                  <p
                    class="text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    Task Assignments
                  </p>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Get notified when a Unit Head assigns you a new task.
                  </p>
                </div>
              </label>

              <label
                class="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div class="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    v-model="notificationPrefs.articles"
                    class="w-4 h-4 text-primary-600 bg-white border-slate-300 rounded focus:ring-primary-600 focus:ring-2 dark:bg-slate-900 dark:border-slate-600 transition-colors"
                  />
                </div>
                <div>
                  <p
                    class="text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    Article Status Changes
                  </p>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Alerts when an article moves from Draft to Review or
                    Published.
                  </p>
                </div>
              </label>

              <label
                class="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div class="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    v-model="notificationPrefs.comments"
                    class="w-4 h-4 text-primary-600 bg-white border-slate-300 rounded focus:ring-primary-600 focus:ring-2 dark:bg-slate-900 dark:border-slate-600 transition-colors"
                  />
                </div>
                <div>
                  <p
                    class="text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    Comments & Mentions
                  </p>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Notifications when someone tags you in a comment thread.
                  </p>
                </div>
              </label>
            </div>

            <div
              class="mt-8 flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700"
            >
              <button
                @click="savePreferences"
                class="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>

          <div
            v-if="activeTab === 'team' && user?.role === 'ADMIN'"
            class="flex flex-col h-full min-h-[350px]"
          >
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                  Team Members
                </h2>
                <p class="text-sm text-slate-500 mt-1">
                  Manage roles and permissions.
                </p>
              </div>
              <button
                class="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-primary-200 dark:border-primary-500/30 flex items-center gap-2"
              >
                <Icon name="material-symbols:add-rounded" class="text-lg" />
                Invite
              </button>
            </div>

            <div
              class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex-1 flex flex-col"
            >
              <div
                class="grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                <div class="col-span-8 md:col-span-6">Member</div>
                <div class="col-span-4 hidden md:block">Role</div>
                <div class="col-span-4 md:col-span-2 text-right">Actions</div>
              </div>

              <div
                v-if="isLoadingTeam"
                class="flex-1 flex justify-center items-center py-8"
              >
                <Icon
                  name="material-symbols:sync-rounded"
                  class="text-3xl text-primary-500 animate-spin"
                />
              </div>

              <div
                v-else
                v-auto-animate
                class="divide-y divide-slate-100 dark:divide-slate-700/50 overflow-y-auto custom-scrollbar flex-1"
              >
                <div
                  v-for="member in teamMembers"
                  :key="member.id"
                  class="grid grid-cols-12 gap-4 p-4 items-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div class="col-span-8 md:col-span-6 flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0"
                    >
                      <img
                        v-if="member.avatarUrl"
                        :src="member.avatarUrl"
                        class="w-full h-full object-cover"
                      />
                      <span v-else>{{ member.fullName.charAt(0) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p
                        class="text-sm font-semibold text-slate-900 dark:text-white truncate"
                      >
                        {{ member.fullName }}
                      </p>
                      <p class="text-xs font-mono text-slate-500 truncate">
                        {{ member.email }}
                      </p>
                    </div>
                  </div>

                  <div class="col-span-4 hidden md:flex items-center">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                        member.role === 'ADMIN'
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
                      ]"
                    >
                      {{ member.role === "ADMIN" ? "Unit Head" : "Writer" }}
                    </span>
                  </div>

                  <div class="col-span-4 md:col-span-2 flex justify-end gap-1">
                    <button
                      v-if="member.role !== 'ADMIN'"
                      @click="promoteUser(member.id)"
                      class="p-1.5 rounded-md text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                      title="Promote to Admin"
                    >
                      <Icon
                        name="material-symbols:keyboard-arrow-up-rounded"
                        class="text-xl"
                      />
                    </button>
                    <button
                      @click="removeUser(member.id)"
                      class="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      title="Remove from Unit"
                    >
                      <Icon
                        name="material-symbols:close-rounded"
                        class="text-xl"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useAppToast } from "~/composables/useAppToast";
import { useConfirm } from "~/composables/useConfirm";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
} = useAppToast();
const confirm = useConfirm();

// State
const activeTab = ref("preferences");
const teamMembers = ref([]);
const isLoadingTeam = ref(false);

const notificationPrefs = ref({
  tasks: true,
  articles: true,
  comments: true,
});

// --- NEW: THEME COLOR LOGIC ---
const activeColorName = ref("Indigo");

const themeColors = [
  {
    name: "Indigo",
    previewClass: "bg-indigo-500", // Fixed: Use static indigo so the button doesn't change color!
    values: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
      950: "#1e1b4b",
    },
  },
  {
    name: "Blue",
    previewClass: "bg-blue-500",
    values: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
  },
  {
    name: "Teal",
    previewClass: "bg-teal-500",
    values: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#2dd4bf",
      500: "#14b8a6",
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
      950: "#042f2e",
    },
  },
  {
    name: "Emerald",
    previewClass: "bg-emerald-500",
    values: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
      950: "#022c22",
    },
  },
  {
    name: "Amber",
    previewClass: "bg-amber-500",
    values: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      950: "#451a03",
    },
  },
  {
    name: "Rose",
    previewClass: "bg-rose-500",
    values: {
      50: "#fff1f2",
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#f43f5e",
      600: "#e11d48",
      700: "#be123c",
      800: "#9f1239",
      900: "#881337",
      950: "#4c0519",
    },
  },
  {
    name: "Violet",
    previewClass: "bg-violet-500",
    values: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
      950: "#2e1065",
    },
  },
  {
    name: "Slate",
    previewClass: "bg-slate-500",
    values: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
  },
];

const setThemeColor = (colorObj) => {
  activeColorName.value = colorObj.name;

  // Inject the new hex values into the CSS variables at the document root
  for (const [shade, hex] of Object.entries(colorObj.values)) {
    document.documentElement.style.setProperty(`--primary-${shade}`, hex);
  }

  // Save preference to localStorage so it persists across reloads
  localStorage.setItem("app-theme-color", JSON.stringify(colorObj));
};

// Apply saved theme on mount
const loadSavedTheme = () => {
  const saved = localStorage.getItem("app-theme-color");
  if (saved) {
    const colorObj = JSON.parse(saved);
    setThemeColor(colorObj);
  }
};
// ------------------------------

const savePreferences = () => {
  toastSuccess("Preferences saved successfully.");
};

const loadTeamMembers = async () => {
  if (user.value?.role !== "ADMIN") return;

  isLoadingTeam.value = true;
  try {
    const data = await useApiFetch("/users");
    teamMembers.value = data.filter((u) => u.id !== user.value.id);
  } catch (error) {
    toastError("Failed to load team data.");
  } finally {
    isLoadingTeam.value = false;
  }
};

const promoteUser = async (userId) => {
  const isConfirmed = await confirm.ask({
    title: "Promote User?",
    message:
      "Promote this user to an Admin (Unit Head)? They will gain full access to assign tasks and manage editorial content.",
    confirmText: "Promote",
    cancelText: "Cancel",
  });

  if (!isConfirmed) return;

  try {
    await useApiFetch(`/users/${userId}/promote`, { method: "PATCH" });
    toastSuccess("User promoted successfully.");
    await loadTeamMembers();
  } catch (error) {
    toastError("Failed to promote user.");
  }
};

const removeUser = async (userId) => {
  toastInfo("User removal is restricted in this sprint.");
};

onMounted(() => {
  loadSavedTheme(); // Load theme color preference
  loadTeamMembers();
});
</script>

<style scoped>
@reference "~/assets/css/main.css";

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-slate-600 rounded-full;
}
</style>
