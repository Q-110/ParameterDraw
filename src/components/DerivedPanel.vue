<template>
  <section class="panel derived-panel">
    <h2>派生值</h2>
    <div class="derived-sections">
      <div>
        <dl>
          <template v-for="[label, value] in elevationRows" :key="label">
            <dt>{{ label }}</dt>
            <dd>{{ value }}</dd>
          </template>
        </dl>
      </div>
      <div>
        <dl>
          <template v-for="[label, value] in geometryRows" :key="label">
            <dt>{{ label }}</dt>
            <dd>{{ value }}</dd>
          </template>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type DisplayRow = [string, string]

defineProps<{
  elevationRows: DisplayRow[]
  geometryRows: DisplayRow[]
}>()
</script>
