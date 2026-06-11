<template>
  <main class="app-shell">
    <aside class="layout-column sidebar">
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
      />

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

      <section class="center-bottom">
        <BasicParameterPanel
          :fields="currentTemplate.basicFields"
          :params="params"
          @update-param="updateParam"
        />
        <DerivedPanel
          :sections="currentTemplate.derivedSections"
          :derived="derived"
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
      <MaterialPanel
        :fields="currentTemplate.materialFields"
        :derived="derived"
      />
    </section>
  </main>
</template>

<script setup>
import BasicParameterPanel from './components/BasicParameterPanel.vue'
import DerivedPanel from './components/DerivedPanel.vue'
import MaterialPanel from './components/MaterialPanel.vue'
import ParameterForm from './components/ParameterForm.vue'
import ProjectSettings from './components/ProjectSettings.vue'
import SchemePanel from './components/SchemePanel.vue'
import TemplatePreviewHost from './components/TemplatePreviewHost.vue'
import ValidationPanel from './components/ValidationPanel.vue'
import { useSchemeWorkspace } from './composables/useSchemeWorkspace'

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
</script>
