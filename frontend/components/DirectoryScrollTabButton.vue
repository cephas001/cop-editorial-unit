<template>
  <button
    :class="[
      'px-4 py-2 rounded-full text-sm font-mono whitespace-nowrap transition-colors',
      activeTab.toLowerCase() === tab.toLowerCase()
        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'
        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700',
    ]"
    @click="$emit('update:activeTab', tab)"
  >
    {{ label }}
  </button>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  activeTab: {
    type: String,
    default: "",
  },
  tab: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["update:activeTab"]);
</script>
