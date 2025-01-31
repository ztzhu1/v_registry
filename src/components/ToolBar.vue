<script setup>
import { onMounted } from "vue";
import { useTheme } from "vuetify";
import { currSession, pathFocus, pathRef, selected, candidateSessions } from "../status";
import { switchAndRefresh, currPath, currUser } from "../database.js";

onMounted(() => {
  window.addEventListener("keydown", (event) => {
    if (event.code == "KeyP" && event.ctrlKey) {
      event.preventDefault();
      pathRef.value.focus();
    } else if (event.code == "KeyO" && event.ctrlKey) {
      event.preventDefault();
      goBack();
    } else if (
      (event.code == "KeyD" || event.code == "Delete") &&
      selected.value.length > 0
    ) {
      event.preventDefault();
      deleteItem();
    } else if (event.code == "KeyC" && selected.value.length > 0) {
      event.preventDefault();
      copyItem();
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

function goBack() {
  if (currSession.value == "/") {
    return;
  }
  if (currPath.value == "") {
    switchAndRefresh(null);
  } else {
    let path = currPath.value.split("/");
    if (path.length == 1) {
      currPath.value = "";
      switchAndRefresh(`/${currUser.value}`);
    } else {
      path = path.slice(0, path.length - 1);
      currPath.value = path.join("/");
      switchAndRefresh(`/${currUser.value}/${currPath.value}`);
    }
  }
  if (pathFocus.value) {
    pathRef.value.blur();
    pathRef.value.focus();
  }
}

function copyItem() {
  console.log(2);
}

function deleteItem() {
  console.log(1);
}

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
  switchAndRefresh(currSession.value);
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

        <span
          v-cloak
          style="white-space: break-spaces"
          v-html="`current session:  `"
        ></span>
        <v-responsive>
          <v-spacer />
          <v-autocomplete
            ref="pathRef"
            variant="underlined"
            v-model="currSession"
            prepend-inner-icon="mdi-airplane"
            auto-select-first
            @focus="pathFocus = true"
            @blur="pathFocus = false"
            @update:modelValue="pathUpdate"
            :items="candidateSessions"
            :custom-filter="customFilter"
          ></v-autocomplete>

          <v-spacer></v-spacer>
        </v-responsive>

        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
          <v-tooltip activator="parent">back (Ctrl+O)</v-tooltip>
        </v-btn>

        <v-btn icon @click="copyItem">
          <v-icon>mdi-content-copy</v-icon>
          <v-tooltip activator="parent">copy (C)</v-tooltip>
        </v-btn>

        <v-btn icon @click="deleteItem">
          <v-icon>mdi-trash-can </v-icon>
          <v-tooltip activator="parent">delete (D / Delete)</v-tooltip>
        </v-btn>

        <v-btn icon @click="toggleTheme">
          <v-icon v-if="isDark()">mdi-brightness-4</v-icon>
          <v-icon v-else>mdi-brightness-5</v-icon>
          <v-tooltip activator="parent">light/dark</v-tooltip>
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
