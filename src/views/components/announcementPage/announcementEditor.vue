<script setup lang="ts">

// const model = defineModel()
const model = ref<string>('');

// props
interface Props {
    placeholder: string
}
// emits
interface Emits {
    (event: 'updateContent', content: string): void
    (event: 'imgAdd', file: File): void
}

import { ref } from 'vue'
const content = ref<string>('')
</script>
<template>
    <div>
        <textarea v-model="model"/>
    </div>
</template>