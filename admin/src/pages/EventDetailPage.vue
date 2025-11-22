<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <router-link
              class="flex items-center gap-2 hover:opacity-80 transition"
              to="/"
            >
              <div class="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">V</span>
              </div>
              <h1 class="text-xl font-bold text-gray-900">
                Voting Admin
              </h1>
            </router-link>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-sm text-gray-500">
              Event Details
            </div>
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-1 overflow-y-auto">
      <div
        v-if="isLoading"
        class="flex items-center justify-center h-full"
      >
        <div class="text-gray-500">
          Loading event...
        </div>
      </div>

      <div
        v-else-if="event"
        class="max-w-full"
      >
        <!-- Event Header -->
        <div
          class="border-b border-gray-200 shadow-sm"
          :class="event.active ? 'bg-success' : 'bg-white'"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-start gap-4">
                <div>
                  <h1 class="text-3xl font-bold text-gray-900">
                    {{ event.name }}
                  </h1>
                  <p class="text-gray-600 mt-2">
                    Type: <span class="text-gray-700 font-medium">{{ event.type }}</span>
                  </p>
                </div>
                <div
                  v-if="event.active"
                  class="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg"
                >
                  <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span class="text-green-700 font-semibold text-sm">LIVE</span>
                </div>
              </div>
              <router-link
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-semibold"
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
                  : 'bg-brand hover:bg-brand-dark text-white'"
                @click="events.toggleEventActive(event.id)"
              >
                {{ event.active ? "Deactivate Event" : "Activate Event" }}
              </button>
              <button
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                @click="handleDeleteEvent"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>

        <!-- Polls Management Section -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Sidebar with Polls List -->
            <aside class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-semibold text-gray-900">
                    Polls
                  </h2>
                  <button
                    class="p-2 bg-brand hover:bg-brand-dark text-white rounded-lg transition font-semibold"
                    title="Create new poll"
                    @click="polls.goToCreate"
                  >
                    +
                  </button>
                </div>

                <div
                  v-if="polls.isFetchingPolls"
                  class="text-gray-500 text-sm"
                >
                  Loading polls...
                </div>

                <div
                  v-else-if="polls.list.length === 0"
                  class="text-gray-500 text-sm"
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
                    :class="event.activePollId === poll.id
                      ? 'bg-success border-brand text-gray-700 ring-2 ring-success ring-opacity-50'
                      : polls.selected === poll.id
                        ? 'bg-gray-100 border-gray-300 text-gray-900'
                        : 'bg-gray-50 border-gray-200 text-gray-900'"
                  >
                    <button
                      class="w-full text-left px-3 py-2"
                      @click="polls.selectPoll(poll.id)"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <div class="font-medium truncate text-gray-900">
                            {{ poll.title }}
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ poll.options?.length ?? 0 }} options
                          </div>
                        </div>
                        <div
                          v-if="event.activePollId === poll.id"
                          class="ml-2 shrink-0 px-2 py-1 bg-green-200 border border-green-400 rounded text-green-700 text-xs font-semibold"
                        >
                          ACTIVE
                        </div>
                      </div>
                    </button>
                    <div class="flex gap-2 px-3 pb-2">
                      <button
                        v-if="event.activePollId !== poll.id"
                        class="flex-1 px-2 py-1 bg-brand hover:bg-brand-dark text-white text-xs rounded transition font-medium"
                        @click="events.setActivePoll(event.id, poll.id)"
                      >
                        Set Active
                      </button>
                      <button
                        v-else
                        class="flex-1 px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-900 text-xs rounded transition font-medium"
                        @click="events.clearActivePoll(event.id)"
                      >
                        Clear
                      </button>
                      <button
                        class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition font-medium"
                        @click="polls.deletePoll(poll.id)"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Main Content -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow border border-gray-200 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                  {{ polls.currentView === "create" ? "Create New Poll" : "Edit Poll" }}
                </h2>

                <form
                  class="space-y-6"
                  @submit.prevent="handleFormSubmit"
                >
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-2"
                      for="title"
                    >
                      Poll Title
                    </label>
                    <input
                      id="title"
                      v-model="polls.form.title"
                      class="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#30715e] focus:border-transparent transition"
                      placeholder="Enter poll title"
                      required
                      type="text"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">
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
                          class="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#30715e] focus:border-transparent transition"
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
                      class="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#30715e] rounded-lg transition font-medium border border-gray-300"
                      type="button"
                      @click="polls.addOption"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div class="flex gap-3 pt-4">
                    <button
                      class="flex-1 px-6 py-3 bg-brand hover:bg-brand-dark disabled:bg-gray-300 disabled:opacity-50 text-white rounded-lg transition font-semibold"
                      :disabled="polls.isLoading"
                      type="submit"
                    >
                      {{ polls.isLoading ? (polls.currentView === "create" ? "Creating..." : "Updating...") : (polls.currentView === "create" ? "Create Poll" : "Update Poll") }}
                    </button>
                    <button
                      class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-semibold"
                      type="button"
                      @click="polls.resetForm"
                    >
                      Reset
                    </button>
                  </div>

                  <div
                    v-if="polls.message.text"
                    :class="['p-4 rounded-lg', polls.message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200']"
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
import { useRoute, useRouter } from "vue-router";
import { usePolls } from "../stores";
import { useEvents } from "../stores/events.store";
import { useAdminUpdates } from "../composables/useAdminUpdates";

const route = useRoute();
const router = useRouter();
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

const handleDeleteEvent = async () => {
    await events.deleteEvent(eventId);
    // Redirect to home page after deletion
    router.push("/");
};

const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/login");
};
</script>
