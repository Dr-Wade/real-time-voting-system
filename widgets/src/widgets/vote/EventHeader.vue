<template>
  <div class="space-y-4">
    <button
      class="flex items-end gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
      @click="$emit('back')"
    >
      <span class="text-xl">←</span>
      Retour
    </button>

    <div class="bg-white rounded-lg p-6 border border-gray-200">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ event.name }}
        </h2>
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
    event: Event
}>();

defineEmits<{
    back: []
}>();
</script>
