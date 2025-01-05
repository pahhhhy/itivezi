<script setup lang="ts">
import {ref} from "vue";
import DotsVertical from "vue-material-design-icons/DotsVertical.vue";

const isOpen = ref<boolean>(false)
</script>
<template>
  <div class="kebab-wrapper">
    <DotsVertical v-if="!isOpen" class="kebab" @click="isOpen=true"/>
    <div v-if="isOpen" class="menu" @click="isOpen=false">
      <slot></slot>
    </div>
    <div v-if="isOpen" class="other-area" @click="isOpen=false"></div>
  </div>
</template>
<style scoped>
.kebab-wrapper {
  position: relative;
  display: inline-block;
  aspect-ratio: 1;
  height: fit-content;
  width: 100%;
  cursor: pointer;
}

.kebab > .material-design-icon__svg {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.menu {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  padding: 0.25em;
  height: fit-content;
  width: fit-content;
  background-color: white;
  border: 1px solid black;
  z-index: 100;
}

.other-area {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 99;
}
</style>