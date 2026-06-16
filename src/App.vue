<template>
  <Transition :name="pageTransitionName" mode="out-in">
    <TemplateHome
      v-if="currentPage === 'home'"
      :templates="templateDefinitions"
      :current-template-id="templateId"
      @open-template="openTemplate"
    />

    <main v-else class="app-shell">
      <SchemePanel
        :scheme-name="schemeName"
        :run-state="runState"
        :drawing-progress="drawingProgress"
        :validation-error-count="validationErrors.length"
        :template-id="templateId"
        :templates="templateDefinitions"
        @update:scheme-name="schemeName = $event"
        @update:template-id="switchTemplate"
        @new="newScheme"
        @open="openScheme"
        @save="saveScheme"
        @save-as="saveSchemeAs"
        @run="runDrawing"
        @home="currentPage = 'home'"
      />

      <aside class="layout-column sidebar">
        <ProjectSettings
          :project="project"
          :output="output"
          @update-project="updateProject"
          @select-output-directory="selectOutputDirectory"
        />
      </aside>

      <section class="layout-column center-column">
        <section class="parameter-area">
          <ParameterForm
            :groups="currentTemplate.groups"
            :active-group-id="activeGroupId"
            :active-group="activeGroup"
            :params="params"
            :derived="derived"
            @update:active-group-id="activeGroupId = $event"
            @update-param="updateParam"
            @focus-field="setFieldFocus"
            @blur-field="clearFieldFocus"
          />

          <ValidationPanel
            v-if="validationErrors.length > 0"
            :errors="validationErrors"
          />
        </section>
      </section>

      <section class="layout-column right-column">
        <section class="panel preview-panel">
          <TemplatePreviewHost
            :template="currentTemplate"
            :params="params"
            :derived="derived"
            :focus="focused"
            :active-part-id="activeGroupId"
          />
        </section>
      </section>

      <section class="bottom-panels">
        <BasicParameterPanel
          :fields="currentTemplate.basicFields"
          :params="params"
          :project="project"
          @update-param="updateParam"
          @update-project="updateProject"
        />
        <DerivedPanel
          :sections="currentTemplate.derivedSections"
          :derived="derived"
        />
      </section>
    </main>
  </Transition>
</template>

<script setup>
import BasicParameterPanel from './components/BasicParameterPanel.vue'
import DerivedPanel from './components/DerivedPanel.vue'
import ParameterForm from './components/ParameterForm.vue'
import ProjectSettings from './components/ProjectSettings.vue'
import SchemePanel from './components/SchemePanel.vue'
import TemplatePreviewHost from './components/TemplatePreviewHost.vue'
import TemplateHome from './components/TemplateHome.vue'
import ValidationPanel from './components/ValidationPanel.vue'
import { useSchemeWorkspace } from './composables/useSchemeWorkspace'
import { computed, ref } from 'vue'

const currentPage = ref('home')
const pageTransitionName = computed(() =>
  currentPage.value === 'home' ? 'page-switch-home' : 'page-switch-workspace',
)

const {
  activeGroup,
  activeGroupId,
  clearFieldFocus,
  currentTemplate,
  derived,
  drawingProgress,
  focused,
  newScheme,
  openScheme,
  output,
  params,
  project,
  runDrawing,
  runState,
  saveScheme,
  saveSchemeAs,
  schemeName,
  selectOutputDirectory,
  setFieldFocus,
  switchTemplate,
  templateDefinitions,
  templateId,
  updateParam,
  updateProject,
  validationErrors,
} = useSchemeWorkspace()

/**
 * 使用首页选中的模板进入参数编辑
 * @param templateId
 */
function openTemplate(templateId) {
  switchTemplate(templateId)
  currentPage.value = 'workspace'
}
</script>
