<template>
  <div class="space-y-4">
    <div
      v-if="isLoading"
      class="flex justify-center items-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>

    <div
      v-else-if="events.length === 0"
      class="bg-slate-700 rounded-lg p-8 text-center"
    >
      <p class="text-slate-300 text-lg">
        No active events available
      </p>
    </div>

    <div
      v-for="event in events"
      :key="event.id"
      class="bg-slate-700 hover:bg-slate-600 rounded-lg p-6 cursor-pointer transition-colors"
      @click="$emit('select', event)"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-white mb-1">
            {{ event.name }}
          </h2>
          <p class="text-slate-400 text-sm">
            {{ event.type }}
          </p>
        </div>
        <div
          v-if="event.active"
          class="flex items-center gap-2"
        >
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span class="text-green-400 text-sm font-semibold">LIVE</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Event {
    id: string
    name: string
    type: string
    active: boolean
    activePoll: { id: string; title: string } | null
}

defineProps<{
    events: Event[]
    isLoading: boolean
}>();

defineEmits<{
    select: [event: Event]
}>();
</script>
