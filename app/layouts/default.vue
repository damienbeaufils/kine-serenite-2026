<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-[1_0_auto]">
      <div class="v-container">
        <div class="v-row justify-center">
          <div class="v-col col-12 xl:col-8">
            <slot />
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>
