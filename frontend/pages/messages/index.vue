<template>
  <div class="max-w-7xl mx-auto space-y-8 font-sans pb-24">
    <!-- Header & Controls -->
    <div
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1
          class="text-xl md:text-2xl font-semibold text-black dark:text-white tracking-tight"
        >
          Messages
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Collaborate with the family.
        </p>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-auto">
          <Icon
            name="material-symbols:search-rounded"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg"
          />
          <input
            v-model="searchQuery"
            class="w-full sm:w-48 lg:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-4 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-xs md:text-sm font-mono text-slate-700 dark:text-slate-200 placeholder:text-slate-500 transition-colors shadow-sm"
            placeholder="Search chats"
            type="text"
          />
        </div>

        <button
          @click="openNewChatModal"
          class="shrink-0 px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-mono transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <Icon
            name="material-symbols:edit-square-outline-rounded"
            class="text-lg"
          />
          <span class="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </div>

    <!-- MAIN INBOX LIST (Active Conversations) -->
    <div class="relative">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 150, duration: 400 } }"
        class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
      >
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center min-h-[330px] px-6 pb-9"
        >
          <VineyardLoader size="100px" />
          <span
            class="mt-4 text-xs md:text-sm font-mono text-primary-500/70 animate-pulse"
          >
            Fetching conversations...
          </span>
        </div>

        <div
          v-else-if="filteredConversations.length === 0"
          class="flex flex-col items-center justify-center p-12 text-center min-h-[400px]"
        >
          <div
            class="w-14 h-14 md:w-16 md:h-16 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-4 border border-primary-100 dark:border-primary-500/20"
          >
            <Icon
              name="material-symbols:chat-bubble-outline-rounded"
              class="text-2xl md:text-3xl"
            />
          </div>
          <h3
            class="text-md md:text-lg font-semibold text-black dark:text-white mb-2"
          >
            No active conversations
          </h3>
          <p
            class="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5"
          >
            You don't have any messages yet. Start a new chat to connect with
            the family.
          </p>
          <button
            @click="openNewChatModal"
            class="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs md:text-sm font-mono transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Icon
              name="material-symbols:add-rounded"
              class="text-md md:text-lg"
            />
            Start a Chat
          </button>
        </div>

        <ul
          v-else
          v-auto-animate
          class="divide-y divide-slate-100 dark:divide-slate-700/50"
        >
          <li
            v-for="chat in filteredConversations"
            :key="chat.id"
            @click="navigateTo(`/messages/${chat.id}`)"
            class="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-200"
          >
            <div class="flex items-center p-4 sm:p-5 gap-4">
              <div class="relative flex-shrink-0">
                <img
                  v-if="chat._partner?.avatarUrl"
                  :src="chat._partner?.avatarUrl"
                  class="h-10 w-10 md:w-12 md:h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div
                  v-else
                  class="h-10 w-10 md:w-12 md:h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-lg border border-slate-200 dark:border-slate-700"
                >
                  {{ chat._partner?.fullName?.charAt(0) || "U" }}
                </div>
                <div
                  class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"
                  v-if="isUserOnline(chat._partner?.id)"
                ></div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline my-1 gap-2">
                  <h2
                    class="text-xs md:text-sm font-semibold text-black dark:text-white truncate group-hover:text-primary-600 transition-colors"
                  >
                    {{ chat.isGroup ? chat.title : chat._partner?.fullName }}
                  </h2>
                  <span
                    :class="[
                      'text-[10px] md:text-xs whitespace-nowrap shrink-0 font-mono',
                      chat._hasUnread
                        ? 'text-primary-600 dark:text-primary-400 font-bold'
                        : 'text-slate-400 dark:text-slate-500',
                    ]"
                  >
                    {{ chat._displayTime }}
                  </span>
                </div>

                <div class="flex justify-between items-center gap-2">
                  <p
                    :class="[
                      'text-xs md:text-sm truncate',
                      chat._hasUnread
                        ? 'text-black dark:text-white font-medium'
                        : 'text-slate-500 dark:text-slate-400',
                    ]"
                  >
                    <span
                      v-if="chat.messages[0]?.senderId === user?.id"
                      class="text-slate-400"
                      >You:
                    </span>
                    {{
                      chat.messages[0]?.content || "Started a new conversation"
                    }}
                  </p>
                  <span
                    v-if="chat._hasUnread"
                    class="flex-shrink-0 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    New
                  </span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- NEW CHAT MODAL (Global Team Address Book) -->
    <div
      v-if="isNewChatModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="isNewChatModalOpen = false"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 },
        }"
        class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[80vh]"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0"
        >
          <h3 class="text-sm md:text-base font-bold text-black dark:text-white">
            Start New Chat
          </h3>
          <button
            @click="isNewChatModalOpen = false"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <div
          class="p-4 border-b border-slate-100 dark:border-slate-700 shrink-0"
        >
          <div class="relative w-full">
            <Icon
              name="material-symbols:search-rounded"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg"
            />
            <input
              v-model="memberSearchQuery"
              class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-4 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-xs md:text-sm text-black dark:text-white placeholder:text-slate-500 transition-colors"
              placeholder="Search team members..."
              type="text"
            />
          </div>
        </div>

        <div class="overflow-y-auto flex-1 custom-scrollbar p-2">
          <div
            v-if="isFetchingTeam || isCreatingChat"
            class="pb-10 flex flex-col items-center justify-center"
          >
            <VineyardLoader size="80px" />
            <span
              class="mt-4 text-xs md:text-sm font-mono text-primary-500/70 animate-pulse"
            >
              {{
                isCreatingChat
                  ? "Starting conversation..."
                  : "Loading team members..."
              }}
            </span>
          </div>

          <!-- THE CORRECTED MODAL LIST (Iterates over team members, not active chats) -->
          <ul
            v-else
            v-auto-animate
            class="divide-y divide-slate-100 dark:divide-slate-700/50"
          >
            <li
              v-for="member in filteredTeamMembers"
              :key="member.id"
              @click="startChat(member.id)"
              class="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-200"
            >
              <div class="flex items-center p-4 sm:p-5 gap-4">
                <div class="relative flex-shrink-0">
                  <img
                    v-if="member.avatarUrl"
                    :src="member.avatarUrl"
                    class="h-10 w-10 md:w-12 md:h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div
                    v-else
                    class="h-10 w-10 md:w-12 md:h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-lg border border-slate-200 dark:border-slate-700"
                  >
                    {{ member.fullName?.charAt(0) || "U" }}
                  </div>
                  <div
                    class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"
                    v-if="isUserOnline(member.id)"
                  ></div>
                </div>

                <div class="flex-1 min-w-0">
                  <h2
                    class="text-xs md:text-sm font-semibold text-black dark:text-white truncate group-hover:text-primary-600 transition-colors"
                  >
                    {{ member.fullName }}
                  </h2>
                  <p
                    class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate"
                  >
                    {{ member.email || "Team Member" }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { useAppToast } from "~/composables/useAppToast";
import { useSupabase } from "~/composables/useSupabase";
import { usePresence } from "~/composables/usePresence";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { error: toastError } = useAppToast();
const supabase = useSupabase();
const { isUserOnline } = usePresence();

const conversations = ref([]);
const isLoading = ref(true);
const isFetchingTeam = ref(false);
const searchQuery = ref("");

// --- DATA NORMALIZATION TRANSFORMS ---
const normalizeChat = (chat) => {
  const partner =
    chat.participants?.find((p) => p.id !== user.value?.id) || null;
  const lastMsg = chat.messages?.[0];
  const unread = lastMsg
    ? lastMsg.senderId !== user.value?.id && !lastMsg.isRead
    : false;

  return {
    ...chat,
    _partner: partner,
    _hasUnread: unread,
    _displayTime: formatRelativeTime(chat.lastMessageAt),
  };
};

// --- COMPUTED MAPS ---
const filteredConversations = computed(() => {
  const list = conversations.value;
  if (!searchQuery.value) return list;

  const query = searchQuery.value.toLowerCase();
  return list.filter((chat) => {
    const partnerName = chat._partner?.fullName?.toLowerCase() || "";
    const title = chat.title?.toLowerCase() || "";
    return partnerName.includes(query) || title.includes(query);
  });
});

const teamMembers = ref([]);
const memberSearchQuery = ref("");

// This safely queries ALL team members fetched for the modal
const filteredTeamMembers = computed(() => {
  if (!memberSearchQuery.value) return teamMembers.value;
  const query = memberSearchQuery.value.toLowerCase();
  return teamMembers.value.filter((m) =>
    m.fullName.toLowerCase().includes(query),
  );
});

// --- UTILS ---
const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
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

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// --- DATA ACTIONS ---
const loadConversations = async () => {
  try {
    const rawChats = await useApiFetch("/conversations");
    conversations.value = rawChats.map(normalizeChat);
  } catch (error) {
    toastError("Failed to load messages");
  } finally {
    isLoading.value = false;
  }
};

const loadTeamMembers = async () => {
  try {
    isFetchingTeam.value = true;
    const allUsers = await useApiFetch("/users");
    // Ensure the current user doesn't show up in their own "Start a Chat" list
    teamMembers.value = allUsers.filter((u) => u.id !== user.value?.id);
  } catch (error) {
    console.error("Failed to load team members", error);
  } finally {
    isFetchingTeam.value = false;
  }
};

const openNewChatModal = async () => {
  isNewChatModalOpen.value = true;
  if (teamMembers.value.length === 0) {
    await loadTeamMembers();
  }
};

const isNewChatModalOpen = ref(false);
const isCreatingChat = ref(false);

const startChat = async (targetUserId) => {
  if (isCreatingChat.value) return;
  isCreatingChat.value = true;
  try {
    const chat = await useApiFetch("/conversations", {
      method: "POST",
      body: { targetUserId },
    });
    isNewChatModalOpen.value = false;
    navigateTo(`/messages/${chat.id}`);
  } catch (error) {
    toastError("Failed to start conversation");
  } finally {
    isCreatingChat.value = false;
  }
};

// --- REALTIME ---
let realtimeChannel;

const setupRealtime = () => {
  realtimeChannel = supabase
    .channel("public:Message")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "Message" },
      (payload) => {
        const newMsg = payload.new;
        const chatIndex = conversations.value.findIndex(
          (c) => c.id === newMsg.conversationId,
        );

        if (chatIndex !== -1) {
          const chat = conversations.value[chatIndex];
          chat.messages = [newMsg];
          chat.lastMessageAt = newMsg.createdAt;
          const updatedChat = normalizeChat(chat);
          conversations.value.splice(chatIndex, 1);
          conversations.value.unshift(updatedChat);
        } else {
          loadConversations();
        }
      },
    )
    .subscribe();
};

let timeUpdateInterval;

onMounted(() => {
  loadConversations();
  setupRealtime();
  timeUpdateInterval = setInterval(() => {
    conversations.value = conversations.value.map((c) => ({
      ...c,
      _displayTime: formatRelativeTime(c.lastMessageAt),
    }));
  }, 30000);
});

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  if (timeUpdateInterval) clearInterval(timeUpdateInterval);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(71, 85, 105, 0.5);
}
</style>
