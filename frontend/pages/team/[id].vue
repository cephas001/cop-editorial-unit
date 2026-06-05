<template>
  <div
    v-if="isLoading"
    v-motion-fade
    class="flex flex-col items-center justify-center flex-1 min-h-[400px] w-full"
  >
    <VineyardLoader size="120px" />
    <span class="mt-6 text-sm font-mono text-indigo-500/70 animate-pulse">
      Loading profile...
    </span>
  </div>

  <div v-else-if="profile" class="pb-24 font-sans min-h-screen">
    <header class="relative mb-12">
      <div
        class="h-48 md:h-64 bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 opacity-90 relative overflow-hidden rounded-t-lg"
      >
        <div class="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <button
          @click="router.back()"
          class="absolute -top-32 left-6 lg:left-8 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <Icon name="material-symbols:arrow-back-rounded" /> Back to Team
        </button>

        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 250,
              damping: 25,
              duration: 500,
            },
          }"
          class="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 relative z-10 text-center md:text-left"
        >
          <div
            class="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden shadow-md bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-4xl font-bold text-slate-400"
          >
            <img
              v-if="profile.avatarUrl"
              :src="profile.avatarUrl"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ profile.fullName.charAt(0) }}</span>
          </div>

          <div class="flex-1 pb-2">
            <h1
              class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2"
            >
              {{ profile.fullName }}
            </h1>
            <div
              class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-slate-600 dark:text-slate-400"
            >
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium border border-indigo-100 dark:border-indigo-500/20"
              >
                <Icon
                  name="material-symbols:workspace-premium-rounded"
                  class="text-sm md:text-base"
                />
                {{ profile.role === "ADMIN" ? "Unit Head" : "Writer" }}
              </span>
              <span class="flex items-center gap-1.5">
                <Icon
                  name="material-symbols:calendar-month-rounded"
                  class="text-md"
                />
                Member since
                {{
                  new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 150, duration: 400 },
          }"
          class="lg:col-span-5 flex flex-col gap-8"
        >
          <section>
            <h2 class="sr-only">Biography</h2>
            <div
              class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-center md:text-left"
            >
              <span v-if="profile.bio" class="drop-cap">{{
                profile.bio.charAt(0)
              }}</span
              >{{
                profile.bio
                  ? profile.bio.slice(1)
                  : "This author hasn't added a biography yet."
              }}
            </div>
          </section>

          <section
            class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm"
          >
            <h2
              class="text-md md:text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <Icon
                name="material-symbols:info-rounded"
                class="text-indigo-500"
              />
              At a Glance
            </h2>
            <dl class="space-y-4 font-mono text-sm">
              <div
                class="border-b border-slate-200 dark:border-slate-700/50 pb-3"
              >
                <dt
                  class="text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold"
                >
                  Role
                </dt>
                <dd class="text-slate-900 dark:text-white font-medium">
                  {{
                    profile.role === "ADMIN"
                      ? "Editorial Unit Head"
                      : "Contributing Writer"
                  }}
                </dd>
              </div>
              <div
                class="border-b border-slate-200 dark:border-slate-700/50 pb-3"
              >
                <dt
                  class="text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold"
                >
                  Total Published
                </dt>
                <dd class="text-slate-900 dark:text-white font-medium">
                  {{ profile.articles?.length || 0 }} Articles
                </dd>
              </div>
              <div>
                <dt
                  class="text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider text-[10px] font-bold"
                >
                  Contact
                </dt>
                <dd class="text-slate-900 dark:text-white font-medium">
                  Internal Messaging
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 300, duration: 400 },
          }"
          class="lg:col-span-7 mt-5"
        >
          <section>
            <div
              class="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-2"
            >
              <h2
                class="text-md md:text-lg font-bold text-slate-900 dark:text-white"
              >
                Published Works
              </h2>
              <span
                class="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700"
              >
                {{ profile.articles?.length || 0 }} Articles
              </span>
            </div>

            <div
              v-if="!profile.articles || profile.articles.length === 0"
              class="text-center py-12 text-slate-500 font-mono text-sm"
            >
              This author hasn't published any articles yet.
            </div>

            <div v-else v-auto-animate class="flex flex-col gap-4">
              <article
                v-for="article in profile.articles"
                :key="article.id"
                class="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden cursor-pointer"
                @click="navigateToEditor(article.id)"
              >
                <div
                  class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"
                ></div>

                <time
                  class="text-xs font-mono text-slate-500 dark:text-slate-400 block mb-2"
                >
                  {{
                    new Date(article.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                </time>

                <h3
                  class="text-md font-bold text-slate-900 dark:text-white mb-2"
                >
                  <span class="inline-block relative">
                    {{ article.title }}
                    <span
                      class="block max-w-0 group-hover:max-w-full transition-all duration-300 h-[2px] bg-indigo-500 mt-0.5"
                    ></span>
                  </span>
                </h3>

                <div
                  class="flex justify-end items-center text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform mt-4"
                >
                  Read Article
                  <Icon
                    name="material-symbols:arrow-forward-rounded"
                    class="text-md ml-1"
                  />
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    v-motion-fade
    class="flex flex-col items-center justify-center py-24 min-h-screen text-center"
  >
    <Icon
      name="material-symbols:error-outline-rounded"
      class="text-6xl text-slate-300 dark:text-slate-600 mb-4"
    />
    <h2 class="text-xl font-bold text-slate-900 dark:text-white">
      Author not found
    </h2>
    <p class="text-slate-500 mt-2">
      The profile you are looking for does not exist.
    </p>
    <button @click="router.back()" class="mt-6 text-indigo-600 hover:underline">
      Go back
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppToast } from "~/composables/useAppToast";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const route = useRoute();
const router = useRouter();
const { error: toastError } = useAppToast();

const isLoading = ref(true);
const profile = ref(null);

onMounted(async () => {
  try {
    // Fetch external profile from the backend route we created
    profile.value = await useApiFetch(`/users/${route.params.id}/profile`);
  } catch (error) {
    toastError("Failed to load author profile.");
  } finally {
    isLoading.value = false;
  }
});

// Assuming you'll want to navigate to the article when clicked
const navigateToEditor = (articleId) => {
  router.push(`/editor/${articleId}`);
};
</script>

<style scoped>
@reference "tailwindcss";

.drop-cap::first-letter {
  float: left;
  font-size: 3.5rem;
  line-height: 3.5rem;
  padding-top: 0.1rem;
  padding-right: 0.5rem;
  font-weight: 700;
  color: #6366f1; /* Tailwind indigo-500 */
}
</style>
