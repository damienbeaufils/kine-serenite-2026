<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const heading = computed(() => props.error.status === 404 ? 'Page introuvable' : 'Une erreur est survenue')

useSeoMeta({ title: () => pageTitle(heading.value) })
// useRobotsRule throws here: @nuxtjs/robots skips populating its request context for any
// path starting with "/__" (see injectContext.js), which is exactly the internal route this
// page prerenders from.
useHead({ meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <UApp>
    <NuxtLayout>
      <ServicePage :title="heading">
        <div class="v-col col-12 text-center">
          <p>La page demandée n’existe pas ou a été déplacée.</p>
          <NuxtLink to="/">
            Retour à l’accueil
          </NuxtLink>
        </div>
      </ServicePage>
    </NuxtLayout>
  </UApp>
</template>
