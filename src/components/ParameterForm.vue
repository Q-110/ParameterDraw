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
      <label v-for="field in activeGroup.fields" :key="field.key" class="field-row">
        <span>{{ field.label }}</span>
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
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FieldDefinition, FieldGroup, ParamKey, PartId, TemplateParameters } from '../types'

defineProps<{
  groups: FieldGroup[]
  activeGroupId: PartId
  activeGroup: FieldGroup
  params: TemplateParameters
}>()

const emit = defineEmits<{
  'update:activeGroupId': [value: PartId]
  updateParam: [key: ParamKey, value: number]
  focusField: [field: FieldDefinition]
  blurField: []
}>()


/**
 * 上报分组参数变化
 * @param key   参数键
 * @param event   输入事件
 */
function updateParam(key: ParamKey, event: Event) {
  emit('updateParam', key, Number((event.target as HTMLInputElement).value))
}
</script>
