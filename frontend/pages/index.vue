<template>
  <div class="max-w-7xl mx-auto space-y-8 font-sans">
    <!-- Header: Slides down gently on load -->
    <div
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h2
          class="text-xl md:text-2xl font-semibold text-black dark:text-white tracking-tight font-sans"
        >
          Welcome back, {{ firstName }}
        </h2>
        <p
          class="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 font-mono"
        >
          {{ currentDate }}
        </p>
      </div>
      <div class="flex gap-3">
        <NuxtLink
          class="px-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-mono transition-colors shadow-sm flex items-center gap-2"
          to="/editor/new"
        >
          <Icon name="material-symbols:add-rounded" class="text-lg" />
          New Draft
        </NuxtLink>
      </div>
    </div>

    <!-- Stat Cards: Staggered slide up -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 400 } }"
        class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group cursor-pointer"
        @click="navigateTo('/articles')"
      >
        <div
          class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
        >
          <Icon
            name="material-symbols:edit-document-outline-rounded"
            class="text-4xl text-indigo-600 dark:text-indigo-400"
          />
        </div>
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
          >
            <Icon
              name="material-symbols:edit-document-outline-rounded"
              class="text-xl"
            />
          </div>
          <h3 class="text-sm font-mono text-slate-500 dark:text-slate-400">
            Active Drafts
          </h3>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-black dark:text-white">{{
            activeDraftsCount
          }}</span>
        </div>
        <div
          class="mt-2 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-mono"
        >
          <Icon name="material-symbols:trending-up-rounded" class="text-base" />
          <span>In Review</span>
        </div>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 400 } }"
        class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group cursor-pointer"
        @click="handleTaskClick"
      >
        <div
          class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
        >
          <Icon
            name="material-symbols:assignment-late-outline-rounded"
            class="text-4xl text-rose-600 dark:text-rose-400"
          />
        </div>
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400"
          >
            <Icon
              name="material-symbols:assignment-outline-rounded"
              class="text-xl"
            />
          </div>
          <h3 class="text-sm font-mono text-slate-500 dark:text-slate-400">
            Pending Tasks
          </h3>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-black dark:text-white">{{
            pendingTasksCount
          }}</span>
        </div>
        <div
          class="mt-2 flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-mono"
        >
          <Icon
            name="material-symbols:priority-high-rounded"
            class="text-base"
          />
          <span>Priority high</span>
        </div>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 400 } }"
        class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group cursor-pointer"
        @click="navigateTo('/brainstorming')"
      >
        <div
          class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
        >
          <Icon
            name="material-symbols:psychology-outline-rounded"
            class="text-4xl text-amber-600 dark:text-amber-400"
          />
        </div>
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400"
          >
            <Icon
              name="material-symbols:psychology-outline-rounded"
              class="text-xl"
            />
          </div>
          <h3 class="text-sm font-mono text-slate-500 dark:text-slate-400">
            Brainstorm Sessions
          </h3>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-black dark:text-white">{{
            brainstormSessionsCount
          }}</span>
        </div>
        <div
          class="mt-2 flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-mono"
        >
          <Icon name="material-symbols:event-rounded" class="text-base" />
          <span>Active</span>
        </div>
      </div>
    </div>

    <!-- Main Panels -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Activities Panel -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 400 } }"
        class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col max-h-[500px]"
      >
        <div
          class="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0"
        >
          <h3 class="text-sm font-semibold text-black dark:text-white">
            Recent Activities
          </h3>
        </div>

        <div class="flex-1 overflow-y-auto hide-scrollbar">
          <!-- AutoAnimate applied to the list for smooth entry of new items -->
          <ul
            v-auto-animate
            class="divide-y divide-slate-100 dark:divide-slate-700/50"
          >
            <li
              v-if="activities.length === 0"
              class="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-mono"
            >
              No recent activities found.
            </li>

            <li
              v-for="activity in activities"
              :key="activity.id"
              class="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex gap-4"
            >
              <div class="mt-1 shrink-0">
                <div
                  class="w-2 h-2 rounded-full ring-4"
                  :class="getActivityColor(activity.type)"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1 gap-2">
                  <p
                    class="text-sm font-mono text-black dark:text-white truncate"
                  >
                    {{
                      activity.article?.title
                        ? activity.article.title
                        : "System Activity"
                    }}
                  </p>
                  <span
                    class="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0"
                  >
                    {{ formatRelativeTime(activity.createdAt) }}
                  </span>
                </div>
                <p
                  class="text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-snug"
                >
                  <span
                    class="font-semibold text-slate-800 dark:text-slate-200"
                    >{{ activity.user?.fullName?.split(" ")[0] }}</span
                  >
                  {{ activity.message }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tasks Panel -->
      <div
        ref="taskListing"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 400 } }"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col"
      >
        <div
          class="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50"
        >
          <h3 class="text-sm font-semibold text-black dark:text-white">
            Team Tasks
          </h3>
          <span
            class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono px-2.5 py-0.5 rounded-full"
          >
            {{ pendingTasksCount }} left
          </span>
        </div>

        <div class="p-4 flex-1 overflow-y-auto max-h-[300px] hide-scrollbar">
          <div
            v-if="tasks.length === 0"
            class="text-center py-6 text-sm text-slate-500 dark:text-slate-400"
          >
            No pending tasks.
          </div>
          <!-- AutoAnimate added here to smooth task completion removal -->
          <ul v-else v-auto-animate class="space-y-2">
            <li v-for="task in tasks" :key="task.id">
              <label
                class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50"
              >
                <div
                  class="relative flex items-center justify-center mt-0.5 shrink-0"
                >
                  <input
                    type="checkbox"
                    :checked="task.status === 'COMPLETED'"
                    @change="toggleTaskStatus(task)"
                    class="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 checked:bg-indigo-600 checked:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all cursor-pointer"
                  />
                  <Icon
                    name="material-symbols:check-rounded"
                    class="text-white text-base absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                  />
                </div>
                <div class="flex flex-col flex-1">
                  <span
                    :class="[
                      'text-sm font-medium transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                      task.status === 'COMPLETED'
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-black dark:text-slate-100',
                    ]"
                  >
                    {{ task.title }}
                  </span>

                  <span
                    v-if="task.description"
                    :class="[
                      'text-xs mt-1 line-clamp-2',
                      task.status === 'COMPLETED'
                        ? 'text-slate-400/70 dark:text-slate-500/70 line-through'
                        : 'text-slate-500 dark:text-slate-400',
                    ]"
                  >
                    {{ task.description }}
                  </span>

                  <div class="flex items-center gap-2 mt-2">
                    <span
                      v-if="task.priority"
                      :class="[
                        'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm',
                        task.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                          : task.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                            : task.priority === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                              : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
                      ]"
                    >
                      {{ task.priority }}
                    </span>
                    <span
                      v-if="task.dueDate"
                      :class="[
                        'text-[10px] font-mono flex items-center gap-1',
                        task.status === 'COMPLETED'
                          ? 'text-slate-400 dark:text-slate-500'
                          : 'text-slate-500 dark:text-slate-400',
                      ]"
                    >
                      <Icon
                        name="material-symbols:calendar-today-rounded"
                        class="text-xs"
                      />
                      {{
                        new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }}
                    </span>
                  </div>
                </div>
              </label>
            </li>
          </ul>
        </div>

        <!-- AutoAnimate on this wrapper creates a smooth toggle for the form -->
        <div
          v-auto-animate
          class="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50"
          v-if="user?.role === 'ADMIN'"
        >
          <div v-if="!isCreatingTask" class="flex justify-center">
            <button
              @click="isCreatingTask = true"
              class="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
            >
              <Icon name="material-symbols:add-rounded" class="text-md" />
              New Task
            </button>
          </div>

          <form v-else @submit.prevent="submitTask" class="space-y-3">
            <input
              v-model="newTask.title"
              type="text"
              placeholder="Task Title..."
              required
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm text-black dark:text-white placeholder:text-slate-400 transition-colors"
            />

            <textarea
              v-model="newTask.description"
              placeholder="Add detailed instructions... (optional)"
              rows="2"
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm text-black dark:text-white placeholder:text-slate-400 transition-colors resize-none"
            ></textarea>

            <div class="flex gap-2">
              <select
                v-model="newTask.priority"
                class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm text-black dark:text-white transition-colors"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>

              <input
                type="date"
                v-model="newTask.dueDate"
                class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm text-black dark:text-white transition-colors"
              />
            </div>

            <select
              v-if="user?.role === 'ADMIN'"
              v-model="newTask.assigneeId"
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm text-black dark:text-white transition-colors"
            >
              <option :value="user.id">Assign to myself</option>
              <option
                v-for="member in teamMembers"
                :key="member.id"
                :value="member.id"
              >
                Assign to: {{ member.fullName }}
              </option>
            </select>

            <div class="flex justify-end gap-2 pt-1">
              <button
                type="button"
                @click="cancelCreateTask"
                class="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!newTask.title.trim() || isSubmittingTask"
                class="px-4 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-md disabled:opacity-50 flex items-center gap-1 transition-colors shadow-sm"
              >
                <Icon
                  v-if="isSubmittingTask"
                  name="material-symbols:sync-rounded"
                  class="text-sm animate-spin"
                />
                Save Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useAppToast } from "~/composables/useAppToast";
// Import AutoAnimate to ensure directives are registered cleanly
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const taskListing = ref(null);

const handleTaskClick = () => {
  taskListing.value?.scrollIntoView({ behavior: "smooth" });
};

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const { error: toastError } = useAppToast();

const currentDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(new Date());

const firstName = computed(() => {
  return user.value?.fullName?.split(" ")[0] || "Writer";
});

// --- STATE ---
const articles = ref([]);
const activeDraftsCount = computed(
  () =>
    articles.value.filter(
      (a) => a.status === "DRAFT" || a.status === "IN_REVIEW",
    ).length,
);

const tasks = ref([]);
const teamMembers = ref([]);
const isCreatingTask = ref(false);
const isSubmittingTask = ref(false);

const newTask = ref({
  title: "",
  description: "",
  assigneeId: user.value?.id,
  priority: "MEDIUM",
  dueDate: "",
});

const pendingTasksCount = computed(
  () => tasks.value.filter((t) => t.status === "PENDING").length,
);
const brainstormSessionsCount = ref(0);

// NEW: Global Activities State
const activities = ref([]);

// --- FETCHERS ---
const loadTasks = async () => {
  try {
    tasks.value = await useApiFetch("/tasks");
  } catch (error) {
    console.error("Failed to load tasks", error);
  }
};

const loadTeamMembers = async () => {
  if (user.value?.role === "ADMIN") {
    try {
      const allUsers = await useApiFetch("/users");
      teamMembers.value = allUsers.filter((u) => u.id !== user.value.id);
    } catch (error) {
      console.error("Failed to load team members", error);
    }
  }
};

const loadBoard = async () => {
  try {
    const sessions = await useApiFetch("/brainstorm/sessions");
    if (sessions) {
      brainstormSessionsCount.value = sessions.length;
    }
  } catch (error) {
    console.error("Failed to load brainstorming boards", error);
  }
};

// Fetch Global Activities
const loadActivities = async () => {
  try {
    activities.value = await useApiFetch("/activities");
  } catch (error) {
    console.error("Failed to load activities", error);
  }
};

// --- HANDLERS ---
const cancelCreateTask = () => {
  isCreatingTask.value = false;
  newTask.value = {
    title: "",
    description: "",
    assigneeId: user.value?.id,
    priority: "MEDIUM",
    dueDate: "",
  };
};

const submitTask = async () => {
  if (!newTask.value.title.trim() || isSubmittingTask.value) return;
  isSubmittingTask.value = true;

  try {
    const addedTask = await useApiFetch("/tasks", {
      method: "POST",
      body: {
        title: newTask.value.title,
        description: newTask.value.description || null,
        assigneeId: newTask.value.assigneeId,
        priority: newTask.value.priority,
        dueDate: newTask.value.dueDate
          ? new Date(newTask.value.dueDate).toISOString()
          : null,
      },
    });

    if (addedTask.assigneeId === user.value.id) {
      tasks.value.unshift(addedTask);
    }

    cancelCreateTask();
  } catch (err) {
    toastError("Failed to save task.");
  } finally {
    isSubmittingTask.value = false;
  }
};

const toggleTaskStatus = async (task) => {
  const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
  const oldStatus = task.status;
  task.status = newStatus;

  try {
    await useApiFetch(`/tasks/${task.id}/status`, {
      method: "PATCH",
      body: { status: newStatus },
    });
  } catch (err) {
    task.status = oldStatus;
    toastError("Failed to update task status.");
  }
};

// --- UI HELPERS ---
const getActivityColor = (type) => {
  switch (type) {
    case "CREATE":
      return "bg-sky-500 ring-sky-50 dark:ring-sky-500/20";
    case "EDIT":
      return "bg-indigo-500 ring-indigo-50 dark:ring-indigo-500/20";
    case "STATUS":
      return "bg-emerald-500 ring-emerald-50 dark:ring-emerald-500/20";
    case "COMMENT":
      return "bg-amber-500 ring-amber-50 dark:ring-amber-500/20";
    default:
      return "bg-slate-400 ring-slate-100 dark:ring-slate-400/20";
  }
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

onMounted(async () => {
  try {
    const articlesData = await useApiFetch("/articles");
    articles.value = articlesData;
  } catch (error) {
    console.error("Failed to fetch articles", error);
  }

  await Promise.all([
    loadBoard(),
    loadTasks(),
    loadTeamMembers(),
    loadActivities(), // NEW: Load the global activities on mount
  ]);
});
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
