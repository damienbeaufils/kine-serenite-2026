<script setup lang="ts">
defineProps<{
  rows: { duration: string, description: string, price: string }[]
}>()
</script>

<template>
  <div class="overflow-x-auto overflow-y-hidden">
    <table class="w-full border-separate border-spacing-0 bg-transparent leading-normal">
      <thead>
        <tr>
          <th class="h-12 border-b border-[rgba(0,0,0,0.12)] px-4 text-center text-[0.75rem] font-bold tracking-[0.05em] text-kine-green uppercase">
            Durée
          </th>
          <th class="h-12 border-b border-[rgba(0,0,0,0.12)] px-4 text-left text-[0.75rem] font-bold tracking-[0.05em] text-kine-green uppercase">
            Description
          </th>
          <th class="h-12 border-b border-[rgba(0,0,0,0.12)] px-4 text-right text-[0.75rem] font-bold tracking-[0.05em] text-kine-green uppercase">
            Tarif
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- The old hand-written rows had whitespace between them, which shows in the page text; <tr v-for> renders none, so each row ends with a space. -->
        <template
          v-for="(row, index) in rows"
          :key="row.duration"
        >
          <tr class="hover:bg-[#eeeeee]">
            <td
              class="h-12 px-4 align-middle text-[0.875rem] font-bold whitespace-nowrap text-kine-green"
              :class="index < rows.length - 1 ? 'border-b border-[rgba(0,0,0,0.12)]' : ''"
            >
              {{ row.duration }}
            </td>
            <td
              class="h-12 px-4 text-left align-middle text-[0.875rem] whitespace-normal text-kine-green"
              :class="index < rows.length - 1 ? 'border-b border-[rgba(0,0,0,0.12)]' : ''"
            >
              {{ row.description }}
            </td>
            <td
              class="h-12 px-4 text-right align-middle text-[0.875rem] font-bold whitespace-nowrap text-kine-green"
              :class="index < rows.length - 1 ? 'border-b border-[rgba(0,0,0,0.12)]' : ''"
            >
              {{ row.price }}
            </td>
          </tr>{{ ' ' }}
        </template>
      </tbody>
    </table>
  </div>
</template>
