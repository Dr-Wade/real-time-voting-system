<template>
  <div class="space-y-4">
    <div class="space-y-3">
      <div
        v-for="option in options"
        :key="option.id"
        class="rounded-lg p-4 cursor-pointer transition-colors border-2"
        :class="selectedOption === option.id ? 'border-brand bg-success' : 'bg-white border-gray-200 hover:bg-gray-50'"
        @click="$emit('select', option.id)"
      >
        <p class="text-gray-900 font-medium">
          {{ option.title }}
        </p>
      </div>
    </div>

    <button
      class="w-full bg-brand hover:bg-brand-dark disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors"
      :disabled="!selectedOption || isVoting"
      @click="$emit('vote')"
    >
      {{ isVoting ? "Envoi en cours..." : "Confirmer mon vote" }}
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
