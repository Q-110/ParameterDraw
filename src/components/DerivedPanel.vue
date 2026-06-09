<template>
  <section class="panel derived-panel">
    <h2>派生值</h2>
    <div class="derived-sections">
      <div v-for="section in sections" :key="section.id">
        <h3 v-if="section.title">{{ section.title }}</h3>
        <dl>
          <template v-for="field in section.fields" :key="field.key">
            <dt>{{ field.label }}</dt>
            <dd>{{ formatValue(derived[field.key], field) }}</dd>
          </template>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DerivedFieldDefinition, DerivedSectionDefinition, ParameterValue } from '../types'

defineProps<{
  sections: DerivedSectionDefinition[]
  derived: Record<string, ParameterValue>
}>()

/**
 * 格式化模板派生值
 * @param value   派生值
 * @param field   展示配置
 */
function formatValue(value: ParameterValue, field: DerivedFieldDefinition) {
  const text = typeof value === 'number' && !Number.isInteger(value)
    ? value.toFixed(field.decimals ?? 2)
    : String(value)
  return field.unit ? `${text} ${field.unit}` : text
}
</script>
