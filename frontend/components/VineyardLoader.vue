<template>
  <div class="loader-wrapper" :style="{ width: size, height: size }">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width="100%"
      height="100%"
    >
      <defs>
        <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--primary-400)" />
          <stop offset="50%" stop-color="var(--primary-500)" />
          <stop offset="100%" stop-color="var(--primary-700)" />
        </linearGradient>
      </defs>

      <path
        d="M 16 60 A 44 44 0 0 0 104 60"
        fill="none"
        stroke="var(--primary-500)"
        stroke-opacity="0.15"
        stroke-width="5"
        stroke-linecap="round"
      />

      <path
        d="M 16 60 A 44 44 0 0 0 104 60"
        fill="none"
        stroke="url(#primaryGrad)"
        stroke-width="5"
        stroke-linecap="round"
        class="bottom-arc-anim"
      />

      <g class="mic-group">
        <path
          d="M 55 72 L 65 72 L 70 82 Q 70 84 68 84 L 52 84 Q 50 84 50 82 Z"
          fill="url(#primaryGrad)"
        />
        <line
          x1="60"
          y1="58"
          x2="60"
          y2="72"
          stroke="url(#primaryGrad)"
          stroke-width="4"
        />
        <rect
          x="56"
          y="56"
          width="8"
          height="3"
          rx="1.5"
          fill="url(#primaryGrad)"
        />
        <rect
          x="55"
          y="70"
          width="10"
          height="3"
          rx="1.5"
          fill="url(#primaryGrad)"
        />

        <rect
          x="50"
          y="32"
          width="20"
          height="26"
          rx="10"
          fill="none"
          stroke="url(#primaryGrad)"
          stroke-width="3"
        />
        <rect
          x="55"
          y="37"
          width="10"
          height="16"
          rx="5"
          fill="url(#primaryGrad)"
          opacity="0.9"
        />
      </g>
    </svg>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: "120px",
  },
});
</script>

<style scoped>
.loader-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

/* Bottom Arc Sweep Animation */
.bottom-arc-anim {
  stroke-dasharray: 139; /* Approx PI * r (44) */
  animation: sweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

/* Microphone subtle hover bounce */
.mic-group {
  transform-origin: 60px 85px;
  animation: micBounce 3s ease-in-out infinite;
}

/* Keyframes */
@keyframes sweep {
  0% {
    stroke-dashoffset: 139;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes micBounce {
  0%,
  100% {
    transform: scaleY(1) translateY(0);
  }
  50% {
    transform: scaleY(1.02) translateY(-1.5px);
  }
}
</style>
