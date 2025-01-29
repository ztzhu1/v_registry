<script setup>
import { onMounted } from "vue";
import { useTheme } from "vuetify";
import { currPath, pathFocus, pathRef } from "../status";

onMounted(() => {
  window.addEventListener("keydown", (event) => {
    if (event.code == "KeyP" && event.ctrlKey) {
      event.preventDefault();
      pathRef.value.focus();
    }
  });
});

const theme = useTheme();

function toggleTheme() {
  theme.global.name.value = isDark() ? "light" : "dark";
}

function isDark() {
  return theme.global.current._value.dark;
}

function copyItem() {}

function deleteItem() {}

function customFilter(value, query, item) {
  let pattern = query
    .toLowerCase()
    .split("")
    .reduce(function (a, b) {
      return a + ".*" + b;
    });
  let match = new RegExp(pattern).test(value.toLowerCase());
  return value != null && query != null && typeof value === "string" && match;
}

function pathUpdate(event) {
  console.log(currPath.value);
}
</script>

<template>
  <v-card>
    <v-layout>
      <v-app-bar>
        <template v-slot:prepend>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>v-registry </v-app-bar-title>

        <v-spacer />

        <span v-cloak style="white-space: break-spaces" v-html="`current path:  `"></span>
        <v-responsive>
          <v-spacer />
          <v-autocomplete
            ref="pathRef"
            variant="underlined"
            v-model="currPath"
            prepend-inner-icon="mdi-airplane"
            auto-select-first
            @focus="pathFocus = true"
            @blur="pathFocus = false"
            @update:modelValue="pathUpdate"
            :items="['/California', '/Colorado', '/Florida']"
            :custom-filter="customFilter"
          ></v-autocomplete>

          <v-spacer></v-spacer>
        </v-responsive>

        <v-btn icon @click="copyItem">
          <v-icon>mdi-content-copy</v-icon>
          <v-tooltip activator="parent">copy</v-tooltip>
        </v-btn>

        <v-btn icon @click="deleteItem">
          <v-icon>mdi-trash-can </v-icon>
          <v-tooltip activator="parent">delete</v-tooltip>
        </v-btn>

        <v-btn icon @click="toggleTheme">
          <v-icon v-if="isDark()">mdi-brightness-4</v-icon>
          <v-icon v-else>mdi-brightness-5</v-icon>
          <v-tooltip activator="parent">brightness/dark</v-tooltip>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
          <v-tooltip activator="parent">more</v-tooltip>
        </v-btn>
      </v-app-bar>

      <v-main>
        <v-container fluid> </v-container>
      </v-main>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  name: "ToolBar",

  data: () => ({}),
};
</script>
