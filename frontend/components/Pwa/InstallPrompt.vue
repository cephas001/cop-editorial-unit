<template>
  <div
    v-if="showPrompt"
    class="fixed bottom-6 inset-x-0 mx-auto z-[90] animate-slide-up w-[calc(100%-3rem)] max-w-sm font-sans"
  >
    <div
      class="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white p-5 rounded-2xl shadow-2xl border border-slate-800 flex flex-col gap-4"
    >
      <!-- Top Section: App Branding & Close -->
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          >
            <!-- Fixed Image Path using Nuxt Alias -->
            <img
              src="~/assets/images/the_vineyard_logo.webp"
              alt="The Vineyard Logo"
              class="w-full h-full rounded-xl object-cover"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold tracking-wide text-slate-100"
              >Install <span class="italic">The Vineyard</span></span
            >
            <span class="text-xs text-slate-400 font-medium mt-0.5"
              >Manage drafts and collaborate offline.</span
            >
          </div>
        </div>
        <button
          @click="dismissPrompt"
          aria-label="Dismiss installation prompt"
          class="text-slate-500 hover:text-slate-200 transition-colors p-1"
        >
          <Icon name="material-symbols:close-rounded" class="text-lg" />
        </button>
      </div>

      <!-- Action Area: Native Button vs iOS Helper Card -->
      <button
        v-if="!isIOS"
        @click="installApp"
        class="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 active:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
      >
        <Icon name="material-symbols:download-rounded" class="text-lg" />
        Install App
      </button>

      <div
        v-else
        class="bg-slate-950/50 rounded-xl p-3 text-xs text-slate-300 font-medium leading-relaxed border border-slate-800/60"
      >
        To install on iOS: tap the
        <span
          class="inline-flex items-center justify-center bg-slate-800 p-1 rounded mx-1 text-slate-100"
          ><Icon name="material-symbols:ios-share" class="text-xs"
        /></span>
        <strong>Share</strong> button, then scroll and select
        <strong>Add to Home Screen</strong>.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const showPrompt = ref(false);
const deferredPrompt = ref(null);
const isIOS = ref(false);
let timer = null;

const handleBeforeInstallPrompt = (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt.value = e;
  // If the timer already ran, display the UI immediately once the event triggers
  if (!showPrompt.value && !localStorage.getItem("pwa-install-dismissed")) {
    showPrompt.value = true;
  }
};

const dismissPrompt = () => {
  showPrompt.value = false;
  // Save to localStorage so we don't annoy authors for 7 days
  const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
  localStorage.setItem("pwa-install-dismissed", expiry.toString());
};

const installApp = async () => {
  if (!deferredPrompt.value) return;

  try {
    // Show the native browser install prompt
    deferredPrompt.value.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.value.userChoice;
    if (outcome === "accepted") {
      showPrompt.value = false;
    }
  } catch (error) {
    console.error("Installation prompt failed:", error);
  } finally {
    // Clear out prompt handle regardless of outcome
    deferredPrompt.value = null;
  }
};

onMounted(() => {
  if (!import.meta.client) return;

  // 1. Check if the application is running in standalone PWA mode
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone;
  if (isStandalone) return;

  // 2. Look for recent dismissals to respect preference
  const dismissedUntil = localStorage.getItem("pwa-install-dismissed");
  if (dismissedUntil && new Date().getTime() < parseInt(dismissedUntil)) return;

  // 3. Precise Apple platform identification (including modern iPads)
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMacWithTouch =
    window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1;
  isIOS.value = /iphone|ipad|ipod/.test(userAgent) || isMacWithTouch;

  // 4. Attach application hooks
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  // 5. Present prompt gracefully after a 4-second delay window
  timer = setTimeout(() => {
    if (isIOS.value || deferredPrompt.value) {
      showPrompt.value = true;
    }
  }, 4000);

  // 6. Instantly catch external dynamic context setup triggers
  window.addEventListener("appinstalled", () => {
    showPrompt.value = false;
    deferredPrompt.value = null;
  });
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    if (timer) clearTimeout(timer);
  }
});
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
