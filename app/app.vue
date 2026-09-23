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
  ogTitle: SITE_TITLE,
  ogDescription: SITE_DESCRIPTION
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
