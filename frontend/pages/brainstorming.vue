<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col font-sans relative">
    <!-- Header: Slides down smoothly on load -->
    <div
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
      class="flex flex-col md:flex-row items-start justify-between mb-6 gap-4"
    >
      <div class="w-full max-w-full flex-1">
        <div class="flex gap-1 md:gap-2 flex-col justify-start">
          <h1
            class="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight"
          >
            Brainstorming Board
          </h1>
          <select
            v-if="sessionsList.length > 0"
            v-model="currentSession"
            @change="fetchIdeasForSession"
            class="bg-slate-100 dark:bg-slate-800 border-none text-xs md:text-sm font-semibold text-primary-600 dark:text-primary-400 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-primary-600 cursor-pointer w-fit max-w-full truncate"
          >
            <option
              v-for="session in sessionsList"
              :key="session.id"
              :value="session"
            >
              {{ session.title }}
            </option>
          </select>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Propose, and discuss article ideas.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="createDefaultSession"
          class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          v-if="user?.role == 'ADMIN'"
        >
          <Icon
            name="material-symbols:add-box-outline-rounded"
            class="text-lg"
          />
          <span class="hidden sm:inline">New Board</span>
        </button>
        <button
          @click="isIdeaModalOpen = true"
          :disabled="!currentSession"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs md:text-sm font-mono transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Icon name="material-symbols:add-rounded" class="text-lg" />
          New Idea
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex-1 flex flex-col items-center justify-center w-full h-full min-h-[50vh]"
    >
      <VineyardLoader size="120px" />
      <span class="mt-6 text-sm font-mono text-primary-500/70 animate-pulse"
        >Loading board...</span
      >
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!currentSession"
      v-motion-fade
      class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl"
    >
      <Icon
        name="material-symbols:psychology-outline-rounded"
        class="text-4xl md:text-6xl text-slate-400 mb-4"
      />
      <h3
        class="text-md md:text-lg font-semibold text-slate-900 dark:text-white mb-2"
      >
        No Active Session
      </h3>
      <p
        class="text-slate-500 dark:text-slate-400 mb-4 text-xs md:text-sm text-center px-2"
      >
        <span v-if="user?.role !== 'ADMIN'">Wait for an admin to create</span>
        <span v-else>Create</span> a new brainstorm session to start
        collaborating.
      </p>
      <button
        @click="createDefaultSession"
        class="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs md:text-sm font-semibold transition-colors"
        v-if="user?.role == 'ADMIN'"
      >
        Start New Session
      </button>
    </div>

    <!-- Kanban Board -->
    <div
      v-else
      class="flex-1 overflow-x-auto overflow-y-hidden kanban-scrollbar pb-4 -mx-2 px-2 min-h-[100vh]"
    >
      <div class="flex items-start gap-6 h-full min-w-max">
        <!-- Columns: Staggered animation using the column index for the delay -->
        <div
          v-for="(column, index) in columns"
          :key="column.id"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: index * 100 + 100, duration: 400 },
          }"
          class="w-80 h-full flex flex-col bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50 shrink-0"
        >
          <div
            class="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50"
          >
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ column.title }}
              </h2>
              <span
                class="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2 py-0.5 rounded-full"
              >
                {{ column.cards.length }}
              </span>
            </div>
          </div>

          <div
            class="p-3 flex-1 overflow-y-auto kanban-scrollbar flex flex-col gap-3"
          >
            <!-- Added :animation="250" for smooth native drag reordering -->
            <draggable
              v-model="column.cards"
              group="ideas"
              item-key="id"
              handle=".drag-handle"
              class="min-h-[100px] h-full flex flex-col gap-3"
              ghost-class="opacity-50"
              drag-class="cursor-grabbing"
              :animation="250"
              @change="(event) => onDragChange(column.id, event)"
            >
              <template #item="{ element }">
                <div
                  class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors group relative flex flex-col"
                >
                  <div class="flex items-center justify-between mb-3">
                    <span
                      :class="[
                        'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                        getTagColor(element.tags[0]),
                      ]"
                    >
                      {{ element.tags[0] || "Idea" }}
                    </span>

                    <div
                      class="drag-handle cursor-grab active:cursor-grabbing p-1 -mr-2 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
                      v-if="user?.role === 'ADMIN'"
                    >
                      <Icon
                        name="material-symbols:drag-indicator"
                        class="text-xl"
                      />
                    </div>
                  </div>

                  <h3
                    @click="openIdeaDetails(element)"
                    class="text-xs md:text-sm font-mono text-slate-900 dark:text-white mb-3 md:mb-4 leading-snug line-clamp-4 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Click to view full idea"
                  >
                    {{ element.content }}
                  </h3>

                  <div
                    class="flex justify-between items-center mt-auto pt-2 border-t border-slate-50 dark:border-slate-700/30"
                  >
                    <div
                      class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"
                    >
                      <Icon
                        name="material-symbols:person-outline-rounded"
                        class="text-base"
                      />
                      <span class="text-xs font-mono truncate max-w-[100px]">{{
                        element.author?.fullName?.split(" ")[0]
                      }}</span>
                    </div>

                    <div class="flex -space-x-2">
                      <div
                        class="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 flex items-center justify-center text-[10px] font-bold z-10"
                      >
                        <img
                          v-if="element.author?.avatarUrl"
                          :src="element.author.avatarUrl"
                          class="w-full h-full rounded-full object-cover"
                        />
                        <span v-else>{{
                          element.author?.fullName?.charAt(0) || "U"
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="
                      element.status === 'ASSIGNED' && user?.role === 'ADMIN'
                    "
                    class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50"
                  >
                    <div
                      v-if="element.assignee"
                      class="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      Assigned to:
                      <span class="text-primary-600 dark:text-primary-400">{{
                        element.assignee.fullName
                      }}</span>
                    </div>

                    <button
                      v-else
                      @click.stop="openAssignTaskModal(element)"
                      class="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                    >
                      <Icon
                        name="material-symbols:assignment-add-outline-rounded"
                        class="text-sm"
                      />
                      Assign as Task
                    </button>
                  </div>

                  <div
                    class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 md:hidden"
                    v-if="user?.role === 'ADMIN'"
                  >
                    <select
                      :value="element.status"
                      @change="(e) => moveCardMobile(element, e.target.value)"
                      class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    >
                      <option value="IDEA">Move to: Ideas</option>
                      <option value="IN_DISCUSSION">
                        Move to: In Discussion
                      </option>
                      <option value="APPROVED">Move to: Approved</option>
                      <option value="ASSIGNED">Move to: Assigned</option>
                    </select>
                  </div>
                </div>
              </template>

              <template #footer v-if="column.cards.length === 0">
                <div
                  class="h-full min-h-[120px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500"
                >
                  <Icon
                    name="material-symbols:inbox-outline-rounded"
                    class="text-3xl mb-1"
                  />
                  <span class="text-xs font-mono">Drop ideas here</span>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->

    <!-- New Idea Modal -->
    <div
      v-if="isIdeaModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="isIdeaModalOpen = false"
    >
      <!-- Spring animation for the modal popup -->
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 },
        }"
        class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50"
        >
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            Propose New Idea
          </h3>
          <button
            @click="isIdeaModalOpen = false"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <form @submit.prevent="submitIdea" class="p-6 space-y-4">
          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >The Idea</label
            >
            <textarea
              v-model="newIdea.content"
              rows="4"
              placeholder="e.g., An interview piece focusing on..."
              required
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm text-slate-900 dark:text-white resize-none"
            ></textarea>
          </div>

          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >Category Tag</label
            >
            <select
              v-model="newIdea.tag"
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm text-slate-900 dark:text-white"
            >
              <option value="Editorial">Editorial</option>
              <option value="Interview">Interview</option>
              <option value="Feature">Feature</option>
              <option value="Guide">Guide</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div
            class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700"
          >
            <button
              type="button"
              @click="isIdeaModalOpen = false"
              class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Icon
                v-if="isSubmitting"
                name="material-symbols:sync-rounded"
                class="text-base animate-spin"
              />
              Add to Board
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View / Discuss Modal -->
    <div
      v-if="isViewModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="isViewModalOpen = false"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 },
        }"
        class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0"
        >
          <div class="flex items-center gap-3">
            <span
              :class="[
                'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                getTagColor(activeIdea?.tags[0]),
              ]"
            >
              {{ activeIdea?.tags[0] || "Idea" }}
            </span>
            <span
              class="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1"
            >
              <Icon
                name="material-symbols:calendar-today-rounded"
                class="text-sm"
              />
              {{ new Date(activeIdea?.createdAt).toLocaleDateString() }}
            </span>
          </div>
          <button
            @click="isViewModalOpen = false"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <div
          class="overflow-y-auto flex-1 p-6 kanban-scrollbar bg-slate-50/30 dark:bg-slate-900/20"
        >
          <div class="flex gap-4 mb-8">
            <div
              class="w-8 h-8 shrink-0 rounded-full border-2 border-white dark:border-slate-800 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-bold shadow-sm"
            >
              <img
                v-if="activeIdea?.author?.avatarUrl"
                :src="activeIdea.author.avatarUrl"
                class="w-full h-full rounded-full object-cover"
              />
              <span v-else>{{
                activeIdea?.author?.fullName?.charAt(0) || "U"
              }}</span>
            </div>
            <div
              class="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <p
                class="text-xs md:text-sm font-semibold text-slate-900 dark:text-white mb-1"
              >
                {{ activeIdea?.author?.fullName }}
              </p>
              <p
                class="text-xs md:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono"
              >
                {{ activeIdea?.content }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 mb-6">
            <div class="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
            <span
              class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
              >Discussion</span
            >
            <div class="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <div v-if="isLoadingComments" class="flex justify-center py-4">
            <Icon
              name="material-symbols:sync-rounded"
              class="text-2xl text-primary-500 animate-spin"
            />
          </div>

          <div
            v-else-if="ideaComments.length === 0"
            class="text-center py-8 opacity-60"
          >
            <Icon
              name="material-symbols:chat-bubble-outline-rounded"
              class="text-3xl md:text-4xl text-slate-400 mb-2"
            />
            <p
              class="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              No comments yet. Start the discussion!
            </p>
          </div>

          <!-- AutoAnimate applied to the comments list -->
          <div v-else v-auto-animate class="space-y-4">
            <div
              v-for="comment in ideaComments"
              :key="comment.id"
              class="flex gap-3 group relative"
            >
              <div
                class="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 mt-1"
              >
                <img
                  v-if="comment.author?.avatarUrl"
                  :src="comment.author.avatarUrl"
                  class="w-full h-full rounded-full object-cover"
                />
                <span v-else>{{
                  comment.author?.fullName?.charAt(0) || "U"
                }}</span>
              </div>
              <div class="flex-1">
                <div class="flex items-baseline justify-between gap-2 mb-0.5">
                  <div class="flex items-baseline gap-2">
                    <span
                      class="text-xs md:text-sm font-semibold text-slate-900 dark:text-white"
                      >{{ comment.author?.fullName }}</span
                    >
                    <span class="text-[10px] text-slate-400">{{
                      new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}</span>
                  </div>
                  <button
                    v-if="comment.authorId === user?.id"
                    @click="startEditing(comment)"
                    class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-600 transition-opacity p-1 flex items-center justify-center"
                    title="Edit Comment"
                  >
                    <Icon
                      name="material-symbols:edit-rounded"
                      class="text-xs"
                    />
                  </button>
                </div>

                <div v-if="editingCommentId !== comment.id">
                  <p
                    class="text-xs md:text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-100 dark:border-slate-700/50 shadow-sm inline-block whitespace-pre-wrap"
                  >
                    {{ comment.content }}
                  </p>
                </div>

                <div v-else class="max-w-sm">
                  <textarea
                    v-model="editCommentText"
                    rows="2"
                    class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary-600 resize-none text-slate-900 dark:text-white mb-2"
                  ></textarea>
                  <div class="flex justify-end gap-2">
                    <button
                      @click="cancelEditing"
                      class="px-2 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      @click="saveEdit(comment.id)"
                      :disabled="isSavingEdit"
                      class="px-3 py-1.5 text-[10px] font-medium bg-primary-600 text-white hover:bg-primary-700 rounded disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      <Icon
                        v-if="isSavingEdit"
                        name="material-symbols:sync-rounded"
                        class="animate-spin text-xs"
                      />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0"
        >
          <form
            @submit.prevent="submitIdeaComment"
            class="relative flex items-center gap-3"
          >
            <div
              class="w-8 h-8 shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold"
            >
              <img
                v-if="user?.avatarUrl"
                :src="user.avatarUrl"
                class="w-full h-full rounded-full object-cover"
              />
              <span v-else>{{ user?.fullName?.charAt(0) || "U" }}</span>
            </div>
            <div class="relative flex flex-1">
              <textarea
                v-model="newIdeaComment"
                rows="1"
                :disabled="isSubmittingComment"
                placeholder="Share your thoughts..."
                class="block w-full resize-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-2.5 pl-4 pr-12 text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all disabled:opacity-60"
              ></textarea>

              <button
                type="submit"
                :disabled="!newIdeaComment.trim() || isSubmittingComment"
                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:hover:bg-primary-600 flex items-center justify-center"
              >
                <Icon
                  v-if="isSubmittingComment"
                  name="material-symbols:sync-rounded"
                  class="text-sm animate-spin"
                />
                <Icon
                  v-else
                  name="material-symbols:arrow-upward-rounded"
                  class="text-base"
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Assign Task Modal -->
    <div
      v-if="isAssignTaskModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="isAssignTaskModalOpen = false"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 },
        }"
        class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50"
        >
          <h3
            class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <Icon
              name="material-symbols:assignment-add-outline-rounded"
              class="text-primary-600 dark:text-primary-400"
            />
            Assign Idea as Task
          </h3>
          <button
            @click="isAssignTaskModalOpen = false"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <form @submit.prevent="submitAssignedTask" class="p-6 space-y-4">
          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >Task Title</label
            >
            <input
              v-model="newTask.title"
              type="text"
              required
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
            />
          </div>

          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >Description</label
            >
            <textarea
              v-model="newTask.description"
              rows="3"
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors resize-none"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <div class="flex-1">
              <label
                class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
                >Priority</label
              >
              <select
                v-model="newTask.priority"
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-2 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm text-slate-900 dark:text-white transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div class="flex-1">
              <label
                class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
                >Due Date</label
              >
              <input
                type="date"
                v-model="newTask.dueDate"
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-2 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm text-slate-900 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2"
              >Assignee</label
            >
            <select
              v-if="user?.role === 'ADMIN'"
              v-model="newTask.assigneeId"
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm text-slate-900 dark:text-white transition-colors"
            >
              <option :value="user.id">Assign to myself</option>
              <option
                v-for="member in teamMembers"
                :key="member.id"
                :value="member.id"
              >
                Assign to: {{ member.fullName }}
              </option>
            </select>
          </div>

          <div
            class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700"
          >
            <button
              type="button"
              @click="isAssignTaskModalOpen = false"
              class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!newTask.title.trim() || isSubmittingTask"
              class="px-4 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
            >
              <Icon
                v-if="isSubmittingTask"
                name="material-symbols:sync-rounded"
                class="text-base animate-spin"
              />
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import draggable from "vuedraggable";
import { useAppToast } from "~/composables/useAppToast";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const { success: toastSuccess, error: toastError } = useAppToast();
const authStore = useAuthStore();

const { user } = storeToRefs(authStore);

// State
const sessionsList = ref([]);
const currentSession = ref(null);
const isLoading = ref(true);

// Modal States
const isIdeaModalOpen = ref(false);
const isSubmitting = ref(false);
const isViewModalOpen = ref(false);
const activeIdea = ref(null);

// Task Assignment State
const isAssignTaskModalOpen = ref(false);
const isSubmittingTask = ref(false);
const teamMembers = ref([]);
const activeTaskIdea = ref(null);
const newTask = ref({
  title: "",
  description: "",
  assigneeId: user.value?.id,
  priority: "MEDIUM",
  dueDate: "",
});

// Idea Comments State
const ideaComments = ref([]);
const newIdeaComment = ref("");
const isSubmittingComment = ref(false);
const isLoadingComments = ref(false);

// State for editing comments
const editingCommentId = ref(null);
const editCommentText = ref("");
const isSavingEdit = ref(false);

const newIdea = ref({
  content: "",
  tag: "Editorial",
});

// Kanban columns mapped exactly to the Prisma IdeaStatus enum
const columns = ref([
  { id: "IDEA", title: "Ideas", cards: [] },
  { id: "IN_DISCUSSION", title: "In Discussion", cards: [] },
  { id: "APPROVED", title: "Approved", cards: [] },
  { id: "ASSIGNED", title: "Assigned", cards: [] },
]);

// Map string tags to standard Tailwind class colors
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

// Fetch data
const loadTeamMembers = async () => {
  if (user.value?.role === "ADMIN") {
    try {
      const allUsers = await useApiFetch("/users");
      teamMembers.value = allUsers.filter((u) => u.id !== user.value.id);
    } catch (error) {
      console.error("Failed to load team members", error);
    }
  }
};

const loadBoard = async () => {
  isLoading.value = true;
  try {
    const sessions = await useApiFetch("/brainstorm/sessions");
    sessionsList.value = sessions;

    if (sessions.length > 0) {
      currentSession.value = sessions[0];
      await fetchIdeasForSession();
    }
  } catch (error) {
    toastError("Failed to load brainstorming boards.");
  } finally {
    isLoading.value = false;
  }
};

const fetchIdeasForSession = async () => {
  if (!currentSession.value) return;

  try {
    const ideas = await useApiFetch(
      `/brainstorm/sessions/${currentSession.value.id}/ideas`,
    );
    columns.value.forEach((col) => (col.cards = []));
    ideas.forEach((idea) => {
      const col = columns.value.find((c) => c.id === idea.status);
      if (col) col.cards.push(idea);
    });
  } catch (error) {
    toastError("Failed to load ideas for this board.");
  }
};

// Creates a default session if the board is empty
const createDefaultSession = async () => {
  const title = prompt("Enter a name for the new Brainstorming Board:");
  if (!title) return;

  try {
    const newSess = await useApiFetch("/brainstorm/sessions", {
      method: "POST",
      body: { title: title, description: "" },
    });

    sessionsList.value.unshift(newSess);
    currentSession.value = newSess;
    await fetchIdeasForSession();
    toastSuccess(`Board "${title}" created!`);
  } catch (err) {
    toastError("Failed to create board.");
  }
};

// Creates a new sticky note
const submitIdea = async () => {
  if (!newIdea.value.content.trim() || !currentSession.value) return;
  isSubmitting.value = true;

  try {
    const addedIdea = await useApiFetch("/brainstorm/ideas", {
      method: "POST",
      body: {
        content: newIdea.value.content,
        tags: [newIdea.value.tag],
        sessionId: currentSession.value.id,
      },
    });

    columns.value[0].cards.unshift(addedIdea);
    isIdeaModalOpen.value = false;
    newIdea.value.content = "";
    toastSuccess("Idea added!");
  } catch (err) {
    toastError("Failed to add idea.");
  } finally {
    isSubmitting.value = false;
  }
};

// Drag and drop handler
const onDragChange = async (targetColumnId, event) => {
  if (event.added) {
    const ideaId = event.added.element.id;
    try {
      await useApiFetch(`/brainstorm/ideas/${ideaId}/status`, {
        method: "PATCH",
        body: { status: targetColumnId },
      });
    } catch (err) {
      toastError("Failed to sync board status.");
      loadBoard(); // Revert on failure
    }
  }
};

// Mobile Fallback Handler
const moveCardMobile = async (idea, newStatus) => {
  try {
    await useApiFetch(`/brainstorm/ideas/${idea.id}/status`, {
      method: "PATCH",
      body: { status: newStatus },
    });
    toastSuccess("Idea moved successfully.");
    await fetchIdeasForSession();
  } catch (err) {
    toastError("Failed to move idea.");
  }
};

// Update the open modal function to fetch comments
const openIdeaDetails = async (idea) => {
  activeIdea.value = idea;
  isViewModalOpen.value = true;
  ideaComments.value = []; // Reset on open
  isLoadingComments.value = true;

  try {
    ideaComments.value = await useApiFetch(
      `/brainstorm/ideas/${idea.id}/comments`,
    );
  } catch (error) {
    toastError("Failed to load discussion.");
  } finally {
    isLoadingComments.value = false;
  }
};

// Function to post a new comment
const submitIdeaComment = async () => {
  if (!newIdeaComment.value.trim() || !activeIdea.value) return;
  isSubmittingComment.value = true;

  try {
    const addedComment = await useApiFetch(
      `/brainstorm/ideas/${activeIdea.value.id}/comments`,
      {
        method: "POST",
        body: { content: newIdeaComment.value },
      },
    );

    ideaComments.value.push(addedComment); // Append to bottom
    newIdeaComment.value = ""; // Clear input

    if (activeIdea.value.comments !== undefined) {
      activeIdea.value.comments += 1;
    }
  } catch (err) {
    toastError("Failed to post comment.");
  } finally {
    isSubmittingComment.value = false;
  }
};

// Start editing a specific comment
const startEditing = (comment) => {
  editingCommentId.value = comment.id;
  editCommentText.value = comment.content;
};

// Cancel editing
const cancelEditing = () => {
  editingCommentId.value = null;
  editCommentText.value = "";
};

// Save the edited comment
const saveEdit = async (commentId) => {
  if (!editCommentText.value.trim() || isSavingEdit.value) return;
  isSavingEdit.value = true;

  try {
    const updatedComment = await useApiFetch(
      `/brainstorm/ideas/comments/${commentId}`,
      {
        method: "PATCH",
        body: { content: editCommentText.value },
      },
    );

    const index = ideaComments.value.findIndex((c) => c.id === commentId);
    if (index !== -1) {
      ideaComments.value[index].content = updatedComment.content;
    }

    cancelEditing();
    toastSuccess("Comment updated");
  } catch (error) {
    toastError("Failed to update comment");
  } finally {
    isSavingEdit.value = false;
  }
};

// Open the task assignment modal pre-filled with the idea
const openAssignTaskModal = (idea) => {
  activeTaskIdea.value = idea;
  let shortIdea = idea.content.split(" ").slice(0, 5).join(" ");
  if (idea.content.length > shortIdea.length) shortIdea += "...";

  newTask.value = {
    title: `Draft Article: ${shortIdea}`,
    description: `Based on idea: "${idea.content}"`,
    assigneeId: user.value?.id,
    priority: "MEDIUM",
    dueDate: "",
  };
  isAssignTaskModalOpen.value = true;
};

const submitAssignedTask = async () => {
  if (!newTask.value.title.trim() || isSubmittingTask.value) return;
  isSubmittingTask.value = true;

  try {
    await useApiFetch("/tasks", {
      method: "POST",
      body: {
        title: newTask.value.title,
        description: newTask.value.description || null,
        assigneeId: newTask.value.assigneeId,
        priority: newTask.value.priority,
        dueDate: newTask.value.dueDate
          ? new Date(newTask.value.dueDate).toISOString()
          : null,
      },
    });

    if (activeTaskIdea.value) {
      const updatedIdea = await useApiFetch(
        `/brainstorm/ideas/${activeTaskIdea.value.id}/assign`,
        {
          method: "PATCH",
          body: { assigneeId: newTask.value.assigneeId },
        },
      );

      activeTaskIdea.value.assignee = updatedIdea.assignee;
    }

    toastSuccess("Task assigned successfully!");
    isAssignTaskModalOpen.value = false;
  } catch (err) {
    toastError("Failed to assign task.");
  } finally {
    isSubmittingTask.value = false;
  }
};

onMounted(() => {
  loadBoard();
  loadTeamMembers();
});
</script>

<style scoped>
@reference "~/assets/css/main.css";

.kanban-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.kanban-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.kanban-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-slate-700 rounded-full;
}
.kanban-scrollbar:hover::-webkit-scrollbar-thumb {
  @apply bg-slate-400 dark:bg-slate-600;
}
</style>
