<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in"
      @click.self="$emit('close')"
    >
      <div class="relative animate-zoom-in flex flex-col items-center gap-4">
        <div
          class="w-72 h-72 sm:w-96 sm:h-96 rounded-full border-4 border-slate-700 shadow-2xl bg-slate-800 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Expanded Profile"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-6xl font-bold text-slate-500 uppercase">
            {{ fallbackInitials }}
          </span>
        </div>

        <button
          @click="$emit('close')"
          class="absolute -top-14 sm:top-0 right-0 sm:-right-14 p-2.5 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors z-50 backdrop-blur-md flex items-center justify-center border border-white/10"
        >
          <Icon name="material-symbols:close-rounded" class="text-xl" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  imageUrl: { type: String, default: null },
  fallbackInitials: { type: String, default: "" },
});

defineEmits(["close"]);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.animate-zoom-in {
  animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
