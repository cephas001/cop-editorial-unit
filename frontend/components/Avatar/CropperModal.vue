<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-zoom-in flex flex-col"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50"
        >
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            Crop Picture
          </h3>
          <button
            @click="$emit('close')"
            class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <div class="w-full h-80 bg-slate-900 relative">
          <cropper
            ref="cropperRef"
            class="w-full h-full"
            :src="imageUrl"
            :stencil-component="CircleStencil"
            :stencil-props="{ aspectRatio: 1 }"
            image-restriction="stencil"
          />
        </div>

        <div
          class="p-5 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center"
        >
          <p
            class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest hidden sm:block"
          >
            Pinch to zoom / Drag to move
          </p>
          <div class="flex gap-3 w-full sm:w-auto justify-end">
            <button
              @click="$emit('close')"
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleCrop"
              class="px-6 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from "vue";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  imageUrl: { type: String, required: true },
});

const emit = defineEmits(["close", "crop"]);
const cropperRef = ref(null);

const handleCrop = () => {
  if (cropperRef.value) {
    const { canvas } = cropperRef.value.getResult();
    if (canvas) {
      canvas.toBlob((blob) => emit("crop", blob), "image/jpeg", 0.9);
    }
  }
};
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
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
