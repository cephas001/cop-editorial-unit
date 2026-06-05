<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-colors duration-200 relative group dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
    :class="
      route.fullPath == to &&
      'bg-primary-50 text-primary-700 dark:text-primary-300 dark:bg-primary-500/10'
    "
    @click="$emit('click')"
  >
    <div
      class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-600 dark:bg-primary-400 rounded-r-full"
      v-if="route.fullPath == to"
    ></div>
    <Icon :name="iconName" class="text-xl" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup>
const route = useRoute();
const emit = defineEmits(["click"]);
const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

const iconName = computed(() => {
  if (route.fullPath === props.to && props.icon.includes("outline")) {
    return props.icon.replace("-outline-rounded", "-rounded");
  }
  return props.icon;
});
</script>
