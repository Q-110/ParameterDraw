<template>
  <section class="panel log-panel">
    <div class="title-row">
      <h2>出图日志</h2>
      <button type="button" @click="emit('clear')">清空</button>
    </div>
    <pre>{{ logs.length ? logs.join('\n') : '等待手动执行出图...' }}</pre>
  </section>
</template>

<script setup>
defineProps(['logs'])

const emit = defineEmits(['clear'])
</script>
