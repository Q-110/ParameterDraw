<template>
  <section class="panel form-panel">
    <nav class="group-tabs" aria-label="参数分组">
      <button
        v-for="group in groups"
        :key="group.id"
        type="button"
        :class="{ active: activeGroupId === group.id }"
        @click="emit('update:activeGroupId', group.id)"
      >
        {{ group.title }}
      </button>
    </nav>
    <div class="parameter-grid">
      <label
        v-for="field in activeGroup.fields"
        :key="field.key"
        :class="['field-row', { readonly: field.readonly }]"
      >
        <span>{{ field.label }}</span>
        <template v-if="field.readonly">
          <div class="unit-input">
            <input :value="formatDerivedText(derived[field.key], field)" readonly />
            <em>{{ field.unit }}</em>
          </div>
        </template>
        <template v-else>
          <div class="unit-input">
            <input
              :value="params[field.key]"
              type="number"
              step="0.01"
              @input="updateParam(field.key, $event)"
              @focus="emit('focusField', field)"
              @blur="emit('blurField')"
            />
            <em>{{ field.unit }}</em>
          </div>
        </template>
      </label>
    </div>
  </section>
</template>

<script setup>
defineProps(['groups', 'activeGroupId', 'activeGroup', 'params', 'derived'])

const emit = defineEmits([
  'update:activeGroupId',
  'updateParam',
  'focusField',
  'blurField',
])

/**
 * 上报分组参数变化
 * @param key   参数键
 * @param event   输入事件
 */
function updateParam(key, event) {
  emit('updateParam', key, Number(event.target.value))
}

/**
 * 格式化只读派生字段的数值文本   单位由 em 负责
 */
function formatDerivedText(value, field) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(field.decimals ?? 2)
  }
  return String(value ?? '')
}
</script>
