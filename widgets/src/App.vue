<template>
  <div
    id="app"
    class="bg-gray-300 flex min-h-screen flex-col gap-5 justify-center items-center"
  >
    <MyVote v-bind="{ personid: personID, token }" />
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import MyVote from "./widgets/vote/MyVote.vue";
import { md5 } from "js-md5";

const personID = computed(() => "25107");
const token = computed(() => md5(personID.value + "mysupersecretsalt"));
</script>


