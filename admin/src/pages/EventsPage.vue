<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">V</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900">
              Voting Admin
            </h1>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-sm text-gray-500">
              Events
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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Events List Section -->
          <div class="space-y-6">
            <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Events List
              </h3>

              <div
                v-if="events.isFetchingEvents"
                class="text-gray-500 text-sm"
              >
                Loading events...
              </div>

              <div
                v-else-if="events.list.length === 0"
                class="text-gray-500 text-sm"
              >
                No events yet. Create one to get started!
              </div>

              <div
                v-else
                class="space-y-2"
              >
                <router-link
                  v-for="event in events.list"
                  :key="event.id"
                  class="block px-3 py-2 rounded-lg transition"
                  :class="event.active
                    ? 'bg-success text-gray-700 hover:bg-brand-dark hover:text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  :to="{ name: 'event-detail', params: { eventId: event.id } }"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium truncate">
                        {{ event.name }}
                      </div>
                      <div class="text-xs opacity-75">
                        {{ event.type }}
                      </div>
                    </div>
                    <div
                      v-if="event.active"
                      class="ml-2 shrink-0 w-2 h-2 bg-green-300 rounded-full"
                    />
                  </div>
                </router-link>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Info
              </h3>
              <p class="text-sm text-gray-600">
                Create events to organize and manage polls. Click on an event to manage its polls.
              </p>
            </div>
          </div>
          <!-- Create Event Section -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow border border-gray-200 p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">
                Create New Event
              </h2>

              <form
                class="space-y-6"
                @submit.prevent="events.createEvent"
              >
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2"
                    for="name"
                  >
                    Event Name
                  </label>
                  <input
                    id="name"
                    v-model="events.form.name"
                    class="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#30715e] focus:border-transparent transition"
                    placeholder="Enter event name"
                    required
                    type="text"
                  >
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-2"
                    for="type"
                  >
                    Event Type
                  </label>
                  <input
                    id="type"
                    v-model="events.form.type"
                    class="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#30715e] focus:border-transparent transition"
                    placeholder="e.g., Conference, Webinar, Workshop"
                    required
                    type="text"
                  >
                </div>

                <div class="flex gap-3 pt-4">
                  <button
                    class="flex-1 px-6 py-3 bg-brand hover:bg-brand-dark disabled:bg-gray-300 disabled:opacity-50 text-white rounded-lg transition font-semibold"
                    :disabled="events.isLoading"
                    type="submit"
                  >
                    {{ events.isLoading ? "Creating..." : "Create Event" }}
                  </button>
                  <button
                    class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-semibold"
                    type="button"
                    @click="events.resetForm"
                  >
                    Reset
                  </button>
                </div>

                <div
                  v-if="events.message.text"
                  :class="['p-4 rounded-lg', events.message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200']"
                >
                  {{ events.message.text }}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useEvents } from "../stores/events.store";

const router = useRouter();
const events = useEvents();

const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/login");
};

onMounted(() => {
    events.fetchEvents();
});
</script>
