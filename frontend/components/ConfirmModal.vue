<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center px-4 sm:px-0"
    >
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="respond(false)"
      ></div>

      <Transition name="scale">
        <div
          v-if="isOpen"
          class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full relative z-10 overflow-hidden text-center border border-slate-200 dark:border-slate-700"
        >
          <div class="p-8">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              :class="
                isDestructive
                  ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              "
            >
              <Icon
                :name="
                  isDestructive
                    ? 'material-symbols:warning-rounded'
                    : 'material-symbols:help-outline-rounded'
                "
                class="text-3xl"
              />
            </div>

            <h3
              class="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight"
            >
              {{ title }}
            </h3>
            <p
              class="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-mono leading-relaxed"
            >
              {{ message }}
            </p>
          </div>

          <div
            class="flex items-center border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          >
            <button
              @click="respond(false)"
              class="flex-1 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-r border-slate-100 dark:border-slate-700 outline-none"
            >
              {{ cancelText }}
            </button>
            <button
              @click="respond(true)"
              class="flex-1 py-4 text-sm font-semibold transition-colors outline-none"
              :class="
                isDestructive
                  ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
              "
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { useConfirm } from "~/composables/useConfirm";

// The component just reads the state and fires the respond() function
const {
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive,
  respond,
} = useConfirm();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
