<template>
  <button
    :class="[
      'px-4 py-2 rounded-full text-xs md:text-sm font-mono whitespace-nowrap transition-colors',
      activeTab.toLowerCase() === tab.toLowerCase()
        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border-primary-100 dark:border-primary-500/20'
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
