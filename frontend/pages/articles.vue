<template>
  <div class="flex flex-col min-h-[110vh] font-sans">
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
          Directory
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage, review, and explore all team writeups.
        </p>
      </div>
      <NuxtLink
        to="/editor/new"
        class="px-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-mono transition-colors shadow-sm flex items-center gap-2"
      >
        <Icon name="material-symbols:add-rounded" class="text-lg" />
        New Draft
      </NuxtLink>
    </div>

    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 150, duration: 400 } }"
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4"
    >
      <div
        class="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto hide-scrollbar"
      >
        <DirectoryScrollTabButton
          label="All Articles"
          tab="All"
          :activeTab="activeTab"
          @update:activeTab="activeTab = $event"
        />
        <DirectoryScrollTabButton
          label="Drafts"
          tab="Drafts"
          :activeTab="activeTab"
          @update:activeTab="activeTab = $event"
        />
        <DirectoryScrollTabButton
          label="Published"
          tab="Published"
          :activeTab="activeTab"
          @update:activeTab="activeTab = $event"
        />
        <DirectoryScrollTabButton
          label="My Writeups"
          tab="My Writeups"
          :activeTab="activeTab"
          @update:activeTab="activeTab = $event"
        />
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span
          class="text-xs md:text-sm font-mono text-slate-500 dark:text-slate-400"
          >Sort by:</span
        >
        <select
          class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs md:text-sm font-mono text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors cursor-pointer"
          v-model="sortOrder"
        >
          <option>Newest First</option>
          <option>Oldest First</option>
        </select>
      </div>
    </div>

    <div
      v-if="!isLoading"
      v-auto-animate="{ duration: 300 }"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
    >
      <NuxtLink
        v-for="article in filteredArticles"
        :key="article.id"
        :to="`/editor/${article.id}`"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group flex flex-col h-full cursor-pointer"
        v-if="filteredArticles.length > 0"
      >
        <div
          class="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0"
        >
          <AppLazyImage
            v-if="article.thumbnailUrl"
            :src="article.thumbnailUrl"
            class="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />

          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-500/50 group-hover:scale-105 transition-transform duration-500"
          >
            <Icon
              name="material-symbols:edit-document-outline-rounded"
              class="text-6xl"
            />
          </div>

          <div
            :class="[
              'absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border backdrop-blur-sm',
              article.status === 'PUBLISHED'
                ? 'bg-emerald-100/90 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                : 'bg-amber-100/90 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
            ]"
          >
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full',
                article.status === 'PUBLISHED'
                  ? 'bg-emerald-500'
                  : 'bg-amber-500',
              ]"
            ></span>
            {{ getArticleStatus(article.status) }}
          </div>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <h3
            class="text-md md:text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors"
          >
            {{ article.title }}
          </h3>

          <div
            class="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold"
              >
                <img
                  :src="article.author?.avatarUrl"
                  alt="Author Avatar"
                  class="w-full h-full rounded-full"
                  v-if="article.author?.avatarUrl"
                />
                <span v-else>{{
                  article.author?.fullName?.charAt(0) || "U"
                }}</span>
              </div>
              <span
                class="text-[12px] md:text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                {{ article.author?.fullName || "Unknown Author" }}
              </span>
            </div>
            <span class="text-[11px] font-medium text-slate-400">
              {{ new Date(article.updatedAt).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </NuxtLink>

      <div
        v-else
        class="col-span-full text-center pt-10 font-serif text-slate-500 dark:text-slate-400"
      >
        There are no articles to display
      </div>
    </div>

    <div
      v-else
      v-motion-fade
      class="flex flex-col items-center justify-center flex-1 min-h-[400px] w-full"
    >
      <VineyardLoader size="120px" />
      <span class="mt-6 text-sm font-mono text-indigo-500/70 animate-pulse">
        Fetching the vineyard...
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const activeTab = ref("All");
const articles = ref([]);
const isLoading = ref(true);
const sortOrder = ref("Newest First");
const { error: toastError } = useAppToast();

const filteredArticles = computed(() => {
  let result = [];

  switch (activeTab.value) {
    case "Drafts":
      result = articles.value.filter((article) => article.status === "DRAFT");
      break;
    case "Published":
      result = articles.value.filter(
        (article) => article.status === "PUBLISHED",
      );
      break;
    case "My Writeups":
      result = articles.value.filter(
        (article) => article.authorId === user?.value.id,
      );
      break;
    case "All":
    default:
      result = articles.value;
      break;
  }

  // Apply sorting
  return result.slice().sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);

    if (sortOrder.value === "Newest First") {
      return dateB - dateA; // descending
    } else {
      return dateA - dateB; // ascending
    }
  });
});

const getArticleStatus = (status) => {
  return status === "IN_REVIEW" ? "IN REVIEW" : status;
};

onMounted(async () => {
  try {
    // Fetch all articles from our new backend route
    articles.value = await useApiFetch("/articles");
  } catch (err) {
    toastError("Failed to load articles", "Network Error");
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
