<template>
  <div class="space-y-4">
    <div
      v-if="events.length === 0"
      class="bg-gray-100 rounded-lg p-8 text-center border border-gray-200"
    >
      <p class="text-gray-600 text-lg">
        Pas d'événement disponible pour le moment.
      </p>
    </div>

    <div
      v-for="event in events"
      :key="event.id"
      class="bg-white hover:bg-gray-50 rounded-lg p-6 cursor-pointer transition-colors border border-gray-200 hover:border-brand"
      @click="$emit('select', event)"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-1">
            {{ event.name }}
          </h2>
        </div>
        <div
          v-if="event.active"
          class="flex items-center gap-2"
        >
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span class="text-green-700 text-sm font-semibold">LIVE</span>
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
}>();

defineEmits<{
    select: [event: Event]
}>();
</script>
