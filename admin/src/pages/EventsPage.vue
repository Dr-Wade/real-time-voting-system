<template>
  <div class="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex flex-col">
    <nav class="bg-slate-950 border-b border-slate-700 shadow-lg">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">V</span>
            </div>
            <h1 class="text-xl font-bold text-white">
              Voting Admin
            </h1>
          </div>
          <div class="text-sm text-slate-400">
            Events
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-1 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Events List Section -->
          <div class="space-y-6">
            <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6">
              <h3 class="text-lg font-semibold text-white mb-4">
                Events List
              </h3>

              <div
                v-if="events.isFetchingEvents"
                class="text-slate-400 text-sm"
              >
                Loading events...
              </div>

              <div
                v-else-if="events.list.length === 0"
                class="text-slate-400 text-sm"
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
                  class="block px-3 py-2 rounded-lg transition bg-slate-700 text-slate-300 hover:bg-blue-600 hover:text-white"
                  :to="{ name: 'event-detail', params: { eventId: event.id } }"
                >
                  <div class="font-medium truncate">
                    {{ event.name }}
                  </div>
                  <div class="text-xs opacity-75">
                    {{ event.type }}
                  </div>
                </router-link>
              </div>
            </div>

            <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6">
              <h3 class="text-lg font-semibold text-white mb-4">
                Info
              </h3>
              <p class="text-sm text-slate-400">
                Create events to organize and manage polls. Click on an event to manage its polls.
              </p>
            </div>
          </div>
          <!-- Create Event Section -->
          <div class="lg:col-span-2">
            <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
              <h2 class="text-2xl font-bold text-white mb-6">
                Create New Event
              </h2>

              <form
                class="space-y-6"
                @submit.prevent="events.createEvent"
              >
                <div>
                  <label
                    class="block text-sm font-medium text-slate-300 mb-2"
                    for="name"
                  >
                    Event Name
                  </label>
                  <input
                    id="name"
                    v-model="events.form.name"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter event name"
                    required
                    type="text"
                  >
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-slate-300 mb-2"
                    for="type"
                  >
                    Event Type
                  </label>
                  <input
                    id="type"
                    v-model="events.form.type"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., Conference, Webinar, Workshop"
                    required
                    type="text"
                  >
                </div>

                <div class="flex gap-3 pt-4">
                  <button
                    class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition font-semibold"
                    :disabled="events.isLoading"
                    type="submit"
                  >
                    {{ events.isLoading ? "Creating..." : "Create Event" }}
                  </button>
                  <button
                    class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold"
                    type="button"
                    @click="events.resetForm"
                  >
                    Reset
                  </button>
                </div>

                <div
                  v-if="events.message.text"
                  :class="['p-4 rounded-lg', events.message.type === 'success' ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-red-900 text-red-200 border border-red-700']"
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
import { useEvents } from "../stores/events.store";

const events = useEvents();

onMounted(() => {
    events.fetchEvents();
});
</script>
