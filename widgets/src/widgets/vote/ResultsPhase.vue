<template>
  <div class="space-y-4">
    <div
      v-if="props.canVote"
      class="bg-green-50 border border-green-200 rounded-lg p-4"
    >
      <p class="text-green-700 font-semibold">
        ✓ &nbsp; Ton vote a été enregistré
      </p>
    </div>

    <div class="space-y-4">
      <div
        v-for="option in options"
        :key="option.id"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <p class="text-gray-900 font-medium">
            {{ option.title }}
          </p>
          <p class="text-gray-600 text-sm">
            {{ option.score || 0 }} votes
          </p>
        </div>
        <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            class="bg-linear-to-r from-brand to-brand-dark h-full transition-all duration-500"
            :style="{ width: getTotalVotes() > 0 ? ((option.score || 0) / getTotalVotes() * 100) + '%' : '0%' }"
          />
        </div>
      </div>
    </div>

    <p class="text-gray-600 text-center text-sm mt-6">
      Nombre de votes : {{ getTotalVotes() }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface PollOption {
    id: string
    title: string
    score?: number
}

const props = defineProps<{
    options: PollOption[]
    canVote: boolean
}>();

const getTotalVotes = (): number => {
    return props.options.reduce((sum, option) => sum + (option.score || 0), 0);
};
</script>
