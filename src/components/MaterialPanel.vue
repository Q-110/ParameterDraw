<template>
  <section class="panel material-panel">
    <h2>底板材料</h2>
    <div class="material-results">
      <article
        v-for="field in fields"
        :key="field.key"
        class="result-card material-result-card"
      >
        <span>{{ field.label }}</span>
        <strong>{{ formatValue(derived[field.key], field) }}</strong>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps(['fields', 'derived'])

function formatValue(value, field) {
  if (typeof value === 'number') {
    const text = Number.isInteger(value) ? String(value) : value.toFixed(field.decimals ?? 2)
    return field.unit ? `${text} ${field.unit}` : text
  }
  return String(value ?? '')
}
</script>
