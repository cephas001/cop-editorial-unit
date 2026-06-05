<template>
  <div ref="dropdownContainer">
    <button
      @click="toggleDropdown"
      class="text-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 transition-colors duration-200 flex items-center justify-center relative"
      aria-label="Notifications"
    >
      <Icon
        name="material-symbols:notifications-outline-rounded"
        class="text-xl"
      />

      <span
        v-if="unreadCount > 0"
        class="absolute top-1.5 right-1.5 flex h-2.5 w-2.5"
      >
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"
        ></span>
        <span
          class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white dark:border-slate-900"
        ></span>
      </span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 left-0 mt-2 w-[95%] mx-auto sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 transform origin-top-right animate-fade-in"
    >
      <div
        class="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50"
      >
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">
          Notifications
        </h3>
        <div class="flex gap-3">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
          >
            Mark read
          </button>
          <button
            v-if="notifications.length > 0"
            @click="clearAllNotifications"
            class="text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="p-8 flex justify-center">
        <Icon
          name="material-symbols:sync-rounded"
          class="text-2xl text-indigo-500 animate-spin"
        />
      </div>

      <div
        v-else-if="notifications.length === 0"
        class="p-8 text-center flex flex-col items-center"
      >
        <Icon
          name="material-symbols:notifications-off-outline-rounded"
          class="text-4xl text-slate-300 dark:text-slate-600 mb-2"
        />
        <p class="text-sm text-slate-500 dark:text-slate-400">
          You're all caught up!
        </p>
      </div>

      <div v-else class="max-h-[400px] overflow-y-auto custom-scrollbar">
        <ul class="divide-y divide-slate-100 dark:divide-slate-700/50">
          <li
            v-for="notification in notifications"
            :key="notification.id"
            @click="markAsRead(notification)"
            class="group p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer flex items-start gap-3 relative"
            :class="
              !notification.isRead
                ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                : ''
            "
          >
            <div
              class="mt-1.5 shrink-0 w-2 h-2 rounded-full"
              :class="!notification.isRead ? 'bg-indigo-500' : 'bg-transparent'"
            ></div>

            <div class="flex-1 pr-8">
              <p
                :class="[
                  'text-xs md:text-sm leading-snug',
                  !notification.isRead
                    ? 'text-slate-900 dark:text-white font-medium'
                    : 'text-slate-600 dark:text-slate-400',
                ]"
              >
                {{ notification.content }}
              </p>
              <span
                class="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 block"
              >
                {{ formatRelativeTime(notification.createdAt) }}
              </span>
            </div>

            <button
              @click.stop="deleteNotification(notification.id)"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10"
              title="Delete notification"
            >
              <Icon
                name="material-symbols:delete-outline-rounded"
                class="text-lg"
              />
            </button>
          </li>
        </ul>
      </div>

      <div
        class="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-center"
      >
        <span
          class="text-[10px] font-mono text-slate-400 uppercase tracking-widest"
          >Editorial Unit</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const isOpen = ref(false);
const isLoading = ref(false);
const notifications = ref([]);
const dropdownContainer = ref(null);

// Calculate unread alerts
const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.isRead).length;
});

// Fetch notifications from the backend
const loadNotifications = async () => {
  try {
    const data = await useApiFetch("/notifications");
    notifications.value = data;
  } catch (error) {
    console.error("Failed to load notifications", error);
  }
};

// Toggle menu and fetch fresh data when opened
const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    isLoading.value = true;
    await loadNotifications();
    isLoading.value = false;
  }
};

// Mark a single notification as read
const markAsRead = async (notification) => {
  if (notification.isRead) return;
  notification.isRead = true; // Optimistic
  try {
    await useApiFetch(`/notifications/${notification.id}/read`, {
      method: "PATCH",
    });
  } catch (error) {
    notification.isRead = false;
  }
};

// Mark all as read
const markAllAsRead = async () => {
  notifications.value.forEach((n) => (n.isRead = true));
  try {
    await useApiFetch("/notifications/read-all", { method: "PATCH" });
  } catch (error) {
    await loadNotifications();
  }
};

// --- NEW: Delete functionality ---

// Delete a single notification
const deleteNotification = async (id) => {
  // Optimistically remove it from the list
  const previousNotifications = [...notifications.value];
  notifications.value = notifications.value.filter((n) => n.id !== id);

  try {
    await useApiFetch(`/notifications/${id}`, { method: "DELETE" });
  } catch (error) {
    // If it fails, put it back
    notifications.value = previousNotifications;
    console.error("Failed to delete notification", error);
  }
};

// Clear all notifications
const clearAllNotifications = async () => {
  const previousNotifications = [...notifications.value];
  notifications.value = []; // Optimistically clear

  try {
    await useApiFetch("/notifications/all/clear", { method: "DELETE" });
  } catch (error) {
    notifications.value = previousNotifications;
    console.error("Failed to clear notifications", error);
  }
};

// Close dropdown if clicked outside
const handleClickOutside = (event) => {
  if (
    dropdownContainer.value &&
    !dropdownContainer.value.contains(event.target)
  ) {
    isOpen.value = false;
  }
};

// Helper to make timestamps look nice
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

onMounted(() => {
  loadNotifications();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; /* Tailwind slate-300 */
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569; /* Tailwind slate-600 */
}

.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
