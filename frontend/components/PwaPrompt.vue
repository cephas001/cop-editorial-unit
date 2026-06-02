<template>
  <div
    v-if="$pwa?.needRefresh"
    class="fixed bottom-4 right-4 z-[100] flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-fade-in"
  >
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0"
      >
        <Icon name="material-symbols:system-update-rounded" class="text-xl" />
      </div>
      <div>
        <p class="text-sm font-bold text-slate-900 dark:text-white">
          Update Available
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          A new version of EdiFlow is ready.
        </p>
      </div>
    </div>

    <div
      class="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-slate-700"
    >
      <button
        @click="$pwa.cancelPrompt()"
        class="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        Dismiss
      </button>
      <button
        @click="$pwa.updateServiceWorker()"
        class="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
      >
        Reload
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
