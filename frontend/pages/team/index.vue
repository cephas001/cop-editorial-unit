<template>
  <div class="max-w-7xl mx-auto font-sans pb-24 space-y-12">
    <div
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
    >
      <div>
        <h1
          class="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight"
        >
          Ohana means Family
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Meet the Beautiful Voices Behind the Stories
        </p>
      </div>
      <button
        @click="isKudosModalOpen = true"
        class="px-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs md:text-sm font-mono transition-colors shadow-sm flex items-center gap-2"
      >
        <Icon name="material-symbols:add-rounded" class="text-lg md:text-xl" />
        Give a Shoutout
      </button>
    </div>

    <div
      v-if="isLoading"
      v-motion-fade
      class="flex flex-col items-center justify-center flex-1 min-h-[400px] w-full"
    >
      <VineyardLoader size="120px" />
      <span class="mt-6 text-sm font-mono text-indigo-500/70 animate-pulse">
        Fetching roster...
      </span>
    </div>

    <template v-else>
      <section
        v-if="spotlightUser"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 400 } }"
        class="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 md:p-10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
      >
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-indigo-200 dark:bg-indigo-800 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"
        ></div>

        <div class="flex-shrink-0 relative z-10">
          <div
            class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-3xl font-bold text-slate-500"
          >
            <img
              v-if="spotlightUser.avatarUrl"
              :src="spotlightUser.avatarUrl"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ spotlightUser.fullName.charAt(0) }}</span>
          </div>
          <div
            class="absolute -bottom-2 -right-2 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm border-2 border-white dark:border-slate-800 flex items-center gap-1"
          >
            <Icon name="material-symbols:star-rounded" class="text-sm" />
            Spotlight
          </div>
        </div>

        <div class="flex-1 text-center md:text-left relative z-10">
          <h2
            class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1"
          >
            {{ spotlightUser.fullName }}
          </h2>
          <p
            class="font-mono text-sm text-indigo-600 dark:text-indigo-400 mb-4"
          >
            {{ spotlightUser.role === "ADMIN" ? "Unit Head" : "Writer" }}
          </p>
          <blockquote
            class="text-sm md:text-md text-slate-600 dark:text-slate-300 italic mb-6 border-l-4 border-indigo-500 pl-4 text-left line-clamp-3"
          >
            "{{
              spotlightUser.bio ||
              "Dedicated to bringing you the stories that matter most."
            }}"
          </blockquote>
          <button
            @click="navigateToProfile(spotlightUser.id)"
            class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-xs md:text-sm font-mono hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            View Full Profile
            <Icon
              name="material-symbols:arrow-forward-rounded"
              class="text-md md:text-lg"
            />
          </button>
        </div>
      </section>

      <section>
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 200, duration: 400 },
          }"
          class="flex justify-between items-end mb-6 border-b border-slate-200 dark:border-slate-700 pb-4"
        >
          <div
            class="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/50"
          >
            <button
              @click="filter = 'ALL'"
              :class="[
                'px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200',
                filter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/5'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              ]"
            >
              All
            </button>
            <button
              @click="filter = 'WRITER'"
              :class="[
                'px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200',
                filter === 'WRITER'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/5'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              ]"
            >
              Writers
            </button>
            <button
              @click="filter = 'ADMIN'"
              :class="[
                'px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200',
                filter === 'ADMIN'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/5'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              ]"
            >
              Unit Heads
            </button>
          </div>
        </div>

        <div
          v-auto-animate
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="member in filteredRoster"
            :key="member.id"
            @click="navigateToProfile(member.id)"
            class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 flex flex-col items-center text-center cursor-pointer group"
          >
            <div
              class="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-2xl font-bold text-slate-400"
            >
              <img
                v-if="member.avatarUrl"
                :src="member.avatarUrl"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ member.fullName.charAt(0) }}</span>
            </div>
            <h4
              class="text-md md:text-lg text-slate-900 dark:text-white font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
            >
              {{ member.fullName }}
            </h4>
            <span
              :class="[
                'font-mono text-xs mb-3 px-2 py-1 rounded',
                member.role === 'ADMIN'
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
              ]"
            >
              {{ member.role === "ADMIN" ? "Unit Head" : "Writer" }}
            </span>
            <p
              class="text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-2"
            >
              {{ member.bio || "A valued member of the Editorial Unit." }}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 300, duration: 400 },
          }"
          class="flex items-center justify-between mb-6 mt-6"
        >
          <div class="flex items-center gap-2">
            <h3
              class="text-md md:text-lg font-bold text-slate-900 dark:text-white font-mono"
            >
              Kudos Wall
            </h3>
          </div>
          <button
            @click="isKudosModalOpen = true"
            class="text-xs md:text-sm font-mono text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
          >
            <Icon
              name="material-symbols:add-rounded"
              class="text-md md:text-lg"
            />
            Post a Kudo
          </button>
        </div>

        <div
          v-if="kudos.length === 0"
          v-motion-fade
          class="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed"
        >
          <p class="text-slate-500 px-2">
            The wall is empty! Be the first to spread some love.
          </p>
        </div>

        <div
          v-else
          v-auto-animate
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max"
        >
          <div
            v-for="(kudo, index) in kudos"
            :key="kudo.id"
            :class="[
              'p-5 rounded-xl shadow-sm border transition-transform duration-200 relative group cursor-default',
              kudo.color,
              index % 2 === 0
                ? 'transform -rotate-1 hover:rotate-0'
                : 'transform rotate-1 hover:rotate-0',
              index % 3 === 0 ? 'mt-0' : 'mt-2',
            ]"
          >
            <Icon
              name="material-symbols:format-quote-rounded"
              class="absolute top-2 right-2 text-3xl opacity-20"
            />
            <p
              class="text-xs md:text-sm font-mono mb-4 relative z-10 pt-2 leading-relaxed"
            >
              "{{ kudo.content }}"
            </p>
            <div class="flex items-center gap-2 border-t border-black/10 pt-3">
              <img
                v-if="kudo.author?.avatarUrl"
                :src="kudo.author.avatarUrl"
                class="w-5 h-5 rounded-full object-cover"
              />
              <Icon
                v-else
                name="material-symbols:person-rounded"
                class="text-sm"
              />
              <span class="text-[9px] font-bold uppercase tracking-wider"
                >From {{ kudo.author?.fullName.split(" ")[0] }}</span
              >
            </div>
          </div>
        </div>
      </section>
    </template>

    <div
      v-if="isKudosModalOpen"
      v-motion-fade
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      @click.self="isKudosModalOpen = false"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 },
        }"
        class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center"
        >
          <h3
            class="font-bold text-slate-900 dark:text-white flex items-center gap-2"
          >
            Leave a Kudo
          </h3>
          <button
            @click="isKudosModalOpen = false"
            class="text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <form @submit.prevent="submitKudo" class="p-6 space-y-4">
          <textarea
            v-model="newKudo"
            rows="3"
            placeholder="Thank someone, celebrate a win, or just share some good vibes..."
            required
            class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs md:text-sm text-black dark:text-white resize-none"
          ></textarea>

          <div>
            <label
              class="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider"
              >Pick a Sticky Note Color</label
            >
            <div class="flex gap-3">
              <button
                type="button"
                @click="
                  selectedColor =
                    'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-700'
                "
                :class="[
                  'w-8 h-8 rounded-full bg-amber-200 border-2 transition-transform',
                  selectedColor.includes('amber')
                    ? 'border-slate-900 dark:border-white scale-110'
                    : 'border-transparent',
                ]"
              ></button>
              <button
                type="button"
                @click="
                  selectedColor =
                    'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-900/30 dark:text-rose-100 dark:border-rose-700'
                "
                :class="[
                  'w-8 h-8 rounded-full bg-rose-200 border-2 transition-transform',
                  selectedColor.includes('rose')
                    ? 'border-slate-900 dark:border-white scale-110'
                    : 'border-transparent',
                ]"
              ></button>
              <button
                type="button"
                @click="
                  selectedColor =
                    'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-900/30 dark:text-sky-100 dark:border-sky-700'
                "
                :class="[
                  'w-8 h-8 rounded-full bg-sky-200 border-2 transition-transform',
                  selectedColor.includes('sky')
                    ? 'border-slate-900 dark:border-white scale-110'
                    : 'border-transparent',
                ]"
              ></button>
              <button
                type="button"
                @click="
                  selectedColor =
                    'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-700'
                "
                :class="[
                  'w-8 h-8 rounded-full bg-emerald-200 border-2 transition-transform',
                  selectedColor.includes('emerald')
                    ? 'border-slate-900 dark:border-white scale-110'
                    : 'border-transparent',
                ]"
              ></button>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button
              type="submit"
              :disabled="!newKudo.trim() || isSubmitting"
              class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-xs md:text-sm font-mono hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Icon
                v-if="isSubmitting"
                name="material-symbols:sync-rounded"
                class="animate-spin"
              />
              Post to Wall
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppToast } from "~/composables/useAppToast";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const router = useRouter();
const { success: toastSuccess, error: toastError } = useAppToast();

// State
const isLoading = ref(true);
const users = ref([]);
const kudos = ref([]);
const filter = ref("ALL");

// Modal State
const isKudosModalOpen = ref(false);
const isSubmitting = ref(false);
const newKudo = ref("");
const selectedColor = ref(
  "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-700",
);

// Computed
const spotlightUser = computed(() => {
  if (!users.value.length) return null;

  // 1. Sort users predictably (crucial so the order is identical for everyone)
  const sortedUsers = [...users.value].sort((a, b) => a.id.localeCompare(b.id));

  // 2. Calculate the current week number of the year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const currentWeek = Math.floor(diff / oneWeek);

  // 3. Use modulo to pick the user for this week
  const spotlightIndex = currentWeek % sortedUsers.length;

  return sortedUsers[spotlightIndex];
});

const filteredRoster = computed(() => {
  if (filter.value === "ALL") return users.value;
  return users.value.filter((u) => u.role === filter.value);
});

// Actions
const loadData = async () => {
  isLoading.value = true;
  try {
    const [usersData, kudosData] = await Promise.all([
      useApiFetch("/users"),
      useApiFetch("/kudos"),
    ]);
    users.value = usersData;
    kudos.value = kudosData;
  } catch (error) {
    toastError("Failed to load Team Wall");
  } finally {
    isLoading.value = false;
  }
};

const submitKudo = async () => {
  if (!newKudo.value.trim() || isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const addedKudo = await useApiFetch("/kudos", {
      method: "POST",
      body: { content: newKudo.value, color: selectedColor.value },
    });

    kudos.value.unshift(addedKudo);
    isKudosModalOpen.value = false;
    newKudo.value = "";
    toastSuccess("Kudo posted to the wall!");
  } catch (error) {
    toastError("Failed to post kudo.");
  } finally {
    isSubmitting.value = false;
  }
};

const navigateToProfile = (id) => {
  router.push(`/team/${id}`);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
@reference "tailwindcss";
</style>
