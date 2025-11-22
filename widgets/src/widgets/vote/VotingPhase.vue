<template>
  <div class="space-y-4">
    <div class="space-y-3">
      <div
        v-for="option in options"
        :key="option.id"
        class="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 cursor-pointer transition-colors border-2"
        :class="selectedOption === option.id ? 'border-blue-500' : 'border-transparent'"
        @click="$emit('select', option.id)"
      >
        <p class="text-white font-medium">
          {{ option.title }}
        </p>
      </div>
    </div>

    <button
      class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
      :disabled="!selectedOption || isVoting"
      @click="$emit('vote')"
    >
      {{ isVoting ? "Casting vote..." : "Cast Vote" }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface PollOption {
    id: string
    title: string
    score?: number
}

defineProps<{
    options: PollOption[]
    selectedOption: string | null
    isVoting: boolean
}>();

defineEmits<{
    select: [optionId: string]
    vote: []
}>();
</script>
