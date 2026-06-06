<template>
  <div class="flex flex-col h-full font-sans max-w-7xl mx-auto space-y-6 pb-24">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div
        v-motion
        :initial="{ opacity: 0, y: -20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        class="md:col-span-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden text-center md:text-left"
      >
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"
        ></div>

        <div class="relative z-10 shrink-0">
          <div
            class="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-sm overflow-hidden flex items-center justify-center bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 relative group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            @click="handleAvatarClick"
          >
            <img
              v-if="avatarPreview || user?.avatarUrl"
              :src="avatarPreview || user?.avatarUrl"
              alt="Profile"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <span v-else class="text-4xl font-bold uppercase">
              {{ user?.fullName?.charAt(0) || "U" }}
            </span>
            <div
              class="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
            >
              <Icon
                name="material-symbols:photo-camera-rounded"
                class="text-white text-2xl"
              />
            </div>
            <div
              v-if="isUploading"
              class="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-30"
            >
              <Icon
                name="material-symbols:sync-rounded"
                class="text-primary-600 dark:text-primary-400 text-3xl animate-spin"
              />
            </div>
          </div>

          <button
            @click.stop="handleAvatarClick"
            class="absolute bottom-1 right-1 w-9 h-9 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 hover:scale-105 transition-all z-20"
            title="Change Profile Picture"
          >
            <Icon
              name="material-symbols:photo-camera-rounded"
              class="text-base"
            />
          </button>

          <input
            type="file"
            ref="fileInput"
            accept="image/jpeg, image/png, image/webp"
            class="hidden"
            @change="handleFileSelect"
          />
        </div>

        <div class="flex-1 z-10 w-full">
          <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2"
          >
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {{ user?.fullName || "Loading..." }}
              </h2>
              <div
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
              >
                <Icon
                  name="material-symbols:edit-note-rounded"
                  class="text-primary-600 dark:text-primary-400 text-base"
                />
                <span
                  class="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {{ user?.role === "ADMIN" ? "Unit Head" : "Writer" }}
                </span>
              </div>
            </div>
            <button
              @click="openEditProfile"
              class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs md:text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 bg-white dark:bg-slate-800 shadow-sm w-fit mx-auto"
            >
              <Icon
                name="material-symbols:edit-rounded"
                class="text-md md:text-lg"
              />
              Edit Profile
            </button>
          </div>

          <p
            class="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-4 leading-relaxed whitespace-pre-wrap"
          >
            {{ user?.bio || "No bio added yet." }}
          </p>

          <div
            class="flex items-center justify-center md:justify-start gap-6 mt-6"
          >
            <div class="text-center md:text-left">
              <span
                class="block text-lg md:text-xl font-bold text-slate-900 dark:text-white"
                >{{ totalWriteups }}</span
              >
              <span
                class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >Articles</span
              >
            </div>
            <div class="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            <div class="text-center md:text-left">
              <span
                class="block text-lg md:text-xl font-bold text-slate-900 dark:text-white"
                >{{ draftCount }}</span
              >
              <span
                class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >Drafts</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 150, duration: 400 } }"
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col flex-1"
    >
      <div
        class="flex border-b border-slate-200 dark:border-slate-700 px-4 pt-2 overflow-x-auto hide-scrollbar justify-around shrink-0"
      >
        <button
          @click="switchTab('writeups')"
          :class="[
            'px-4 py-3 text-xs md:text-sm font-semibold whitespace-nowrap transition-colors border-b-2',
            activeTab === 'writeups'
              ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent',
          ]"
        >
          My Writeups
        </button>
        <button
          @click="switchTab('comments')"
          :class="[
            'px-4 py-3 text-xs md:text-sm font-semibold whitespace-nowrap transition-colors border-b-2',
            activeTab === 'comments'
              ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent',
          ]"
        >
          My Comments
        </button>
        <button
          @click="switchTab('ideas')"
          :class="[
            'px-4 py-3 text-xs md:text-sm font-semibold whitespace-nowrap transition-colors border-b-2',
            activeTab === 'ideas'
              ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent',
          ]"
        >
          Saved Ideas
        </button>
      </div>

      <div v-auto-animate class="p-0 flex-1 flex flex-col min-h-[300px]">
        <div v-if="activeTab === 'writeups'" class="flex flex-col h-full">
          <div
            class="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:grid shrink-0"
          >
            <div class="col-span-7">Title</div>
            <div class="col-span-3">Date</div>
            <div class="col-span-2 text-right">Status</div>
          </div>
          <div
            v-auto-animate
            class="divide-y divide-slate-100 dark:divide-slate-700/50 flex-1 overflow-y-auto"
          >
            <div
              v-if="isLoadingData"
              class="p-8 text-center text-sm text-slate-500 flex justify-center"
            >
              <Icon
                name="material-symbols:sync-rounded"
                class="text-2xl animate-spin text-primary-500"
              />
            </div>
            <div
              v-else-if="articles.length === 0"
              class="p-8 text-center text-sm text-slate-500"
            >
              No writeups yet.
            </div>
            <div
              v-else
              v-for="article in articles"
              :key="article.id"
              @click="navigateToEditor(article.id)"
              class="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-6 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150 cursor-pointer group"
            >
              <div
                class="md:col-span-7 flex flex-col items-center text-center md:items-start md:text-left"
              >
                <span
                  class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1"
                >
                  {{ article.title || "Untitled Draft" }}
                </span>
              </div>
              <div
                class="md:col-span-3 text-xs font-mono text-slate-500 dark:text-slate-400 text-center md:text-left"
              >
                {{ formatTimeAgo(article.updatedAt) }}
              </div>
              <div
                class="md:col-span-2 flex justify-center md:justify-end mt-2 md:mt-0"
              >
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                    getStatusBadge(article.status),
                  ]"
                >
                  {{ article.status.replace("_", " ") }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'comments'" class="flex flex-col h-full">
          <div
            v-auto-animate
            class="divide-y divide-slate-100 dark:divide-slate-700/50 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          >
            <div v-if="isLoadingData" class="py-8 flex justify-center">
              <Icon
                name="material-symbols:sync-rounded"
                class="text-2xl animate-spin text-primary-500"
              />
            </div>
            <div
              v-else-if="comments.length === 0"
              class="py-8 text-center text-sm text-slate-500"
            >
              You haven't left any comments yet.
            </div>
            <div
              v-else
              v-for="comment in comments"
              :key="comment.id"
              @click="navigateToEditor(comment.articleId)"
              class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 transition-colors cursor-pointer group"
            >
              <p
                class="text-sm text-slate-700 dark:text-slate-300 mb-3 font-mono leading-relaxed"
              >
                "{{ comment.content }}"
              </p>
              <div
                class="flex items-center justify-between text-xs text-slate-500"
              >
                <div
                  class="flex items-center gap-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                >
                  <Icon
                    name="material-symbols:description-outline-rounded"
                    class="text-sm"
                  />
                  <span
                    class="font-semibold line-clamp-1 max-w-[200px] sm:max-w-xs"
                    >{{ comment.article?.title || "Unknown Article" }}</span
                  >
                </div>
                <span class="font-mono shrink-0">{{
                  formatTimeAgo(comment.createdAt)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'ideas'" class="flex flex-col h-full">
          <div
            v-auto-animate
            class="divide-y divide-slate-100 dark:divide-slate-700/50 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          >
            <div v-if="isLoadingData" class="py-8 flex justify-center">
              <Icon
                name="material-symbols:sync-rounded"
                class="text-2xl animate-spin text-primary-500"
              />
            </div>
            <div
              v-else-if="ideas.length === 0"
              class="py-8 text-center text-sm text-slate-500"
            >
              You haven't saved any brainstorming ideas yet.
            </div>
            <div
              v-else
              v-for="idea in ideas"
              :key="idea.id"
              @click="navigateToBrainstorming"
              class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 transition-colors cursor-pointer group"
            >
              <div class="flex justify-between items-start gap-4 mb-2">
                <span
                  :class="[
                    'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                    getTagColor(idea.tags[0]),
                  ]"
                >
                  {{ idea.tags[0] || "Idea" }}
                </span>
                <span class="text-xs font-mono text-slate-500">{{
                  formatTimeAgo(idea.createdAt)
                }}</span>
              </div>
              <p
                class="text-sm font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2 leading-snug"
              >
                {{ idea.content }}
              </p>
              <div
                class="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3"
              >
                <div class="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon
                    name="material-symbols:psychology-outline-rounded"
                    class="text-sm"
                  />
                  <span class="truncate max-w-[150px]">{{
                    idea.session?.title || "Unknown Session"
                  }}</span>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">{{
                  idea.status.replace("_", " ")
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isEditProfileOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      @click.self="isEditProfileOpen = false"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 },
        }"
        class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <div
          class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50"
        >
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            Edit Profile
          </h3>
          <button
            @click="isEditProfileOpen = false"
            class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>
        <form @submit.prevent="saveProfile" class="p-6 space-y-4">
          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >Full Name</label
            >
            <input
              v-model="editForm.fullName"
              type="text"
              required
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >Bio</label
            >
            <textarea
              v-model="editForm.bio"
              rows="4"
              placeholder="Tell the team a bit about yourself..."
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm text-slate-900 dark:text-white resize-none"
            ></textarea>
          </div>
          <div
            class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700"
          >
            <button
              type="button"
              @click="isEditProfileOpen = false"
              class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSavingProfile"
              class="px-4 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Icon
                v-if="isSavingProfile"
                name="material-symbols:sync-rounded"
                class="text-base animate-spin"
              />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isActionMenuOpen"
        v-motion-fade
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="isActionMenuOpen = false"
      >
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 25 },
          }"
          class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          <div
            class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50"
          >
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              Profile Picture
            </h3>
            <button
              @click="isActionMenuOpen = false"
              class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Icon name="material-symbols:close-rounded" class="text-xl" />
            </button>
          </div>
          <div class="p-4 space-y-2">
            <button
              class="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
              @click="openExpandedView"
            >
              <div
                class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
              >
                <Icon
                  name="material-symbols:visibility-rounded"
                  class="text-lg md:text-xl"
                />
              </div>
              <div>
                <p
                  class="text-xs md:text-sm font-semibold text-slate-900 dark:text-white"
                >
                  View Picture
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  See your photo in full size
                </p>
              </div>
            </button>
            <button
              class="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
              @click="triggerFileInput"
            >
              <div
                class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
              >
                <Icon
                  name="material-symbols:edit-rounded"
                  class="text-lg md:text-xl"
                />
              </div>
              <div>
                <p
                  class="text-xs md:text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Change Picture
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload a new photo
                </p>
              </div>
            </button>
            <button
              class="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left group"
              @click="handleRemoveAvatar"
            >
              <div
                class="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-200 dark:group-hover:bg-rose-900/50 transition-colors"
              >
                <Icon
                  name="material-symbols:delete-outline-rounded"
                  class="text-md md:text-xl"
                />
              </div>
              <div>
                <p
                  class="text-xs md:text-sm font-semibold text-rose-600 dark:text-rose-400"
                >
                  Remove Picture
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Delete your current photo
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <AvatarViewerModal
      :isOpen="isExpandedViewOpen"
      :imageUrl="avatarPreview || user?.avatarUrl"
      :fallbackInitials="user?.fullName?.charAt(0) || 'U'"
      @close="isExpandedViewOpen = false"
    />
    <AvatarCropperModal
      v-if="rawImageUrl"
      :isOpen="isCropperOpen"
      :imageUrl="rawImageUrl"
      @close="closeCropper"
      @crop="handleCroppedImage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useAppToast } from "~/composables/useAppToast";
import { useConfirm } from "~/composables/useConfirm";
import { useRouter } from "vue-router";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const authStore = useAuthStore();
const router = useRouter();
const user = computed(() => authStore.user);
const {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
} = useAppToast();
const confirm = useConfirm();

// State
const fileInput = ref(null);
const avatarPreview = ref(null);
const isUploading = ref(false);
const isActionMenuOpen = ref(false);
const isExpandedViewOpen = ref(false);
const isCropperOpen = ref(false);
const rawImageUrl = ref(null);

// Tab & Content State
const activeTab = ref("writeups");
const isLoadingData = ref(false);
const articles = ref([]);
const comments = ref([]);
const ideas = ref([]);

// Edit Profile State
const isEditProfileOpen = ref(false);
const isSavingProfile = ref(false);
const editForm = ref({ fullName: "", bio: "" });

const draftCount = computed(
  () => articles.value.filter((a) => a.status === "DRAFT").length,
);
const totalWriteups = computed(() => articles.value.length);

// Initial Load
onMounted(() => {
  fetchWriteups();
});

// Tab Navigation Logic
const switchTab = async (tab) => {
  activeTab.value = tab;
  if (tab === "writeups" && articles.value.length === 0) await fetchWriteups();
  if (tab === "comments" && comments.value.length === 0) await fetchComments();
  if (tab === "ideas" && ideas.value.length === 0) await fetchIdeas();
};

const fetchWriteups = async () => {
  isLoadingData.value = true;
  try {
    const data = await useApiFetch("/articles");
    articles.value = data.filter(
      (article) => article.authorId === user.value.id,
    );
  } catch (error) {
    toastError("Failed to load articles");
  } finally {
    isLoadingData.value = false;
  }
};

const fetchComments = async () => {
  isLoadingData.value = true;
  try {
    comments.value = await useApiFetch("/comments/user/me");
  } catch (error) {
    toastError("Failed to load comments");
  } finally {
    isLoadingData.value = false;
  }
};

const fetchIdeas = async () => {
  isLoadingData.value = true;
  try {
    ideas.value = await useApiFetch("/brainstorm/ideas/user/me");
  } catch (error) {
    toastError("Failed to load ideas");
  } finally {
    isLoadingData.value = false;
  }
};

// Profile Editing
const openEditProfile = () => {
  editForm.value = {
    fullName: user.value?.fullName || "",
    bio: user.value?.bio || "",
  };
  isEditProfileOpen.value = true;
};

const saveProfile = async () => {
  isSavingProfile.value = true;
  try {
    const updatedUser = await useApiFetch("/users/profile", {
      method: "PATCH",
      body: editForm.value,
    });
    // Update Pinia store globally
    authStore.user = updatedUser;
    toastSuccess("Profile updated successfully!");
    isEditProfileOpen.value = false;
  } catch (error) {
    toastError("Failed to update profile.");
  } finally {
    isSavingProfile.value = false;
  }
};

// Navigation Helpers
const navigateToEditor = (id) => router.push(`/editor/${id}`);
const navigateToBrainstorming = () => router.push(`/brainstorming`);

// UI Formatting Helpers
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const getStatusBadge = (status) => {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
    case "IN_REVIEW":
      return "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/30";
    default:
      return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600";
  }
};

const getTagColor = (tag) => {
  const colors = {
    Guide:
      "text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400",
    Editorial:
      "text-primary-700 bg-primary-100 dark:bg-primary-500/20 dark:text-primary-400",
    Interview:
      "text-amber-700 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400",
    Feature: "text-sky-700 bg-sky-100 dark:bg-sky-500/20 dark:text-sky-400",
    Urgent: "text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400",
  };
  return (
    colors[tag] ||
    "text-slate-700 bg-slate-100 dark:bg-slate-700 dark:text-slate-300"
  );
};

// Avatar Helpers
const handleAvatarClick = () => {
  if (!user.value?.avatarUrl && !avatarPreview.value) {
    triggerFileInput();
  } else {
    isActionMenuOpen.value = true;
  }
};
const triggerFileInput = () => {
  if (!isUploading.value) {
    isActionMenuOpen.value = false;
    fileInput.value.click();
  }
};
const openExpandedView = () => {
  isActionMenuOpen.value = false;
  isExpandedViewOpen.value = true;
};
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    toastError("Image too large. Please select a file under 5MB.");
    return;
  }
  rawImageUrl.value = URL.createObjectURL(file);
  isCropperOpen.value = true;
  if (fileInput.value) fileInput.value.value = "";
};
const closeCropper = () => {
  isCropperOpen.value = false;
  rawImageUrl.value = null;
};
const handleCroppedImage = async (blob) => {
  closeCropper();
  avatarPreview.value = URL.createObjectURL(blob);
  isUploading.value = true;
  const formData = new FormData();
  formData.append("avatar", blob, "avatar.jpg");
  try {
    const response = await useApiFetch("/users/profile/avatar", {
      method: "POST",
      body: formData,
    });
    authStore.user.avatarUrl = response.avatarUrl;
    toastSuccess("Profile picture updated!");
  } catch (error) {
    avatarPreview.value = null;
    toastError("Failed to upload image.");
  } finally {
    isUploading.value = false;
  }
};
const handleRemoveAvatar = async () => {
  isActionMenuOpen.value = false;
  if (!user.value?.avatarUrl && !avatarPreview.value) {
    toastInfo("You don't have a profile picture to remove.");
    return;
  }
  const isConfirmed = await confirm.ask({
    title: "Remove Profile Picture?",
    message: "Are you sure you want to remove your picture?",
    confirmText: "Remove",
    cancelText: "Cancel",
    isDestructive: true,
  });
  if (!isConfirmed) return;
  try {
    await useApiFetch("/users/profile/avatar", { method: "DELETE" });
    authStore.user.avatarUrl = null;
    avatarPreview.value = null;
    toastSuccess("Profile picture removed.");
  } catch (error) {
    toastError("Failed to remove profile picture.");
  }
};
</script>

<style scoped>
@reference "~/assets/css/main.css";
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
