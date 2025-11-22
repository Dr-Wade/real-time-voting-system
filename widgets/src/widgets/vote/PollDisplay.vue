<template>
  <div
    v-if="!activePoll"
    class="bg-slate-700 rounded-lg p-8 text-center"
  >
    <p class="text-slate-300 text-lg">
      Waiting for the next poll...
    </p>
  </div>

  <div
    v-else
    class="space-y-6"
  >
    <div class="bg-slate-700 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-semibold text-white">
        {{ activePoll.title }}
      </h3>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
interface Poll {
    id: string
    title: string
}

defineProps<{
    activePoll: Poll | null
}>();
</script>
