<script setup lang="ts">
const { public: { buildYear } } = useRuntimeConfig()

// Prerendered with the build year; updated after hydration so the HTML and the first client render match.
const year = ref(buildYear)
onMounted(() => {
  year.value = new Date().getFullYear()
})
</script>

<template>
  <footer class="sticky bottom-0 z-[3] flex flex-wrap items-center overflow-hidden bg-kine-light-grey px-4 py-1.5">
    <!-- Sticky, not fixed, so the page ends below the footer at any wrapped height (40px, or 92px at 1024px). overflow-hidden stops the row's -12px margins from pushing it out below the footer and lengthening the page. -->
    <div class="v-row justify-center">
      <UButton
        variant="ghost"
        to="https://www.facebook.com/virginiedang.massotherapeute"
        target="_blank"
        aria-label="Facebook"
        class="my-2 p-0 sm:mx-5"
      >
        <UIcon
          name="i-mdi-facebook"
          class="size-6"
        />
      </UButton>
      <UButton
        color="neutral"
        variant="ghost"
        to="https://www.gorendezvous.com/virginiedang"
        target="_blank"
        class="my-2 p-0 sm:mx-5"
      >
        <img
          src="/img/LogoFull_GOrendezvous.png"
          alt="Prendre un rendez-vous"
          width="500"
          height="153"
          class="block h-[30px] w-[100px] object-cover"
        >
      </UButton>
      <UButton
        variant="ghost"
        to="mailto:virginiedang.massotherapeute@gmail.com"
        aria-label="Courriel : virginiedang.massotherapeute@gmail.com"
        class="my-2 p-0 sm:mx-5"
      >
        <UIcon
          name="i-mdi-email"
          class="size-6"
        />
        <small class="hidden leading-[normal] sm:flex">&nbsp;virginiedang.massotherapeute@gmail.com</small>
      </UButton>
      <UButton
        variant="ghost"
        to="tel:4187901294"
        aria-label="Téléphone : 418-790-1294"
        class="my-2 p-0 sm:mx-5"
      >
        <UIcon
          name="i-mdi-phone"
          class="size-6"
        />
        <small class="hidden leading-[normal] sm:flex">&nbsp;418-790-1294</small>
      </UButton>
      <UButton
        color="neutral"
        variant="ghost"
        disabled
        class="my-2 hidden p-0 sm:mx-5 sm:flex"
      >
        <small class="leading-[normal]">&copy; 2021-{{ year }} - Virginie Dang</small>
      </UButton>
    </div>
  </footer>
</template>
