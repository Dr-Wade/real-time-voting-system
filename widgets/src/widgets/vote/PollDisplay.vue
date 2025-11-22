<template>
  <div
    v-if="!activePoll"
    class="bg-gray-100 rounded-lg p-8 text-center border border-gray-200"
  >
    <p class="text-gray-600 text-lg">
      En attente du prochain vote...
    </p>
  </div>

  <div
    v-else
    class="space-y-6"
  >
    <div class="bg-white rounded-lg p-6 mb-6 border border-gray-200">
      <h3 class="text-xl font-semibold text-gray-900">
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
