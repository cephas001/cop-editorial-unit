// composables/usePresence.js
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth";

// Global state: A Set is perfect here because it automatically prevents duplicates
// if a user has your app open in two different browser tabs.
const onlineUsers = ref(new Set());
let presenceChannel = null;

export const usePresence = () => {
  const supabase = useSupabase(); // Your existing singleton client
  const authStore = useAuthStore();

  const initPresence = () => {
    // Prevent initializing twice or initializing if logged out
    if (!authStore.user || presenceChannel) return;

    // 1. Join a shared "Room"
    presenceChannel = supabase.channel("global-presence", {
      config: {
        presence: { key: authStore.user.id }, // Use their user ID as the unique key
      },
    });

    // 2. Listen for anyone joining or leaving
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();

        // Extract all the unique user IDs currently in the room
        const currentlyOnline = new Set();
        for (const userId in state) {
          currentlyOnline.add(userId);
        }

        // Update our reactive global state
        onlineUsers.value = currentlyOnline;
      })
      .subscribe(async (status) => {
        // 3. Once connected, announce OUR presence to the room
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
        }
      });
  };

  // Helper function to check a specific user
  const isUserOnline = (userId) => {
    return onlineUsers.value.has(userId);
  };

  return {
    onlineUsers,
    initPresence,
    isUserOnline,
  };
};
