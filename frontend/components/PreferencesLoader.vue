<template>
  <div
    class="loader-wrapper text-slate-400 dark:text-slate-500"
    :style="{ width: size, height: size }"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width="100%"
      height="100%"
    >
      <circle
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke="currentColor"
        stroke-opacity="0.15"
        stroke-width="3"
      />

      <circle
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        class="spinning-arc"
      />

      <g
        class="mic-pulse"
        stroke="currentColor"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="52" y="38" width="16" height="24" rx="8" />
        <path d="M 42 50 v 4 a 18 18 0 0 0 36 0 v -4" />
        <line x1="60" y1="72" x2="60" y2="82" />
        <line x1="52" y1="82" x2="68" y2="82" />
      </g>
    </svg>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: "64px",
  },
});
</script>

<style scoped>
.loader-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

/* Linear spin is the "smoothest" spin because there is no acceleration stutter */
.spinning-arc {
  stroke-dasharray: 276;
  stroke-dashoffset: 200;
  transform-origin: 60px 60px;
  animation: spin 1.5s linear infinite;
}

/* Slightly slower pulse with ease-in-out for a more organic feel */
.mic-pulse {
  transform-origin: 60px 60px;
  animation: pulse 2.5s ease-in-out infinite alternate;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
