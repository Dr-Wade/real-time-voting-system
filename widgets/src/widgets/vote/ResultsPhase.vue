<template>
  <div class="space-y-4">
    <div class="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
      <p class="text-green-400 font-semibold">
        ✓ Your vote has been recorded
      </p>
    </div>

    <div class="space-y-4">
      <div
        v-for="option in options"
        :key="option.id"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <p class="text-white font-medium">
            {{ option.title }}
          </p>
          <p class="text-slate-400 text-sm">
            {{ option.score || 0 }} votes
          </p>
        </div>
        <div class="bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            class="bg-linear-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
            :style="{ width: getTotalVotes() > 0 ? ((option.score || 0) / getTotalVotes() * 100) + '%' : '0%' }"
          />
        </div>
      </div>
    </div>

    <p class="text-slate-400 text-center text-sm mt-6">
      Total votes: {{ getTotalVotes() }}
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
}>();

const getTotalVotes = (): number => {
    return props.options.reduce((sum, option) => sum + (option.score || 0), 0);
};
</script>
