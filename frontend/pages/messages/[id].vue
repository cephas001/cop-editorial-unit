<template>
  <div
    class="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
  >
    <header
      class="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 flex items-center px-4 sm:px-6 lg:px-8 shadow-sm relative"
    >
      <button
        @click="navigateTo('/messages')"
        class="mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 flex items-center justify-center"
      >
        <Icon
          name="material-symbols:arrow-back-rounded"
          class="text-xl text-slate-700 dark:text-slate-400"
        />
      </button>

      <div
        v-if="!isLoading"
        class="flex items-center gap-3 flex-1 cursor-pointer"
        @click="navigateTo('/team')"
      >
        <div class="relative">
          <img
            v-if="chatPartner?.avatarUrl"
            :src="chatPartner.avatarUrl"
            class="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold border border-slate-200 dark:border-slate-700"
          >
            {{ chatPartner?.fullName?.charAt(0) || "U" }}
          </div>
          <div
            class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"
            v-if="isUserOnline(chatPartner?.id)"
          ></div>
        </div>

        <div>
          <h1
            class="text-sm md:text-base font-bold text-black dark:text-white leading-tight"
          >
            {{ chatPartner?.fullName || "Loading..." }}
          </h1>
          <p
            class="text-xs font-mono flex items-center gap-1"
            :class="
              isUserOnline(chatPartner?.id)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            "
          >
            {{ isUserOnline(chatPartner?.id) ? "Online" : "Offline" }}
          </p>
        </div>
      </div>
    </header>

    <main
      ref="chatContainer"
      @scroll="handleScrollTracker"
      class="flex-1 overflow-y-auto px-4 py-6 md:px-6 relative flex flex-col custom-scrollbar"
    >
      <div class="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div v-if="isLoading" class="flex-1 flex items-center justify-center">
          <div class="flex flex-col items-center justify-center py-12">
            <VineyardLoader size="110px" />
            <span
              class="mt-4 text-xs md:text-sm font-mono text-primary-500/70 animate-pulse"
              >Loading chat...</span
            >
          </div>
        </div>

        <template v-else>
          <div
            v-if="isFetchingOlder"
            class="w-full flex justify-center py-2 shrink-0"
          >
            <Icon
              name="material-symbols:sync-rounded"
              class="text-xl text-primary-500 animate-spin"
            />
          </div>

          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="[
              'flex flex-col max-w-[85%] md:max-w-[65%] mb-4',
              msg.senderId === user?.id
                ? 'items-end self-end'
                : 'items-start self-start',
            ]"
          >
            <div
              v-if="msg.senderId === user?.id"
              class="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm"
            >
              <p class="text-xs md:text-sm leading-relaxed">
                {{ msg.content }}
              </p>
            </div>

            <div
              v-else
              class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm"
            >
              <p class="text-xs md:text-sm leading-relaxed">
                {{ msg.content }}
              </p>
            </div>

            <span class="text-[10px] font-mono text-slate-400 mt-1 mx-1">
              {{ formatTime(msg.createdAt) }}
            </span>
          </div>
        </template>

        <div class="h-2 shrink-0"></div>
      </div>
    </main>

    <footer
      class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-800/70 p-3 sm:p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20"
    >
      <form
        @submit.prevent="sendMessage"
        class="flex items-end gap-2 md:gap-3 max-w-4xl mx-auto"
      >
        <div
          class="flex-1 bg-slate-100 dark:bg-slate-950 border border-transparent focus-within:border-primary-500 rounded-xl flex items-end relative transition-colors duration-200"
        >
          <textarea
            ref="messageInput"
            v-model="newMessage"
            @input="autoResize"
            @keydown.enter.prevent="handleEnter"
            class="w-full bg-transparent outline-none border-none focus:ring-0 resize-none py-3 px-4 text-xs md:text-sm text-black dark:text-white placeholder:text-slate-500 max-h-32 min-h-[44px] custom-scrollbar"
            placeholder="Type a message..."
            rows="1"
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="!newMessage.trim() || isSending"
          class="w-11 h-11 mb-0.5 bg-primary-600 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
        >
          <Icon name="material-symbols:send-rounded" class="text-xl ml-1" />
        </button>
      </form>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useAppToast } from "~/composables/useAppToast";
import { useSupabase } from "~/composables/useSupabase";
import { usePresence } from "~/composables/usePresence";

definePageMeta({ hideTopbar: true });

const route = useRoute();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { error: toastError } = useAppToast();
const supabase = useSupabase();
const { isUserOnline } = usePresence();

const conversationId = route.params.id;
const conversation = ref(null);
const messages = ref([]);
const newMessage = ref("");
const isLoading = ref(true);
const isSending = ref(false);

// New Pagination Bounds State
const isFetchingOlder = ref(false);
const hasMoreMessages = ref(true);
const MESSAGES_LIMIT = 50;

const chatContainer = ref(null);
const messageInput = ref(null);

const chatPartner = computed(() => {
  if (!conversation.value) return null;
  return conversation.value.participants.find((p) => p.id !== user.value?.id);
});

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const scrollToBottom = async (smooth = false) => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }
};

const autoResize = () => {
  if (!messageInput.value) return;
  messageInput.value.style.height = "auto";
  messageInput.value.style.height = messageInput.value.scrollHeight + "px";
};

const handleEnter = (e) => {
  if (e.shiftKey) {
    newMessage.value += "\n";
    autoResize();
  } else {
    sendMessage();
  }
};

// --- CORE DATA ACTIONS ---
const loadChat = async () => {
  try {
    // Fetch initial chunk of 50 records
    const data = await useApiFetch(
      `/conversations/${conversationId}?limit=${MESSAGES_LIMIT}`,
    );
    conversation.value = data;

    // Postgres delivers newest first via DESC order. We reverse it so it mounts chronologically.
    messages.value = data.messages.reverse();

    if (data.messages.length < MESSAGES_LIMIT) {
      hasMoreMessages.value = false;
    }

    scrollToBottom(false);
  } catch (err) {
    toastError("Failed to load chat history");
    navigateTo("/messages");
  } finally {
    isLoading.value = false;
  }
};

// Continuous Infinite Scrolling Pagination Action
const loadOlderMessages = async () => {
  if (!hasMoreMessages.value || isFetchingOlder.value) return;
  isFetchingOlder.value = true;

  // The base anchor timestamp is the date of the oldest message currently at index zero
  const oldestMsg = messages.value[0];
  if (!oldestMsg) return;

  const container = chatContainer.value;
  // Step 1: Lock existing height measurements before mutation injection
  const previousScrollHeight = container.scrollHeight;
  const previousScrollTop = container.scrollTop;

  try {
    const data = await useApiFetch(
      `/conversations/${conversationId}?before=${oldestMsg.createdAt}&limit=${MESSAGES_LIMIT}`,
    );
    const historicalMessages = data.messages.reverse();

    if (historicalMessages.length < MESSAGES_LIMIT) {
      hasMoreMessages.value = false;
    }

    // Prepend older history elements to state
    messages.value = [...historicalMessages, ...messages.value];

    // Step 2: Render changes, then immediately reset offsets dynamically
    await nextTick();
    container.scrollTop =
      container.scrollHeight - previousScrollHeight + previousScrollTop;
  } catch (err) {
    console.error("Pagination error:", err);
  } finally {
    isFetchingOlder.value = false;
  }
};

// Listens to native browser scroll offsets to run fetch triggers automatically
const handleScrollTracker = (e) => {
  const container = e.target;
  // If the user scrolls all the way to the top of the pane, call the next block
  if (container.scrollTop === 0) {
    loadOlderMessages();
  }
};

const sendMessage = async () => {
  const content = newMessage.value.trim();
  if (!content || isSending.value) return;

  isSending.value = true;
  newMessage.value = "";
  autoResize();

  try {
    await useApiFetch(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: { content },
    });
  } catch (error) {
    toastError("Message failed to send");
    newMessage.value = content;
  } finally {
    isSending.value = false;
  }
};

// --- REALTIME SUBSCRIPTION ---
let realtimeChannel;

const setupRealtime = () => {
  realtimeChannel = supabase
    .channel(`chat-${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Message",
        filter: `conversationId=eq.${conversationId}`,
      },
      (payload) => {
        const newMsg = payload.new;
        const exists = messages.value.find((m) => m.id === newMsg.id);
        if (!exists) {
          messages.value.push(newMsg);
          scrollToBottom(true); // Smooth scroll on active new message arrivals
        }
      },
    )
    .subscribe();
};

onMounted(() => {
  loadChat();
  setupRealtime();
});

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }
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
