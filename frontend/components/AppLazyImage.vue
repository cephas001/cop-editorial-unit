<template>
  <div
    class="relative overflow-hidden bg-slate-200 dark:bg-slate-800"
    :class="[isLoading ? 'animate-pulse' : '']"
  >
    <img
      :src="src"
      :alt="alt"
      @load="isLoading = false"
      @error="handleError"
      loading="lazy"
      class="w-full h-full object-cover transition-opacity duration-500"
      :class="[isLoading ? 'opacity-0' : 'opacity-100']"
    />
    <div
      v-if="hasError"
      class="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400"
    >
      <Icon
        name="material-symbols:broken-image-outline-rounded"
        class="text-3xl"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: "Image" },
});

const isLoading = ref(true);
const hasError = ref(false);

watch(
  () => props.src,
  () => {
    isLoading.value = true;
    hasError.value = false;
  },
);

const handleError = () => {
  isLoading.value = false;
  hasError.value = true;
};
</script>
