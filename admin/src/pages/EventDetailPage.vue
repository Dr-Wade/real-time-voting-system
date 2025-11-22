<template>
  <div class="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex flex-col">
    <nav class="bg-slate-950 border-b border-slate-700 shadow-lg">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <router-link
              class="flex items-center gap-2 hover:opacity-80 transition"
              to="/"
            >
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">V</span>
              </div>
              <h1 class="text-xl font-bold text-white">
                Voting Admin
              </h1>
            </router-link>
          </div>
          <div class="text-sm text-slate-400">
            Event Details
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-1 overflow-y-auto">
      <div
        v-if="isLoading"
        class="flex items-center justify-center h-full"
      >
        <div class="text-slate-400">
          Loading event...
        </div>
      </div>

      <div
        v-else-if="event"
        class="max-w-full"
      >
        <!-- Event Header -->
        <div class="bg-slate-800 border-b border-slate-700 shadow-lg">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <div>
                  <h1 class="text-3xl font-bold text-white">
                    {{ event.name }}
                  </h1>
                  <p class="text-slate-400 mt-2">
                    Type: <span class="text-slate-300 font-medium">{{ event.type }}</span>
                  </p>
                </div>
                <div
                  v-if="event.active"
                  class="flex items-center gap-2 px-4 py-2 bg-green-900 border border-green-700 rounded-lg"
                >
                  <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span class="text-green-300 font-semibold text-sm">LIVE</span>
                </div>
              </div>
              <router-link
                class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold"
                to="/"
              >
                Back to Events
              </router-link>
            </div>

            <div class="flex gap-3">
              <button
                class="px-4 py-2 rounded-lg transition font-semibold"
                :class="event.active
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'"
                @click="events.toggleEventActive(event.id)"
              >
                {{ event.active ? "Deactivate Event" : "Activate Event" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Polls Management Section -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Sidebar with Polls List -->
            <aside class="lg:col-span-1">
              <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-semibold text-white">
                    Polls
                  </h2>
                  <button
                    class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                    title="Create new poll"
                    @click="polls.goToCreate"
                  >
                    +
                  </button>
                </div>

                <div
                  v-if="polls.isFetchingPolls"
                  class="text-slate-400 text-sm"
                >
                  Loading polls...
                </div>

                <div
                  v-else-if="polls.list.length === 0"
                  class="text-slate-400 text-sm"
                >
                  No polls yet. Create one to get started!
                </div>

                <div
                  v-else
                  class="space-y-3"
                >
                  <div
                    v-for="poll in polls.list"
                    :key="poll.id"
                    class="rounded-lg border transition"
                    :class="polls.selected === poll.id
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-slate-700 border-slate-600'"
                  >
                    <button
                      class="w-full text-left px-3 py-2"
                      @click="polls.selectPoll(poll.id)"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex-1 min-w-0">
                          <div
                            class="font-medium truncate"
                            :class="polls.selected === poll.id ? 'text-white' : 'text-slate-300'"
                          >
                            {{ poll.title }}
                          </div>
                          <div
                            class="text-xs"
                            :class="polls.selected === poll.id ? 'text-blue-200' : 'text-slate-400'"
                          >
                            {{ poll.options?.length ?? 0 }} options
                          </div>
                        </div>
                        <div
                          v-if="event.activePollId === poll.id"
                          class="ml-2 shrink-0 px-2 py-1 bg-yellow-900 border border-yellow-700 rounded text-yellow-300 text-xs font-semibold"
                        >
                          ACTIVE
                        </div>
                      </div>
                    </button>
                    <div class="flex gap-2 px-3 pb-2">
                      <button
                        v-if="event.activePollId !== poll.id"
                        class="flex-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition font-medium"
                        @click="events.setActivePoll(event.id, poll.id)"
                      >
                        Set Active
                      </button>
                      <button
                        v-else
                        class="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition font-medium"
                        @click="events.clearActivePoll(event.id)"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Main Content -->
            <div class="lg:col-span-2">
              <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
                <h2 class="text-2xl font-bold text-white mb-6">
                  {{ polls.currentView === "create" ? "Create New Poll" : "Edit Poll" }}
                </h2>

                <form
                  class="space-y-6"
                  @submit.prevent="handleFormSubmit"
                >
                  <div>
                    <label
                      class="block text-sm font-medium text-slate-300 mb-2"
                      for="title"
                    >
                      Poll Title
                    </label>
                    <input
                      id="title"
                      v-model="polls.form.title"
                      class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter poll title"
                      required
                      type="text"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-300 mb-3">
                      Poll Options
                    </label>
                    <div class="space-y-3">
                      <div
                        v-for="(_option, index) in polls.form.options"
                        :key="index"
                        class="flex gap-2"
                      >
                        <input
                          v-model="polls.form.options[index]"
                          class="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="Enter option"
                          required
                          type="text"
                        >
                        <button
                          v-if="polls.form.options.length > 2"
                          class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                          type="button"
                          @click="polls.removeOption(index)"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <button
                      class="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded-lg transition font-medium border border-slate-600"
                      type="button"
                      @click="polls.addOption"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div class="flex gap-3 pt-4">
                    <button
                      class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition font-semibold"
                      :disabled="polls.isLoading"
                      type="submit"
                    >
                      {{ polls.isLoading ? (polls.currentView === "create" ? "Creating..." : "Updating...") : (polls.currentView === "create" ? "Create Poll" : "Update Poll") }}
                    </button>
                    <button
                      class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold"
                      type="button"
                      @click="polls.resetForm"
                    >
                      Reset
                    </button>
                  </div>

                  <div
                    v-if="polls.message.text"
                    :class="['p-4 rounded-lg', polls.message.type === 'success' ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-red-900 text-red-200 border border-red-700']"
                  >
                    {{ polls.message.text }}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { usePolls } from "../stores";
import { useEvents } from "../stores/events.store";
import { useAdminUpdates } from "../composables/useAdminUpdates";

const route = useRoute();
const polls = usePolls();
const events = useEvents();

const isLoading = ref(false);
const event = ref(null as any);
const eventId = route.params.eventId as string;

const { lastMessage, isConnected } = useAdminUpdates(eventId);

onMounted(async () => {
    isLoading.value = true;
    event.value = await events.fetchEventById(eventId);

    // Set the current event ID in polls store
    polls.currentEventId = eventId;

    // Fetch polls for this event
    await polls.fetchPolls();
    isLoading.value = false;
});

// Watch for real-time updates from WebSocket
watch(lastMessage, async message => {
    if (!message) return;

    console.log("Processing real-time update:", message.type);

    if (message.type === "event_activated" || message.type === "event_deactivated") {
        // Update event active status
        if (message.data.event) {
            event.value = message.data.event;
        }
    } else if (message.type === "poll_activated") {
        // Update active poll
        if (message.data.event) {
            event.value = message.data.event;
        }
    }
});

const handleFormSubmit = async () => {
    await polls.upsertPoll();
    await polls.fetchPolls();
};
</script>
