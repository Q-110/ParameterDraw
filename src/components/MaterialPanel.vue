<template>
  <section class="panel material-panel">
    <h2>底板材料与比值</h2>
    <dl>
      <template v-for="field in fields" :key="field.key">
        <dt>{{ field.label }}</dt>
        <dd>{{ formatValue(derived[field.key], field) }}</dd>
      </template>
    </dl>
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
