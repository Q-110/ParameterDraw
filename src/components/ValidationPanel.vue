<template>
  <section class="panel validation-panel">
    <h2>跨字段校验</h2>
    <ul>
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>
  </section>
</template>

<script setup>
defineProps(['errors'])
</script>
