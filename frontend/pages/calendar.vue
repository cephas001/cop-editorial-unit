<template>
  <div
    class="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] gap-6 font-sans relative"
  >
    <section
      class="flex-1 flex flex-col min-h-[500px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0"
    >
      <div
        class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50 shrink-0"
      >
        <div>
          <h2
            class="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {{ monthName }} {{ currentYear }}
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Team Editorial Schedule
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="prevMonth"
            class="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
          >
            <Icon
              name="material-symbols:chevron-left-rounded"
              class="text-xl"
            />
          </button>
          <button
            @click="goToToday"
            title="Jump back to the current real-world date"
            class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-mono text-slate-700 dark:text-slate-200 transition-colors"
          >
            Today
          </button>
          <button
            @click="nextMonth"
            class="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
          >
            <Icon
              name="material-symbols:chevron-right-rounded"
              class="text-xl"
            />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-x-auto custom-scrollbar flex flex-col h-full">
        <div class="min-w-[600px] flex flex-col h-full flex-1">
          <div
            class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 shrink-0"
          >
            <div
              v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
              :key="day"
              class="py-3 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              {{ day }}
            </div>
          </div>

          <div
            class="flex-1 bg-slate-200 dark:bg-slate-700 grid grid-cols-7 auto-rows-fr gap-[1px]"
          >
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              @click="openDayModal(day)"
              :class="[
                'pt-2 pr-2 min-h-[80px] flex flex-col gap-1 transition-colors group relative',
                day.isCurrentMonth
                  ? 'bg-white dark:bg-slate-800 cursor-pointer'
                  : 'bg-slate-50/50 dark:bg-slate-800/50 opacity-50',
                day.isCurrentMonth && day.tasks.length > 0
                  ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  : '',
                day.isToday
                  ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 ring-inset'
                  : '',
              ]"
            >
              <div
                :class="[
                  'self-end flex items-center justify-center text-sm font-mono',
                  day.isToday
                    ? 'w-6 h-6 rounded-full bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                ]"
              >
                {{ day.date }}
              </div>

              <div
                class="flex flex-col gap-1 mt-1 overflow-y-auto hide-scrollbar flex-1"
              >
                <div
                  v-for="task in day.tasks"
                  :key="task.id"
                  :class="[
                    'text-[10px] px-1.5 py-1 rounded truncate font-semibold border transition-all',
                    task.status === 'COMPLETED'
                      ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700 line-through opacity-70'
                      : getUserColor(task.assigneeId),
                  ]"
                  :title="`${task.title} - Assigned to ${task.assignee?.fullName}`"
                >
                  {{ task.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="w-full lg:w-80 xl:w-96 flex flex-col min-h-[400px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0"
    >
      <div
        class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0"
      >
        <h3
          class="text-sm md:text-base font-semibold text-slate-900 dark:text-white tracking-tight"
        >
          My Tasks
        </h3>
        <button
          v-if="user?.role === 'ADMIN'"
          @click="isCreatingTask = true"
          class="text-sm font-mono text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <Icon name="material-symbols:add-rounded" class="text-lg" />
          Assign
        </button>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-8">
        <div>
          <h4
            class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4"
          >
            My Upcoming Deadlines
          </h4>
          <div
            v-if="myUpcomingTasks.length === 0"
            class="text-xs md:text-sm text-slate-500 font-mono"
          >
            No immediate deadlines.
          </div>
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="task in myUpcomingTasks"
              :key="'up-' + task.id"
              class="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-500/30 rounded-xl shadow-sm group hover:border-rose-300 dark:hover:border-rose-500/60 transition-colors cursor-pointer relative overflow-hidden"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>

              <div
                class="relative flex items-center justify-center mt-0.5 shrink-0"
              >
                <input
                  type="checkbox"
                  :checked="task.status === 'COMPLETED'"
                  @change="toggleTaskStatus(task)"
                  class="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 checked:bg-indigo-600 checked:border-indigo-600 focus:ring-2 focus:ring-indigo-600 cursor-pointer transition-all"
                />
                <Icon
                  name="material-symbols:check-rounded"
                  class="text-white text-base absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                />
              </div>

              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate mb-1"
                  :class="{
                    'line-through text-slate-400': task.status === 'COMPLETED',
                  }"
                >
                  {{ task.title }}
                </p>
                <div class="flex items-center gap-1.5">
                  <Icon
                    name="material-symbols:event-rounded"
                    class="text-sm text-rose-600 dark:text-rose-400"
                  />
                  <span
                    class="text-xs font-semibold text-rose-600 dark:text-rose-400"
                  >
                    {{
                      isToday(task.dueDate)
                        ? "Due Today"
                        : `Due ${new Date(task.dueDate).toLocaleDateString()}`
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4
            class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4"
          >
            All Assigned Tasks
          </h4>
          <div
            v-if="myTasks.length === 0"
            class="text-xs md:text-sm text-slate-500 font-mono"
          >
            No tasks assigned yet.
          </div>
          <div class="flex flex-col gap-3">
            <div
              v-for="task in myTasks"
              :key="'all-' + task.id"
              :class="[
                'flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer',
                task.status === 'COMPLETED'
                  ? 'bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50 opacity-75'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-indigo-300 dark:hover:border-indigo-600',
              ]"
            >
              <div
                class="relative flex items-center justify-center mt-0.5 shrink-0"
              >
                <input
                  type="checkbox"
                  :checked="task.status === 'COMPLETED'"
                  @change="toggleTaskStatus(task)"
                  class="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 checked:bg-indigo-600 checked:border-indigo-600 focus:ring-2 focus:ring-indigo-600 cursor-pointer transition-all"
                />
                <Icon
                  name="material-symbols:check-rounded"
                  class="text-white text-base absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                />
              </div>

              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-semibold leading-tight truncate mb-1 transition-colors"
                  :class="
                    task.status === 'COMPLETED'
                      ? 'text-slate-500 dark:text-slate-400 line-through'
                      : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  "
                >
                  {{ task.title }}
                </p>
                <div
                  class="flex items-center gap-1.5"
                  :class="
                    task.status === 'COMPLETED'
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-slate-500 dark:text-slate-400'
                  "
                >
                  <Icon
                    :name="
                      task.status === 'COMPLETED'
                        ? 'material-symbols:check-circle-outline-rounded'
                        : 'material-symbols:event-rounded'
                    "
                    class="text-sm"
                  />
                  <span class="text-xs font-mono">
                    {{
                      task.status === "COMPLETED"
                        ? "Completed"
                        : task.dueDate
                          ? `Due ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                          : "No Due Date"
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="isDayModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="isDayModalOpen = false"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-zoom-in flex flex-col max-h-[80vh]"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0"
        >
          <h3
            class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <Icon
              name="material-symbols:calendar-today-rounded"
              class="text-indigo-600 dark:text-indigo-400"
            />
            {{
              selectedDay?.fullDate?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            }}
          </h3>
          <button
            @click="isDayModalOpen = false"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          <div
            v-for="task in selectedDay?.tasks"
            :key="'modal-' + task.id"
            class="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <div class="flex justify-between items-start gap-4 mb-2">
              <h4
                class="text-sm font-semibold text-slate-900 dark:text-white"
                :class="
                  task.status === 'COMPLETED' ? 'line-through opacity-70' : ''
                "
              >
                {{ task.title }}
              </h4>
              <span
                :class="[
                  'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm shrink-0',
                  task.status === 'COMPLETED'
                    ? 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                    : task.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20'
                      : task.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20'
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20',
                ]"
              >
                {{ task.priority }}
              </span>
            </div>
            <p
              v-if="task.description"
              class="text-sm text-slate-600 dark:text-slate-400 mb-4"
              :class="
                task.status === 'COMPLETED' ? 'line-through opacity-70' : ''
              "
            >
              {{ task.description }}
            </p>

            <div
              class="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700"
            >
              <div
                class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="task.assignee?.avatarUrl"
                  :src="task.assignee.avatarUrl"
                  class="w-full h-full object-cover"
                />
                <Icon
                  v-else
                  name="material-symbols:person-outline-rounded"
                  class="text-xs text-slate-500"
                />
              </div>
              <span class="text-xs font-mono text-slate-600 dark:text-slate-400"
                >Assigned to
                <span class="font-bold text-slate-900 dark:text-white">{{
                  task.assignee?.fullName
                }}</span></span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isCreatingTask"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="cancelCreateTask"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-zoom-in"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50"
        >
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            Assign New Task
          </h3>
          <button
            @click="cancelCreateTask"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <form @submit.prevent="submitTask" class="p-6 space-y-4">
          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >Task Title</label
            >
            <input
              v-model="newTask.title"
              type="text"
              placeholder="e.g., Draft Adekoya Interview"
              required
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >Description</label
            >
            <textarea
              v-model="newTask.description"
              rows="3"
              placeholder="Add detailed instructions..."
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm text-slate-900 dark:text-white resize-none"
            ></textarea>
          </div>

          <div class="flex gap-4">
            <div class="flex-1">
              <label
                class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
                >Priority</label
              >
              <select
                v-model="newTask.priority"
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm text-slate-900 dark:text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div class="flex-1">
              <label
                class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
                >Due Date</label
              >
              <input
                type="date"
                v-model="newTask.dueDate"
                required
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >Assignee</label
            >
            <select
              v-model="newTask.assigneeId"
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm text-slate-900 dark:text-white"
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
          </div>

          <div
            class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700"
          >
            <button
              type="button"
              @click="cancelCreateTask"
              class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmittingTask"
              class="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Icon
                v-if="isSubmittingTask"
                name="material-symbols:sync-rounded"
                class="text-base animate-spin"
              />
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useAppToast } from "~/composables/useAppToast";

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const { error: toastError, success: toastSuccess } = useAppToast();

// State
const allTasks = ref([]); // Holds EVERY task for the global calendar
const teamMembers = ref([]);

// Modals
const isCreatingTask = ref(false);
const isSubmittingTask = ref(false);
const isDayModalOpen = ref(false);
const selectedDay = ref(null);

const newTask = ref({
  title: "",
  description: "",
  assigneeId: user.value?.id,
  priority: "MEDIUM",
  dueDate: "",
});

// Color Mapping Logic (Assigns a deterministic color based on User ID)
const colorPalette = [
  "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30",
  "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30",
  "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/20 dark:text-fuchsia-400 dark:border-fuchsia-500/30",
];

const getUserColor = (userId) => {
  if (!userId) return "bg-slate-100 text-slate-700 border-slate-200";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
};

// Open Day Modal
const openDayModal = (day) => {
  if (!day.isCurrentMonth || day.tasks.length === 0) return;
  selectedDay.value = day;
  isDayModalOpen.value = true;
};

// Sidebar Filtering (Personal Tasks Only)
const myTasks = computed(() => {
  return allTasks.value.filter((t) => t.assigneeId === user.value?.id);
});

const myUpcomingTasks = computed(() => {
  return myTasks.value.filter((task) => {
    if (task.status === "COMPLETED" || !task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return taskDate <= now;
  });
});

// Calendar State
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthName = computed(() => monthNames[currentMonth.value]);

// Calendar Generation Logic
const calendarDays = computed(() => {
  const days = [];
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);

  const startingDayOfWeek = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  // 1. Pad Previous Month
  const prevMonthLastDay = new Date(
    currentYear.value,
    currentMonth.value,
    0,
  ).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      tasks: [],
    });
  }

  // 2. Current Month Days
  for (let i = 1; i <= totalDays; i++) {
    const iterDate = new Date(currentYear.value, currentMonth.value, i);
    const isToday = iterDate.toDateString() === today.toDateString();

    // Find ALL tasks due on this date
    const dailyTasks = allTasks.value.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).toDateString() === iterDate.toDateString();
    });

    days.push({
      date: i,
      fullDate: iterDate,
      isCurrentMonth: true,
      isToday,
      tasks: dailyTasks,
    });
  }

  // 3. Pad Next Month
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ date: i, isCurrentMonth: false, isToday: false, tasks: [] });
  }

  return days;
});

const isToday = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString).toDateString() === new Date().toDateString();
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const goToToday = () => {
  const now = new Date();
  currentMonth.value = now.getMonth();
  currentYear.value = now.getFullYear();
};

// Data Fetching
const loadTasks = async () => {
  try {
    allTasks.value = await useApiFetch("/tasks?scope=all"); // Fetch everything
  } catch (error) {
    toastError("Failed to load team tasks");
  }
};

const loadTeamMembers = async () => {
  if (user.value?.role === "ADMIN") {
    try {
      const users = await useApiFetch("/users");
      teamMembers.value = users.filter((u) => u.id !== user.value.id);
    } catch (error) {
      console.error("Failed to load team members");
    }
  }
};

// Actions
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

    // Determine assignee object manually to avoid needing a backend re-fetch immediately
    let mappedAssignee = user.value;
    if (addedTask.assigneeId !== user.value.id) {
      mappedAssignee =
        teamMembers.value.find((m) => m.id === addedTask.assigneeId) || null;
    }
    addedTask.assignee = mappedAssignee;

    allTasks.value.push(addedTask);
    toastSuccess("Task assigned successfully");
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

onMounted(async () => {
  await loadTasks();
  await loadTeamMembers();
});
</script>

<style scoped>
@reference "tailwindcss";
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-slate-600 rounded-full;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  @apply bg-slate-400 dark:bg-slate-500;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-zoom-in {
  animation: zoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
