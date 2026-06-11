// composables/usePresence.js
import { ref, watch } from "vue";
import { useAuthStore } from "~/stores/auth";

// Global state tracking
const onlineUsers = ref(new Set());
let presenceChannel = null;

export const usePresence = () => {
  const supabase = useSupabase();
  const authStore = useAuthStore();

  const initPresence = () => {
    // If we already opened the connection, don't do it again
    if (presenceChannel) return;

    // THE FIX: If the user hasn't loaded yet, wait for them!
    if (!authStore.user) {
      const unwatch = watch(
        () => authStore.user,
        (newUser) => {
          if (newUser) {
            unwatch(); // Stop watching once we have the user
            initPresence(); // Try again now that we have an ID!
          }
        },
      );
      return;
    }

    // 1. Join the shared room using the authenticated user's ID
    presenceChannel = supabase.channel("global-presence", {
      config: {
        presence: { key: authStore.user.id },
      },
    });

    // 2. Listen for anyone joining or leaving
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();

        // Extract all the unique user IDs currently in the room
        // Object.keys(state) automatically gives us an array of the keys!
        onlineUsers.value = new Set(Object.keys(state));
      })
      .subscribe(async (status) => {
        // 3. Announce OUR presence to the room
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
        }
      });
  };

  // Helper function to check a specific user
  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.value.has(userId);
  };

  return {
    onlineUsers,
    initPresence,
    isUserOnline,
  };
};
