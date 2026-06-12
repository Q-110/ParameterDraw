<template>
  <section class="panel derived-panel">
    <h2>对应高程推算</h2>
    <div class="derived-sections">
      <template v-for="section in sections" :key="section.id">
        <article
          v-for="field in section.fields"
          :key="field.key"
          class="result-card elevation-result-card"
        >
          <span>{{ field.label }}</span>
          <strong>{{ formatValue(derived[field.key], field) }}</strong>
        </article>
      </template>
    </div>
  </section>
</template>

<script setup>
defineProps(['sections', 'derived'])

/**
 * 格式化模板派生值
 * @param value   派生值
 * @param field   展示配置
 */
function formatValue(value, field) {
  const text =
    typeof value === 'number' && !Number.isInteger(value)
      ? value.toFixed(field.decimals ?? 2)
      : String(value)
  return field.unit ? `${text} ${field.unit}` : text
}
</script>
