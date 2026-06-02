<template>
  <div class="max-w-6xl mx-auto font-sans pb-24 space-y-6">
    <div class="mb-8">
      <h1
        class="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2"
      >
        Settings
      </h1>
      <p class="text-sm md:text-base text-slate-500 dark:text-slate-400">
        Manage your workspace and team preferences.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
      <!-- Settings Sidebar -->
      <aside
        class="md:col-span-3 flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar"
      >
        <button
          @click="activeTab = 'preferences'"
          :class="[
            'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-auto md:w-full text-left font-medium text-sm whitespace-nowrap',
            activeTab === 'preferences'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          ]"
        >
          <Icon
            name="material-symbols:settings-outline-rounded"
            class="text-xl"
          />
          <span>Preferences</span>
        </button>

        <button
          @click="activeTab = 'notifications'"
          :class="[
            'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-auto md:w-full text-left font-medium text-sm whitespace-nowrap',
            activeTab === 'notifications'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          ]"
        >
          <Icon
            name="material-symbols:notifications-outline-rounded"
            class="text-xl"
          />
          <span>Notifications</span>
        </button>

        <button
          v-if="user?.role === 'ADMIN'"
          @click="activeTab = 'team'"
          :class="[
            'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-auto md:w-full text-left font-medium text-sm whitespace-nowrap',
            activeTab === 'team'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          ]"
        >
          <Icon name="material-symbols:group-outline-rounded" class="text-xl" />
          <span>Team Management</span>
        </button>
      </aside>

      <div class="md:col-span-9">
        <div
          class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 min-h-[400px] relative overflow-hidden"
        >
          <div
            v-if="activeTab === 'preferences'"
            class="animate-fade-in space-y-8"
          >
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Theme Appearance
              </h2>
              <div
                class="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700"
              >
                <div>
                  <h3
                    class="text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    Dark Mode
                  </h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Adjust the interface to match your system preferences.
                  </p>
                </div>
                <ToggleModeButton />
              </div>
            </div>

            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Personal Details
              </h2>
              <div
                class="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6"
              >
                <div
                  class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4"
                >
                  <div
                    class="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg"
                  >
                    <img
                      v-if="user?.avatarUrl"
                      :src="user.avatarUrl"
                      class="w-full h-full object-cover"
                    />
                    <span v-else>{{ user?.fullName?.charAt(0) || "U" }}</span>
                  </div>
                  <div>
                    <p
                      class="text-base font-bold text-slate-900 dark:text-white"
                    >
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
                  class="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed whitespace-pre-wrap"
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
                  class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="activeTab === 'notifications'"
            class="animate-fade-in relative h-full flex flex-col"
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
                    class="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-600 focus:ring-2 dark:bg-slate-900 dark:border-slate-600 transition-colors"
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
                    class="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-600 focus:ring-2 dark:bg-slate-900 dark:border-slate-600 transition-colors"
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
                    class="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-600 focus:ring-2 dark:bg-slate-900 dark:border-slate-600 transition-colors"
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
                class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>

          <div
            v-if="activeTab === 'team' && user?.role === 'ADMIN'"
            class="animate-fade-in flex flex-col h-full min-h-[350px]"
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
                class="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-2"
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
                  class="text-3xl text-indigo-500 animate-spin"
                />
              </div>

              <div
                v-else
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
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
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
                      class="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
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

const savePreferences = () => {
  toastSuccess("Preferences saved successfully.");
};

const loadTeamMembers = async () => {
  if (user.value?.role !== "ADMIN") return;

  isLoadingTeam.value = true;
  try {
    const data = await useApiFetch("/users");
    // Show everyone except the logged-in user for management purposes
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
  loadTeamMembers();
});
</script>

<style scoped>
@reference "tailwindcss";
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
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
