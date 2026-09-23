<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <UCard>
    <div class="card-title mt-5 justify-center rounded-t-[4px] bg-kine-green text-center text-white">
      <h1 class="text-h5 font-bold sm:text-h4">
        {{ title }}
      </h1>
    </div>
    <div class="card-text p-5 text-black">
      <div class="v-row justify-center">
        <slot />
      </div>
    </div>
  </UCard>
</template>
