<template>
  <component :is="Layout">
    <router-view />
  </component>
</template>

<script lang="ts" setup>
import {useRoute} from 'vue-router'
import {computed} from 'vue'
import BlankLayout from "@/layouts/BlankLayout.vue"

const route = useRoute()
const Layout = computed(() => route.meta.layout || BlankLayout)
</script>
