<script setup lang="ts">
usePageSeo({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/' })
</script>

<template>
  <div>
    <HomeIntroduction class="mb-5" />
    <HomeRates class="mb-10" />
    <HomeAbout class="mb-10" />
    <HomeServices />
  </div>
</template>
