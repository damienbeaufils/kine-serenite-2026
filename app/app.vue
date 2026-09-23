<script setup lang="ts">
useHead({
  meta: [
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-title', content: SITE_TITLE }
  ]
})

useSeoMeta({
  ogType: 'website',
  ogSiteName: SITE_TITLE,
  ogLocale: 'fr_CA',
  ogImage: {
    url: `${SITE_URL}/img/virginie_dang_massage_2026.png`,
    width: 1531,
    height: 532,
    type: 'image/png',
    alt: HERO_ALT
  },
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
