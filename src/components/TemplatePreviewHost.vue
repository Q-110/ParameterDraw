<template>
  <component
    :is="template.preview.component"
    v-bind="previewProps"
    :focus="focus"
    :active-part-id="activePartId"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps([
  'template',
  'params',
  'derived',
  'focus',
  'activePartId',
])

const previewProps = computed(() =>
  props.template.preview.makeProps(
    props.params,
    props.derived,
    props.template.groups,
  ),
)
</script>
