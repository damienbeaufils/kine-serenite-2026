<script setup lang="ts">
defineProps<{
  to?: string
  image: string
  width: number
  height: number
  alt: string
}>()

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <div class="v-col col-12 sm:col-4">
    <UCard
      :as="to ? NuxtLink : 'div'"
      :to="to"
      class="block text-inherit no-underline shadow-none! transition-shadow duration-[280ms] ease-vuetify hover:shadow-elevation-12!"
    >
      <div class="card-text text-kine-green">
        <img
          :src="image"
          :alt="alt"
          :width="width"
          :height="height"
          loading="lazy"
          decoding="async"
          class="block aspect-[3/2] w-full rounded-[4px] object-cover"
        >
        <h3 class="mt-2">
          <slot />
        </h3>
      </div>
    </UCard>
  </div>
</template>
