<script setup lang="ts">
usePageSeo({
  title: pageTitle('Massage thaïlandais sur table'),
  description: 'Qu’est-ce que le massage thaïlandais sur table ? Pour qui ? Les bienfaits et ce qu’il faut aussi savoir. Prise de rendez-vous pour un massage thaïlandais sur table.',
  path: '/soins/massage-thailandais-sur-table/'
})
</script>

<template>
  <ServicePage title="Massage thaïlandais sur table">
    <div class="v-col col-12 sm:col-4">
      <img
        src="/img/services/massage_thailandais_1171.jpg"
        :alt="IMAGE_ALT['massage_thailandais_1171.jpg']"
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>
    <div class="v-col col-12 sm:col-4">
      <img
        src="/img/services/massage_thailandais_1215.jpg"
        :alt="IMAGE_ALT['massage_thailandais_1215.jpg']"
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>
    <div class="v-col col-12 sm:col-4">
      <img
        src="/img/services/massage_thailandais_1198.jpg"
        :alt="IMAGE_ALT['massage_thailandais_1198.jpg']"
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est ce que le massage thaïlandais sur table ?
      </h2>

      <p>
        Ce massage est normalement donné sur vêtements souples de type sport
        (legging, pantalon de sport, t-shirt sans motif).
      </p>
    </div>

    <div class="v-col col-12 sm:col-6">
      <img
        src="/img/services/massage_thailandais_1191.jpg"
        :alt="IMAGE_ALT['massage_thailandais_1191.jpg']"
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>
    <div class="v-col col-12 sm:col-6">
      <img
        src="/img/services/massage_thailandais_1233.jpg"
        :alt="IMAGE_ALT['massage_thailandais_1233.jpg']"
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Pour qui peut s’adresser ce soin ?
      </h3>
      <ul>
        <li>
          Pour les personnes qui préfèrent recevoir des soins habillés.
        </li>
      </ul>
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.75rem;
}

ul + p {
  margin-top: 1rem;
}
</style>
