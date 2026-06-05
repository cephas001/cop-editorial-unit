<template>
  <div class="max-w-5xl mx-auto font-sans pb-24 space-y-12">
    <section
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
      class="text-center pt-8 md:pt-12 pb-6 border-b border-slate-200 dark:border-slate-800"
    >
      <div
        class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 mb-6 shadow-sm border border-primary-100 dark:border-primary-500/20"
      >
        <Icon name="material-symbols:help-center-rounded" class="text-3xl" />
      </div>
      <h1
        class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4"
      >
        How can we help?
      </h1>
    </section>

    <section>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 100, duration: 400 },
          }"
          class="group block bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300 cursor-pointer"
        >
          <div
            class="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-100 dark:group-hover:bg-sky-500/20 transition-all duration-300"
          >
            <Icon
              name="material-symbols:edit-document-outline-rounded"
              class="text-xl md:text-2xl"
            />
          </div>
          <h3
            class="text-md md:text-lg font-bold text-slate-900 dark:text-white mb-2"
          >
            Writing & Drafts
          </h3>
          <p
            class="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3"
          >
            Learn how to format drafts, restore previous versions in the editor,
            and submit your work for review.
          </p>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 200, duration: 400 },
          }"
          class="group block bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-rose-300 dark:hover:border-rose-600 transition-all duration-300 cursor-pointer"
        >
          <div
            class="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-all duration-300"
          >
            <Icon
              name="material-symbols:assignment-outline-rounded"
              class="text-xl md:text-2xl"
            />
          </div>
          <h3
            class="text-md md:text-lg font-bold text-slate-900 dark:text-white mb-2"
          >
            Task Management
          </h3>
          <p
            class="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3"
          >
            Understand how deadlines work, check off completed assignments, and
            navigate the Team Calendar.
          </p>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 300, duration: 400 },
          }"
          class="group block bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-300 cursor-pointer"
        >
          <div
            class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-all duration-300"
          >
            <Icon
              name="material-symbols:psychology-outline-rounded"
              class="text-xl md:text-2xl"
            />
          </div>
          <h3
            class="text-md md:text-lg font-bold text-slate-900 dark:text-white mb-2"
          >
            Brainstorming
          </h3>
          <p
            class="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3"
          >
            Pitch new article ideas, use the Kanban board, and collaborate in
            real-time discussion threads.
          </p>
        </div>
      </div>
    </section>

    <section
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 400 } }"
      class="max-w-3xl mx-auto"
    >
      <h2
        class="text-md font-bold text-slate-900 dark:text-white mb-8 text-center"
      >
        Frequently Asked Questions
      </h2>

      <div
        v-auto-animate
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-700/50"
      >
        <details
          v-for="(faq, index) in filteredFaqs"
          :key="index"
          class="group p-5 cursor-pointer bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <summary
            class="flex justify-between items-center text-sm md:text-base text-black dark:text-white list-none focus:outline-none"
          >
            {{ faq.question }}
            <Icon
              name="material-symbols:expand-more-rounded"
              class="text-xl text-slate-400 transition-transform duration-300 group-open:rotate-180 group-open:text-primary-600 dark:group-open:text-primary-400 shrink-0 ml-4"
            />
          </summary>
          <div
            class="mt-5 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-8"
          >
            {{ faq.answer }}
          </div>
        </details>

        <div
          v-if="filteredFaqs.length === 0"
          class="p-8 text-center text-slate-500"
        >
          No FAQs matched your search.
        </div>
      </div>
    </section>

    <section
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 400 } }"
      class="max-w-3xl mx-auto"
    >
      <div
        class="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary-100 dark:border-primary-500/20 shadow-sm"
      >
        <div class="text-center md:text-left">
          <h3
            class="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2"
          >
            Still need help?
          </h3>
          <p
            class="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-md"
          >
            Our editorial support team is available. Reach out directly to a
            Unit Head.
          </p>
        </div>
        <button
          class="shrink-0 bg-primary-600 text-white hover:bg-primary-700 rounded-lg px-6 py-3 font-mono text-xs md:text-sm flex items-center gap-2 transition-colors shadow-sm active:scale-95"
          @click="sendAdminMail"
        >
          <Icon
            name="material-symbols:mail-rounded"
            class="text-md md:text-lg"
          />
          Contact Admin
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const searchQuery = ref("");

const faqs = ref([
  {
    question: "Who can see my drafts?",
    answer:
      "While an article is in the 'DRAFT' status, it is entirely private to you. No one else can view its content. It only becomes visible to the team when you submit it for review (changing its status to 'IN REVIEW').",
  },
  {
    question: "How do I pitch a new article idea?",
    answer:
      "Navigate to the Brainstorming page from the sidebar. You can click 'New Idea' to create a digital sticky note. From there, the team can discuss the viability of the topic, and Admins can drag it across the board until it is officially assigned.",
  },
  {
    question: "Can I assign a task to someone else?",
    answer:
      "No. Currently, only users with the 'ADMIN' role (Unit Heads) have the permission to assign tasks and dictate deadlines on the Team Calendar. If you need help with a piece, please leave a comment tagging your Admin.",
  },
  {
    question: "How do I resolve comments on my draft?",
    answer:
      "When an Admin leaves a piece of feedback on your draft, you will receive a notification. Once you have made the necessary edits to the text, click the small checkmark icon next to the comment to mark it as 'Resolved'.",
  },
]);

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs.value;
  const q = searchQuery.value.toLowerCase();
  return faqs.value.filter(
    (faq) =>
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q),
  );
});

const sendAdminMail = () => {
  window.location.href = "mailto:okodughapeter58@gmail.com";
};
</script>

<style scoped>
@reference "~/assets/css/main.css";

/* Details/Summary cleanup to remove native HTML triangles */
details > summary::-webkit-details-marker {
  display: none;
}
</style>
