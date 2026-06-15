<template>
  <section class="panel basic-panel">
    <h2>基础设置</h2>
    <div class="basic-parameter-groups">
      <section class="parameter-subgroup" aria-label="材料类型">
        <div class="compact-form three-columns">
          <label v-for="field in materialFields" :key="field.key">
            <span>{{ field.label }}</span>
            <input
              :value="project[field.key]"
              @input="updateProject(field.key, $event)"
            />
          </label>
        </div>
      </section>
      <section class="parameter-subgroup" aria-label="基础参数">
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
    </div>
  </section>
</template>

<script setup>
defineProps(['fields', 'params', 'project'])

const emit = defineEmits(['updateParam', 'updateProject'])

const materialFields = [
  { key: '主材类型', label: '主材类型' },
  { key: '垫层类型1', label: '垫层类型1' },
  { key: '垫层类型2', label: '垫层类型2' },
]

/**
 * 上报基础参数变化
 * @param key   参数键
 * @param event   输入事件
 */
function updateParam(key, event) {
  emit('updateParam', key, Number(event.target.value))
}

/**
 * 上报材料类型变化
 * @param key   项目属性键
 * @param event   输入事件
 */
function updateProject(key, event) {
  emit('updateProject', key, event.target.value)
}
</script>
