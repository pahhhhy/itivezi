<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
const Isbarger = ref(false)

const ClickBarger = (): void => {
  if (Isbarger.value) {
    Isbarger.value = false
  } else {
    Isbarger.value = true
  }
}
</script>

<template>
  <header>
    <img src="..\\assets\\itivezilogo.png" alt="" />
    <nav>
      <i v-if="!Isbarger" v-on:click="ClickBarger" class="bi bi-justify barger"></i>
      <i v-if="Isbarger" v-on:click="ClickBarger" class="bi bi-x-lg barger"></i>
    </nav>
  </header>
  <aside v-show="Isbarger">
    <ul>
      <li>
        <i class="bi bi-journals"></i>
        <RouterLink v-bind:to="{ name: 'AppTop' }" class="link">Top</RouterLink>
      </li>
      <li>
        <i class="bi bi-journals"></i>
        <RouterLink v-bind:to="{ name: 'orderpage' }" class="link">注文</RouterLink>
      </li>
      <li>
        <i class="bi bi-journals"></i>
        <RouterLink v-bind:to="{ name: 'orderpage' }" class="link">マイページ</RouterLink>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
body {
  position: relative;
}
header {
  height: 80px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-bottom: 3px solid black;
}
nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
.barger {
  font-size: 40px;
  color: greenyellow;
}
aside {
  height: 100%;
  width: 200px;
  position: fixed;
  border-right: 3px solid black;
  background-color: white;
  z-index: 1;
}
aside i {
  font-size: 20px;
  color: green;
}
aside ul {
  font-size: 18px;
  padding: 0;
  color: green;
}
aside li {
  list-style: none;
  padding: 10px 5px 10px 10px;
  border-top: 1px solid grey;
  border-bottom: 1px solid grey;
}
.link {
  text-decoration: none;
  color: black;
}
</style>
