<template>
  <div class="space-y-4">
    <button
      class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
      @click="$emit('back')"
    >
      <span class="text-xl">←</span>
      Back to Events
    </button>

    <div class="bg-slate-700 rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold text-white">
          {{ event.name }}
        </h2>
        <div
          v-if="event.active"
          class="flex items-center gap-2"
        >
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span class="text-green-400 text-sm font-semibold">LIVE</span>
        </div>
      </div>
      <p class="text-slate-400">
        {{ event.type }}
      </p>
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
