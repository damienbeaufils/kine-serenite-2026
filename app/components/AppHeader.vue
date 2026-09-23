<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

interface NavLink {
  label: string
  to: string
  menuLines: string[]
}

const links: NavLink[] = [
  { label: 'Accueil', to: '/', menuLines: ['Accueil'] },
  { label: 'Détail des techniques', to: '/#techniques', menuLines: ['Détail des techniques'] },
  { label: 'À propos', to: '/#a-propos', menuLines: ['À propos'] },
  {
    label: 'Politiques d’annulation et de confidentialité',
    to: '/politiques-annulation-confidentialite/',
    menuLines: ['Politiques d’annulation', 'et de confidentialité']
  }
]

const route = useRoute()
const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, '') || '/'

// Exact match on path and hash, like Vuetify's nav buttons: anchor links are never active, and Accueil is not active on /#techniques.
function isActive(to: unknown): boolean {
  return typeof to === 'string' && !to.includes('#') && !route.hash && withoutTrailingSlash(route.path) === withoutTrailingSlash(to)
}

function linkFor(to: unknown): NavLink {
  return links.find(link => link.to === to) ?? links[0]!
}

// Choosing an item leaves focus on the body, as in Vuetify; Reka would return it to the trigger, whose focus overlay then stays on.
let itemSelected = false
const menuItems: DropdownMenuItem[] = links.map(link => ({
  label: link.label,
  to: link.to,
  onSelect: () => {
    itemSelected = true
  }
}))

function onCloseAutoFocus(event: Event) {
  if (itemSelected) {
    event.preventDefault()
  }
  itemSelected = false
}
</script>

<template>
  <header class="relative z-0 grow bg-white">
    <div class="flex h-[100px] items-center px-4 py-1">
      <NuxtLink
        to="/"
        class="-ml-12 shrink-0 no-underline"
      >
        <img
          src="/img/virginie_dang_massotherapeute_logo_2026.png"
          :alt="IMAGE_ALT.logo"
          width="308"
          height="176"
          class="block h-[120px] w-[308px] max-w-none object-contain"
        >
      </NuxtLink>

      <div class="grow" />

      <nav class="hidden lg:flex">
        <UButton
          v-for="(link, index) in links"
          :key="link.to"
          :to="link.to"
          :active="isActive(link.to)"
          :class="index < links.length - 1 ? 'mr-5' : ''"
        >
          {{ link.label }}
        </UButton>
      </nav>

      <UDropdownMenu
        :items="menuItems"
        :modal="false"
        :content="{ side: 'bottom', align: 'end', sideOffset: -48, collisionPadding: 12, onCloseAutoFocus }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-mdi-menu"
          aria-label="Menu"
          class="-mr-3 size-12 min-w-0 justify-center rounded-full p-0 text-[rgba(0,0,0,0.54)] data-[state=open]:before:opacity-[0.24] lg:hidden"
          :ui="{ leadingIcon: 'size-6' }"
        />

        <template #item="{ item }">
          <span
            class="relative inline-flex h-9 items-center rounded-[4px] px-4 text-sm font-medium tracking-[0.0892857143em] indent-[0.0892857143em] text-kine-green uppercase before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 group-data-highlighted:before:opacity-[0.08]"
            :class="isActive(item.to) ? 'before:opacity-[0.18]' : ''"
          >
            <span class="leading-[normal]">
              <template
                v-for="(line, index) in linkFor(item.to).menuLines"
                :key="line"
              >
                <br v-if="index > 0">{{ line }}
              </template>
            </span>
          </span>
        </template>
      </UDropdownMenu>
    </div>
  </header>
</template>
