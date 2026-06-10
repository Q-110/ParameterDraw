<template>
  <section class="panel basic-panel">
    <h2>基础设置</h2>
    <div class="compact-form two-columns">
      <label v-for="field in fields" :key="field.key">
        <span>{{ field.label }}</span>
        <div class="unit-input">
          <input
            :value="params[field.key]"
            type="number"
            :step="field.step ?? 1"
            @input="updateParam(field.key, $event)"
          />
          <em>{{ field.unit }}</em>
        </div>
      </label>
    </div>
  </section>
</template>

<script setup>
defineProps(['fields', 'params'])

const emit = defineEmits(['updateParam'])

/**
 * 上报基础参数变化
 * @param key   参数键
 * @param event   输入事件
 */
function updateParam(key, event) {
  emit('updateParam', key, Number(event.target.value))
}
</script>
