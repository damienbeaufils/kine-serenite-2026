<script setup lang="ts">
defineProps<{
  title?: string
  titleClass?: string
}>()
</script>

<template>
  <UCard class="bg-kine-light-grey">
    <div
      class="card-title relative -top-6 mx-5 justify-center rounded-[4px] bg-kine-green py-2 font-bold text-white sm:mx-15"
      :class="titleClass"
    >
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <slot />
  </UCard>
</template>
