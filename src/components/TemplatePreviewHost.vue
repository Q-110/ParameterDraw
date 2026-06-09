<template>
  <component
    :is="template.preview.component"
    v-bind="previewProps"
    :focus="focus"
    :active-part-id="activePartId"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FocusTarget, PartId, TemplateDefinition, TemplateParameters } from '../types'

const props = defineProps<{
  template: TemplateDefinition
  params: TemplateParameters
  derived: Record<string, string | number | boolean>
  focus: FocusTarget | null
  activePartId: PartId
}>()

const previewProps = computed(() => props.template.preview.makeProps(
  props.params,
  props.derived,
  props.template.groups,
))
</script>
