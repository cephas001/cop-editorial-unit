<template>
  <div
    class="h-[100dvh] flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-200 overflow-hidden"
  >
    <input
      type="file"
      ref="imageFileInput"
      accept="image/*"
      class="hidden"
      @change="handleImageUpload"
    />
    <input
      type="file"
      ref="coverFileInput"
      accept="image/*"
      class="hidden"
      @change="handleCoverUpload"
    />

    <header
      class="h-16 flex-shrink-0 flex justify-between items-center px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 relative gap-2"
    >
      <div class="flex items-center gap-3 md:gap-6 shrink-0">
        <NuxtLink
          @click="router.back()"
          class="flex items-center text-primary-600 dark:text-primary-400 cursor-pointer"
        >
          <Icon
            name="material-symbols:arrow-back-rounded"
            class="text-xl sm:text-2xl hover:text-primary-700 transition-colors"
          />
        </NuxtLink>

        <div
          class="md:hidden flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full"
        >
          <Icon
            v-if="saveStatus === 'Saved'"
            name="material-symbols:cloud-done-outline-rounded"
            class="text-emerald-500 text-sm"
          />
          <Icon
            v-else-if="saveStatus === 'Saving...'"
            name="material-symbols:sync-rounded"
            class="animate-spin text-primary-500 text-sm"
          />
          <Icon
            v-else-if="saveStatus === 'Save failed!'"
            name="material-symbols:error-outline-rounded"
            class="text-rose-500 text-sm"
          />
          <Icon
            v-else
            name="material-symbols:edit-note-rounded"
            class="text-amber-500 text-sm"
          />
        </div>
      </div>

      <div
        class="hidden md:flex absolute left-1/2 -translate-x-1/2 flex-col items-center pointer-events-none w-1/3"
      >
        <div
          class="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 truncate w-full text-center"
        >
          {{ articleTitle || "Untitled Draft" }}
          <span
            v-if="isReadOnly"
            class="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          >
            View Only
          </span>
        </div>
        <div
          class="flex items-center justify-center gap-1.5 mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          <Icon
            v-if="saveStatus === 'Saved'"
            name="material-symbols:cloud-done-outline-rounded"
            class="text-emerald-500 text-xs"
          />
          <Icon
            v-else-if="saveStatus === 'Saving...'"
            name="material-symbols:sync-rounded"
            class="animate-spin text-primary-500 text-xs"
          />
          <Icon
            v-else-if="saveStatus === 'Save failed!'"
            name="material-symbols:error-outline-rounded"
            class="text-rose-500 text-xs"
          />
          <Icon
            v-else
            name="material-symbols:edit-note-rounded"
            class="text-amber-500 text-xs"
          />
          <span>{{ saveStatus }}</span>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          v-if="
            ((user?.role === 'WRITER' || user?.role === 'ADMIN') &&
              articleStatus === 'DRAFT') ||
            (articleStatus === 'IN_REVIEW' && user?.id === articleAuthorId)
          "
          @click="submitForReview"
          class="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          Submit<span class="hidden sm:inline"> for Review</span>
        </button>

        <button
          v-if="user?.role === 'ADMIN' && articleStatus === 'IN_REVIEW'"
          @click="publishLive"
          class="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0"
        >
          <Icon
            name="material-symbols:rocket-launch-rounded"
            class="text-sm sm:text-base"
          />
          Publish<span class="hidden sm:inline"> Live</span>
        </button>

        <div
          v-if="articleStatus === 'PUBLISHED'"
          class="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0"
        >
          <Icon
            name="material-symbols:check-circle-rounded"
            class="text-sm sm:text-base"
          />
          Published
        </div>

        <div
          class="flex items-center ml-1 border-l border-slate-200 dark:border-slate-700 gap-1 pl-1 sm:pl-2 shrink-0"
        >
          <button
            @click="isCommentsOpen = true"
            class="xl:hidden p-1.5 sm:p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative flex items-center justify-center cursor-pointer"
          >
            <Icon
              name="material-symbols:chat-bubble-outline-rounded"
              class="text-[1.2rem] sm:text-xl"
            />
            <span
              v-if="comments.length > 0"
              class="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"
            ></span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative">
      <main
        class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 pb-32 relative w-full"
      >
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center w-full h-full min-h-[50vh]"
        >
          <VineyardLoader size="120px" />
          <span class="mt-6 text-sm font-mono text-primary-500/70 animate-pulse"
            >Fetching draft...</span
          >
        </div>

        <template v-else>
          <bubble-menu
            v-if="editor"
            :editor="editor"
            :options="{ placement: 'top', offset: 8 }"
            class="flex items-center gap-1 px-1.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg overflow-x-auto hide-scrollbar max-w-[90vw]"
            :shouldShow="({ from, to }) => from !== to"
          >
            <template v-if="!isReadOnly">
              <button
                @click="editor.chain().focus().toggleBold().run()"
                :class="[
                  'p-1.5 rounded-md transition-colors shrink-0',
                  editor.isActive('bold')
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                ]"
                title="Bold"
              >
                <Icon
                  name="material-symbols:format-bold-rounded"
                  class="text-lg sm:text-xl"
                />
              </button>
              <button
                @click="editor.chain().focus().toggleItalic().run()"
                :class="[
                  'p-1.5 rounded-md transition-colors shrink-0',
                  editor.isActive('italic')
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                ]"
                title="Italic"
              >
                <Icon
                  name="material-symbols:format-italic-rounded"
                  class="text-lg sm:text-xl"
                />
              </button>
              <button
                @click="editor.chain().focus().toggleStrike().run()"
                :class="[
                  'p-1.5 rounded-md transition-colors shrink-0',
                  editor.isActive('strike')
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                ]"
                title="Strikethrough"
              >
                <Icon
                  name="material-symbols:format-strikethrough-rounded"
                  class="text-lg sm:text-xl"
                />
              </button>
              <button
                @click="editor.chain().focus().toggleCode().run()"
                :class="[
                  'p-1.5 rounded-md transition-colors shrink-0',
                  editor.isActive('code')
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                ]"
                title="Inline Code"
              >
                <Icon
                  name="material-symbols:code-rounded"
                  class="text-lg sm:text-xl"
                />
              </button>

              <div
                class="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"
              ></div>

              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                "
                :class="[
                  'p-1.5 rounded-md transition-colors shrink-0 font-bold text-sm font-sans',
                  editor.isActive('heading', { level: 2 })
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                ]"
                title="Heading 2"
              >
                H2
              </button>
              <button
                @click="editor.chain().focus().toggleBlockquote().run()"
                :class="[
                  'p-1.5 rounded-md transition-colors shrink-0',
                  editor.isActive('blockquote')
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                ]"
                title="Quote"
              >
                <Icon
                  name="material-symbols:format-quote-rounded"
                  class="text-lg sm:text-xl"
                />
              </button>

              <div
                class="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"
              ></div>

              <button
                @click="editor.chain().focus().toggleHighlight().run()"
                :class="[
                  'p-1.5 rounded-md transition-colors shrink-0',
                  editor.isActive('highlight')
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 hover:text-yellow-600',
                ]"
                title="Highlight Text"
              >
                <Icon
                  name="material-symbols:ink-highlighter-outline-rounded"
                  class="text-lg sm:text-xl"
                />
              </button>

              <div
                class="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"
              ></div>

              <button
                @click="triggerImageUpload"
                :disabled="isUploadingImage"
                class="p-1.5 rounded-md transition-colors shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Insert Image"
              >
                <Icon
                  v-if="isUploadingImage"
                  name="material-symbols:sync-rounded"
                  class="text-lg sm:text-xl animate-spin"
                />
                <Icon
                  v-else
                  name="material-symbols:image-outline-rounded"
                  class="text-lg sm:text-xl"
                />
              </button>

              <div
                class="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"
              ></div>
            </template>

            <button
              @click="prepareComment"
              class="p-1.5 rounded-md transition-colors flex items-center gap-1.5 pr-2 shrink-0 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10"
              title="Add Comment"
            >
              <Icon
                name="material-symbols:add-comment-outline-rounded"
                class="text-lg sm:text-xl"
              />
              <span class="text-xs font-semibold hidden sm:inline"
                >Comment</span
              >
            </button>
          </bubble-menu>

          <floating-menu
            v-if="editor && !isReadOnly"
            :editor="editor"
            :tippy-options="{ placement: 'top-start', offset: [0, 8] }"
            class="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl z-20"
          >
            <button
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
              :class="[
                'p-1.5 rounded-md transition-colors font-bold text-xs font-sans shrink-0',
                editor.isActive('heading', { level: 2 })
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
              ]"
              title="Heading 2"
            >
              H2
            </button>
            <button
              @click="editor.chain().focus().toggleBlockquote().run()"
              :class="[
                'p-1.5 rounded-md transition-colors shrink-0',
                editor.isActive('blockquote')
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
              ]"
              title="Quote"
            >
              <Icon
                name="material-symbols:format-quote-rounded"
                class="text-lg"
              />
            </button>
            <button
              @click="triggerImageUpload"
              :disabled="isUploadingImage"
              class="p-1.5 rounded-md transition-colors shrink-0 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center"
              title="Insert Image"
            >
              <Icon
                v-if="isUploadingImage"
                name="material-symbols:sync-rounded"
                class="text-lg animate-spin"
              />
              <Icon
                v-else
                name="material-symbols:image-outline-rounded"
                class="text-lg"
              />
            </button>
          </floating-menu>

          <div
            class="max-w-3xl mx-auto px-5 sm:px-8 md:px-12 pt-8 sm:pt-12 focus:outline-none"
          >
            <input
              v-model="articleTitle"
              :disabled="isReadOnly"
              type="text"
              placeholder="Article Title..."
              class="w-full bg-transparent text-lg md:text-2xl font-bold text-black dark:text-white leading-tight tracking-tight border-none outline-none focus:ring-0 placeholder:text-slate-300 placeholder:tracking-wide dark:placeholder:text-slate-800 px-0 disabled:opacity-80"
            />
          </div>

          <div
            v-if="!isReadOnly && !articleThumbnailUrl"
            class="max-w-3xl mx-auto px-5 sm:px-8 md:px-12 mt-4 flex justify-start"
          >
            <button
              @click="triggerCoverUpload"
              :disabled="isUploadingCover"
              class="text-xs md:text-sm font-medium text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 flex items-center gap-2 transition-colors group disabled:opacity-50"
            >
              <Icon
                v-if="isUploadingCover"
                name="material-symbols:sync-rounded"
                class="text-lg md:text-xl animate-spin"
              />
              <Icon
                v-else
                name="material-symbols:image-outline-rounded"
                class="text-lg md:text-xl group-hover:scale-110 transition-transform"
              />
              {{ isUploadingCover ? "Uploading..." : "Add Cover" }}
            </button>
          </div>

          <div
            v-if="articleThumbnailUrl"
            class="max-w-3xl mx-auto px-5 sm:px-8 md:px-12 mt-6 relative group"
          >
            <div
              class="w-full h-48 sm:h-64 md:h-80 rounded-2xl overflow-hidden shadow-sm relative border border-slate-200 dark:border-slate-700"
            >
              <AppLazyImage
                :src="articleThumbnailUrl"
                class="w-full h-full object-cover"
              />

              <div
                v-if="!isReadOnly"
                class="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]"
              >
                <button
                  @click="
                    articleThumbnailUrl = null;
                    performSave();
                  "
                  class="px-4 py-2 bg-white text-rose-600 rounded-lg text-sm font-medium shadow-sm hover:bg-rose-50 transition-colors flex items-center gap-2"
                >
                  <Icon
                    name="material-symbols:delete-outline-rounded"
                    class="text-lg"
                  />
                  Remove Cover
                </button>
              </div>
            </div>
          </div>

          <div
            class="max-w-3xl mx-auto px-5 sm:px-8 md:px-12 py-8 focus:outline-none"
          >
            <editor-content
              :editor="editor"
              class="font-serif text-sm md:text-lg text-black dark:text-slate-300 leading-relaxed prose prose-indigo dark:prose-invert max-w-none focus:outline-none"
            />
          </div>
        </template>
      </main>

      <div
        v-if="isCommentsOpen"
        @click="isCommentsOpen = false"
        class="xl:hidden fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
      ></div>

      <aside
        :class="[
          'flex flex-col bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-[320px] sm:max-w-sm shrink-0 fixed top-0 xl:relative right-0 transition-transform duration-300 shadow-2xl xl:shadow-none bottom-0 z-50 pt-2',
          isCommentsOpen
            ? 'translate-x-0'
            : 'translate-x-full xl:translate-x-0',
        ]"
      >
        <div
          class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900"
        >
          <div>
            <div class="text-base font-bold text-slate-900 dark:text-white">
              Collaboration
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {{ comments.length }} active threads
            </div>
          </div>
          <button
            @click="isCommentsOpen = false"
            class="xl:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <div
          class="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0"
        >
          <button
            @click="activeSidebarTab = 'comments'"
            :class="[
              'flex-1 py-3 flex justify-center items-center gap-2 transition-colors',
              activeSidebarTab === 'comments'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
            ]"
          >
            <Icon name="material-symbols:chat-bubble-rounded" class="text-lg" />
            <span class="text-sm font-semibold">Comments</span>
          </button>
          <button
            @click="activeSidebarTab = 'activity'"
            :class="[
              'flex-1 py-3 flex justify-center items-center gap-2 transition-colors',
              activeSidebarTab === 'activity'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
            ]"
          >
            <Icon name="material-symbols:history-rounded" class="text-lg" />
            <span class="text-sm font-semibold">Activity</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 relative">
          <div v-show="activeSidebarTab === 'comments'" class="space-y-4">
            <div
              v-if="comments.length === 0"
              class="absolute inset-0 flex flex-col items-center justify-center text-center px-6 opacity-60"
            >
              <Icon
                name="material-symbols:chat-bubble-outline-rounded"
                class="text-4xl text-slate-400 mb-3"
              />
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                No comments yet.
              </p>
              <p class="text-xs text-slate-500 mt-1">
                Highlight text and click comment to start a thread.
              </p>
            </div>

            <div
              v-for="comment in comments"
              :key="comment.id"
              :class="[
                'border rounded-xl p-4 relative group transition-all duration-300',
                comment.resolved
                  ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 opacity-75'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm',
              ]"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <img
                    v-if="comment.author.avatarUrl"
                    :src="comment.author.avatarUrl"
                    class="w-6 h-6 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 flex items-center justify-center text-[10px] font-bold"
                  >
                    {{ comment.author.fullName.charAt(0) }}
                  </div>
                  <span
                    :class="[
                      'text-sm font-semibold',
                      comment.resolved
                        ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-400'
                        : 'text-slate-900 dark:text-white',
                    ]"
                  >
                    {{ comment.author.fullName }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="
                      !comment.resolved &&
                      (user?.id === articleAuthorId || user?.role === 'ADMIN')
                    "
                    @click="resolveComment(comment.id)"
                    class="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-all shadow-sm bg-white dark:bg-slate-800 flex items-center justify-center"
                    title="Mark as resolved"
                  >
                    <Icon
                      name="material-symbols:check-rounded"
                      class="text-base"
                    />
                  </button>
                  <span
                    class="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center"
                    >{{ formatTimeAgo(comment.createdAt) }}</span
                  >

                  <Icon
                    v-if="comment.resolved"
                    name="material-symbols:check-circle-rounded"
                    class="text-base text-emerald-500"
                  />
                </div>
              </div>

              <div
                v-if="comment.highlightId"
                class="mb-2 pl-2 border-l-2 border-primary-400 text-xs italic text-slate-500 dark:text-slate-400 line-clamp-2"
              >
                "{{ comment.highlightId }}"
              </div>

              <div v-if="editingCommentId !== comment.id">
                <p
                  class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
                >
                  {{ comment.content }}
                </p>
              </div>
              <div v-else class="mt-2 space-y-2 animate-fade-in">
                <textarea
                  v-model="editCommentText"
                  rows="2"
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary-600 resize-none text-slate-900 dark:text-white"
                ></textarea>
                <div class="flex justify-end gap-2">
                  <button
                    @click="cancelEditing"
                    class="px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveEdit(comment.id)"
                    :disabled="isSavingEdit"
                    class="px-3 py-1 text-[10px] font-medium bg-primary-600 text-white hover:bg-primary-700 rounded disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Icon
                      v-if="isSavingEdit"
                      name="material-symbols:sync-rounded"
                      class="animate-spin"
                    />
                    Save
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-3 mt-2">
                <button
                  @click="startReply(comment)"
                  class="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary-600 transition-colors"
                >
                  Reply
                </button>
                <button
                  v-if="
                    comment.author.id === user?.id ||
                    comment.authorId === user?.id
                  "
                  @click="startEditing(comment)"
                  class="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary-600 transition-colors"
                >
                  Edit
                </button>
              </div>

              <div
                v-if="comment.replies && comment.replies.length > 0"
                class="mt-3 pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div
                  v-for="reply in comment.replies"
                  :key="reply.id"
                  class="flex gap-2"
                >
                  <div
                    class="w-5 h-5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 mt-0.5"
                  >
                    <img
                      :src="reply.author.avatarUrl"
                      class="w-full h-full rounded-full object-cover"
                      v-if="reply.author.avatarUrl"
                    />
                    <span v-else>{{ reply.author.fullName.charAt(0) }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between w-full">
                      <div class="flex items-center gap-1.5">
                        <span
                          class="text-xs font-semibold text-slate-800 dark:text-slate-200"
                          >{{ reply.author.fullName }}</span
                        >
                        <span class="text-[9px] text-slate-400"
                          >{{ formatTimeAgo(reply.createdAt) }}
                        </span>
                      </div>
                      <button
                        v-if="
                          reply.author.id === user?.id ||
                          reply.authorId === user?.id
                        "
                        @click="startEditing(reply)"
                        class="text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Edit
                      </button>
                    </div>

                    <div v-if="editingCommentId !== reply.id">
                      <p
                        class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap"
                      >
                        {{ reply.content }}
                      </p>
                    </div>
                    <div v-else class="mt-1 space-y-2 animate-fade-in">
                      <textarea
                        v-model="editCommentText"
                        rows="1"
                        class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs focus:ring-1 focus:ring-primary-600 resize-none text-slate-900 dark:text-white"
                      ></textarea>
                      <div class="flex justify-end gap-1.5">
                        <button
                          @click="cancelEditing"
                          class="px-2 py-0.5 text-[9px] font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          @click="saveEdit(reply.id)"
                          :disabled="isSavingEdit"
                          class="px-2 py-0.5 text-[9px] font-medium bg-primary-600 text-white hover:bg-primary-700 rounded disabled:opacity-50 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeSidebarTab === 'activity'" class="space-y-6">
            <div
              v-if="activities.length === 0"
              class="text-center mt-10 opacity-60"
            >
              <Icon
                name="material-symbols:history-rounded"
                class="text-4xl text-slate-400 mb-2"
              />
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                No activity recorded yet.
              </p>
            </div>
            <div
              class="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent"
            >
              <div
                v-for="activity in activities"
                :key="activity.id"
                class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6"
              >
                <div
                  :class="[
                    'flex items-center justify-center w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10',
                    activity.type === 'STATUS'
                      ? 'bg-emerald-500 text-white'
                      : activity.type === 'COMMENT'
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
                  ]"
                >
                  <Icon
                    :name="
                      activity.type === 'STATUS'
                        ? 'material-symbols:rocket-launch-rounded'
                        : activity.type === 'COMMENT'
                          ? 'material-symbols:chat-bubble-rounded'
                          : 'material-symbols:edit-document-rounded'
                    "
                    class="text-[10px]"
                  />
                </div>
                <div
                  class="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span
                      class="text-xs font-bold text-slate-900 dark:text-white"
                      >{{ activity.user?.fullName || "Unknown" }}</span
                    >
                    <span class="text-[9px] font-mono text-slate-500">{{
                      formatTimeAgo(activity.createdAt)
                    }}</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300">
                    {{ activity.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-show="activeSidebarTab === 'comments'"
          class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex flex-col"
        >
          <div
            v-if="replyingTo || selectedTextForComment"
            class="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs"
          >
            <div v-if="replyingTo" class="text-slate-600 dark:text-slate-300">
              Replying to
              <span class="font-bold">{{ replyingTo.author.fullName }}</span>
            </div>
            <div
              v-else-if="selectedTextForComment"
              class="text-slate-500 dark:text-slate-400 italic truncate pr-2"
            >
              Commenting on: "{{ formattedSelection }}"
            </div>
            <button
              @click="cancelContext"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
            >
              <Icon name="material-symbols:close-rounded" class="text-sm" />
            </button>
          </div>

          <form @submit.prevent="submitComment" class="relative p-4">
            <input
              v-model="newCommentContent"
              type="text"
              :disabled="!articleId || isSubmittingComment"
              :placeholder="
                replyingTo ? 'Write a reply...' : 'Add a comment...'
              "
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-3 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              :disabled="!newCommentContent.trim() || isSubmittingComment"
              class="absolute right-6 top-1/2 transform -translate-y-1/2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors p-1 rounded-md disabled:opacity-40 flex items-center justify-center cursor-pointer"
            >
              <Icon
                v-if="isSubmittingComment"
                name="material-symbols:sync-rounded"
                class="text-xl animate-spin"
              />
              <Icon
                v-else
                name="material-symbols:send-rounded"
                class="text-xl"
              />
            </button>
          </form>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { BubbleMenu, FloatingMenu } from "@tiptap/vue-3/menus";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";

definePageMeta({ layout: false });

const route = useRoute();
const router = useRouter();
const { error: toastError, success: toastSuccess } = useAppToast();
const confirm = useConfirm();
const authStore = useAuthStore();

// Auth Context
const user = computed(() => authStore.user);
const articleAuthorId = ref(null);
const activeSidebarTab = ref("comments");
const activities = ref([]);

const previousImages = ref([]);

const getAllImageUrls = () => {
  const urls = [];
  if (!editor.value) return urls;

  editor.value.state.doc.descendants((node) => {
    if (node.type.name === "image") {
      urls.push(node.attrs.src);
    }
  });
  return urls;
};

// --- PERMISSIONS STATE ---
const isReadOnly = computed(() => {
  if (isNewDraft) return false;
  if (!user.value || !articleAuthorId.value) return true;
  if (user.value.role === "ADMIN") return false;
  return user.value.id !== articleAuthorId.value;
});

const articleStatus = ref("DRAFT");
const isCommentsOpen = ref(false);
const articleTitle = ref("");

const isNewDraft = route.params.id === "new";
const articleId = ref(isNewDraft ? null : route.params.id);

const isLoading = ref(!isNewDraft);
const saveStatus = ref(isNewDraft ? "Unsaved" : "Loading...");
let saveTimeout = null;

// --- COMMENT CONTEXT STATE ---
const comments = ref([]);
const newCommentContent = ref("");
const isSubmittingComment = ref(false);
const selectedTextForComment = ref("");
const replyingTo = ref(null);

// --- COMMENT EDITING STATE ---
const editingCommentId = ref(null);
const editCommentText = ref("");
const isSavingEdit = ref(false);

const startEditing = (comment) => {
  editingCommentId.value = comment.id;
  editCommentText.value = comment.content;
};

const cancelEditing = () => {
  editingCommentId.value = null;
  editCommentText.value = "";
};

const saveEdit = async (commentId) => {
  if (!editCommentText.value.trim() || isSavingEdit.value) return;
  isSavingEdit.value = true;

  try {
    const updatedComment = await useApiFetch(`/comments/${commentId}`, {
      method: "PATCH",
      body: { content: editCommentText.value },
    });

    // Determine if it's a top-level comment or a reply and update locally
    const topIndex = comments.value.findIndex((c) => c.id === commentId);
    if (topIndex !== -1) {
      comments.value[topIndex].content = updatedComment.content;
    } else {
      for (const comment of comments.value) {
        if (comment.replies) {
          const replyIndex = comment.replies.findIndex(
            (r) => r.id === commentId,
          );
          if (replyIndex !== -1) {
            comment.replies[replyIndex].content = updatedComment.content;
            break;
          }
        }
      }
    }

    cancelEditing();
    toastSuccess("Comment updated");
  } catch (error) {
    toastError("Failed to update comment");
  } finally {
    isSavingEdit.value = false;
  }
};

const loadActivities = async () => {
  try {
    activities.value = await useApiFetch(
      `/activities/article/${articleId.value}`,
    );
  } catch (err) {
    toastError("Failed to load activity history.");
  }
};

const formattedSelection = computed(() => {
  const text = selectedTextForComment.value;
  if (!text || text.length <= 35) return text;
  const words = text.split(" ");
  const lastTwo = words.slice(-2).join(" ");
  const beginning = text.substring(0, 25);
  return `${beginning}... ${lastTwo}`;
});

const prepareComment = () => {
  const { from, to } = editor.value.state.selection;
  selectedTextForComment.value = editor.value.state.doc.textBetween(
    from,
    to,
    " ",
  );
  replyingTo.value = null;
  isCommentsOpen.value = true;
};

const startReply = (comment) => {
  replyingTo.value = comment;
  selectedTextForComment.value = "";
  isCommentsOpen.value = true;
};

const cancelContext = () => {
  selectedTextForComment.value = "";
  replyingTo.value = null;
};

const editor = useEditor({
  content: "",
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      HTMLAttributes: {
        class:
          "rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 my-4 max-w-full h-auto lazy-image",
        loading: "lazy", // Native browser lazy loading inside the editor
      },
    }),
    Highlight.configure({
      HTMLAttributes: {
        class:
          "bg-yellow-200 dark:bg-yellow-500/30 px-1 rounded border-b-2 border-yellow-400",
      },
    }),
  ],
  editorProps: {
    attributes: { class: "focus:outline-none" },
  },
  onUpdate: () => {
    if (isReadOnly.value) return;
    saveStatus.value = "Unsaved changes";
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(performSave, 1500);
  },
});

// Image Upload Logic
const imageFileInput = ref(null);
const isUploadingImage = ref(false);
const articleThumbnailUrl = ref(null);

const triggerImageUpload = () => {
  imageFileInput.value.click();
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploadingImage.value = true;
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await useApiFetch("/articles/upload-image", {
      method: "POST",
      body: formData,
    });

    // Insert into editor
    editor.value.chain().focus().setImage({ src: response.url }).run();
  } catch (err) {
    toastError("Failed to upload image.");
  } finally {
    isUploadingImage.value = false;
    event.target.value = ""; // Reset input
  }
};

// Thumbnail Logic
// --- COVER IMAGE UPLOAD LOGIC ---
const coverFileInput = ref(null);
const isUploadingCover = ref(false);

const triggerCoverUpload = () => {
  if (coverFileInput.value) {
    coverFileInput.value.click();
  }
};

const handleCoverUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploadingCover.value = true;
  const formData = new FormData();
  formData.append("image", file);

  try {
    // We can reuse the exact same backend endpoint for uploading images
    const response = await useApiFetch("/articles/upload-image", {
      method: "POST",
      body: formData,
    });

    // Set the returned URL as the article's thumbnail/cover
    articleThumbnailUrl.value = response.url;

    console.log(response.url, articleThumbnailUrl.value);
    // Automatically trigger a save so the database captures the new cover
    await performSave();
    toastSuccess("Cover image updated!");
  } catch (err) {
    toastError("Failed to upload cover image.");
  } finally {
    isUploadingCover.value = false;
    event.target.value = ""; // Reset the input so the same file can be uploaded again if needed
  }
};

const performSave = async () => {
  if (!editor.value || isReadOnly.value) return;
  saveStatus.value = "Saving...";
  const content = editor.value.getJSON();
  const currentImages = getAllImageUrls();

  // Find images that were in previousImages but are NOT in currentImages
  const orphanedImages = previousImages.value.filter(
    (url) => !currentImages.includes(url),
  );

  try {
    // 1. Delete orphaned images from Supabase
    for (const url of orphanedImages) {
      await useApiFetch("/articles/purge-image", {
        method: "DELETE",
        body: { imageUrl: url },
      });

      // If the deleted image was the thumbnail, clear it
      if (articleThumbnailUrl.value === url) {
        articleThumbnailUrl.value = null;
      }
    }

    // 2. Save the Article
    const body = {
      title: articleTitle.value || "Untitled Draft",
      content: content,
      status: articleStatus.value,
      thumbnailUrl: articleThumbnailUrl.value,
    };

    if (!articleId.value) {
      const response = await useApiFetch("/articles", {
        method: "POST",
        body,
      });
      articleId.value = response.id;
      articleAuthorId.value = response.authorId;
      window.history.replaceState({}, "", `/editor/${response.id}`);
    } else {
      await useApiFetch(`/articles/${articleId.value}`, {
        method: "PUT",
        body,
      });
    }

    // 3. Update the tracking list for the next save cycle
    previousImages.value = currentImages;
    saveStatus.value = "Saved";
  } catch (err) {
    saveStatus.value = "Save failed!";
    toastError(
      "Auto-save failed. Please check your connection.",
      "Network Error",
    );
  }
};

watch(articleTitle, (newVal, oldVal) => {
  if (isReadOnly.value || !oldVal) return;
  saveStatus.value = "Unsaved changes";
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(performSave, 1500);
});

const submitForReview = async () => {
  const isConfirmed = await confirm.ask({
    title: "Submit for Review?",
    message:
      "This will lock the draft and share it with the team for feedback.",
    confirmText: "Submit",
    cancelText: "Cancel",
  });

  if (isConfirmed) {
    try {
      if (!articleId.value) await performSave();
      await useApiFetch(`/articles/${articleId.value}`, {
        method: "PUT",
        body: { status: "IN_REVIEW" },
      });
      articleStatus.value = "IN_REVIEW";
      toastSuccess("Draft submitted for review!");
    } catch (err) {
      toastError(err.data?.error || "Failed to submit draft.");
    }
  }
};

const publishLive = async () => {
  const isConfirmed = await confirm.ask({
    title: "Publish Live?",
    message: "This will make the article visible on the public blog.",
    confirmText: "Publish Now",
    cancelText: "Cancel",
  });

  if (isConfirmed) {
    try {
      await useApiFetch(`/articles/${articleId.value}`, {
        method: "PUT",
        body: { status: "PUBLISHED" },
      });
      articleStatus.value = "PUBLISHED";
      toastSuccess("Article is now live!");
    } catch (err) {
      toastError("Failed to publish the article.");
    }
  }
};

const loadComments = async () => {
  if (isNewDraft) return;
  try {
    comments.value = await useApiFetch(`/comments/article/${articleId.value}`);
  } catch (err) {
    console.error("Failed to load comments", err);
  }
};

const submitComment = async () => {
  if (!newCommentContent.value.trim() || !articleId.value) return;
  isSubmittingComment.value = true;

  try {
    const addedComment = await useApiFetch("/comments", {
      method: "POST",
      body: {
        articleId: articleId.value,
        content: newCommentContent.value,
        parentId: replyingTo.value?.id || null,
        highlightId: selectedTextForComment.value || null,
      },
    });

    if (replyingTo.value) {
      const parent = comments.value.find((c) => c.id === replyingTo.value.id);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(addedComment);
      }
    } else {
      comments.value.unshift(addedComment);
    }

    newCommentContent.value = "";
    cancelContext();
  } catch (err) {
    toastError("Failed to post comment. Check your connection.", "Post Error");
  } finally {
    isSubmittingComment.value = false;
  }
};

const resolveComment = async (commentId) => {
  try {
    await useApiFetch(`/comments/${commentId}/resolve`, { method: "PATCH" });
    const commentIndex = comments.value.findIndex((c) => c.id === commentId);
    if (commentIndex !== -1) {
      comments.value[commentIndex].resolved = true;
    }
  } catch (err) {
    toastError("Failed to resolve the comment.", "Error");
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return date.toLocaleDateString();
};

onMounted(async () => {
  if (!isNewDraft) {
    try {
      const data = await useApiFetch(`/articles/${articleId.value}`);
      articleTitle.value = data.title;
      articleAuthorId.value = data.authorId;
      articleStatus.value = data.status;
      articleThumbnailUrl.value = data.thumbnailUrl;

      if (
        data.content &&
        Object.keys(data.content).length > 0 &&
        editor.value
      ) {
        editor.value.commands.setContent(data.content);
        previousImages.value = getAllImageUrls();
      }
      saveStatus.value = "Saved";
      await loadComments();
      await loadActivities();
    } catch (err) {
      toastError("Could not load the article.", "Load Error");
      saveStatus.value = "Error";
    } finally {
      isLoading.value = false;
      if (editor.value) {
        editor.value.setEditable(!isReadOnly.value);
      }
    }
  }
});

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy();
  clearTimeout(saveTimeout);
});
</script>

<style>
@reference "tailwindcss";
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.ProseMirror p {
  margin-bottom: 1.5em;
}
.ProseMirror h2 {
  @apply text-2xl font-bold font-sans text-slate-900 dark:text-white mt-10 mb-4;
}
.ProseMirror code {
  @apply bg-slate-100 dark:bg-slate-800 text-rose-500 dark:text-rose-400 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200 dark:border-slate-700;
}
.ProseMirror blockquote {
  @apply bg-primary-50 dark:bg-primary-500/10 rounded-r-lg p-4 sm:p-5 my-6 sm:my-8 border-l-4 border-primary-600 text-primary-900 dark:text-primary-200 italic font-sans text-sm sm:text-base shadow-sm;
}
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
</style>
