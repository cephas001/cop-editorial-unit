<template>
  <div
    class="fixed bottom-10 right-0 z-9999 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto overflow-hidden rounded-xl shadow-xl border bg-white flex items-stretch"
        :class="borderColors[toast.type]"
      >
        <div
          class="p-4 flex items-center justify-center shrink-0"
          :class="bgColors[toast.type]"
        >
          <Icon
            :name="icons[toast.type]"
            class="text-2xl"
            :class="iconColors[toast.type]"
          />
        </div>

        <div class="py-3 px-4 flex-grow flex flex-col justify-center">
          <h4 class="text-sm font-black font-mono text-gray-900 leading-tight">
            {{ toast.title }}
          </h4>
          <p class="text-xs text-gray-500 font-medium mt-0.5 leading-snug">
            {{ toast.message }}
          </p>
        </div>

        <button
          @click="remove(toast.id)"
          class="px-4 text-gray-400 hover:text-black transition-colors focus:outline-none"
        >
          <Icon name="material-symbols:close" class="text-lg" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useAppToast } from "~/composables/useAppToast";

const { toasts, remove } = useAppToast();

// Dictionaries to map the toast 'type' to specific Tailwind classes with Dark Mode
const borderColors = {
  success: "border-emerald-200 dark:border-emerald-500/30",
  error: "border-rose-200 dark:border-rose-500/30",
  info: "border-indigo-200 dark:border-indigo-500/30",
  warning: "border-amber-300 dark:border-amber-500/30",
};
const bgColors = {
  success: "bg-emerald-50 dark:bg-emerald-500/10",
  error: "bg-rose-50 dark:bg-rose-500/10",
  info: "bg-indigo-50 dark:bg-indigo-500/10",
  warning: "bg-amber-50 dark:bg-amber-500/10",
};
const iconColors = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-rose-600 dark:text-rose-400",
  info: "text-indigo-600 dark:text-indigo-400",
  warning: "text-amber-600 dark:text-amber-400",
};
const icons = {
  success: "material-symbols:check-circle-rounded",
  error: "material-symbols:error-rounded",
  info: "material-symbols:info-rounded",
  warning: "material-symbols:notifications-active-rounded",
};
</script>

<style scoped>
/* Smooth slide-in-from-right animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9); /* Slides out to the right */
}
/* This ensures other toasts smoothly slide up when one is removed */
.toast-move {
  transition: transform 0.4s ease;
}
</style>
