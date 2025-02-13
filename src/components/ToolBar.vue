<script setup>
import { onMounted, watch } from "vue";
import { useTheme } from "vuetify";
import {
  currSession,
  items,
  idIndexMap,
  pathFocus,
  pathRef,
  selected,
  candidateSessions,
  deleteDialog,
  deleteDialogText,
  newDirDialog,
  newKeyDialog,
  newDirDialogTitle,
  newKeyDialogTitle,
  newKeyDialogText,
  newValueDialogText,
  newDirDialogText,
  newDirNameDisabled,
  moreDialog,
  copyDialog,
  copyDialogText,
  copyNewDirDialogText,
  noDialog,
  noFocus,
  drawer,
  group,
} from "../status";
import {
  switchAndRefresh,
  currPath,
  currUser,
  refreshUI,
  showUsers,
} from "../database.js";

onMounted(() => {
  window.addEventListener("keydown", (event) => {
    if (!noDialog()) {
      return;
    }
    if (event.code == "KeyP" && event.ctrlKey) {
      event.preventDefault();
      pathRef.value.focus();
    } else if (event.code == "KeyO" && event.ctrlKey) {
      event.preventDefault();
      goBack();
    } else if (event.code == "KeyN" && noFocus()) {
      event.preventDefault();
      if (event.shiftKey) {
        newDir();
      } else {
        newKey();
      }
    } else if (
      (event.code == "KeyD" || event.code == "Delete") &&
      selected.value.length > 0 &&
      noFocus()
    ) {
      event.preventDefault();
      deleteItem();
    } else if (event.code == "KeyC" && selected.value.length > 0 && noFocus()) {
      event.preventDefault();
      copyItem();
    }
  });
});

const theme = useTheme();

watch(group, () => {
  drawer.value = false;
});

function toggleTheme() {
  theme.global.name.value = isDark() ? "light" : "dark";
}

function popMore() {
  moreDialog.value = true;
}
function moreClick() {
  moreDialog.value = false;
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

function newDir() {
  newDirDialogTitle.value = "new dir";
  newDirDialogText.value = "";
  newDirDialog.value = true;
}

function newKey() {
  if (showUsers.value) {
    alert("Cannot create new key in root directory");
    return;
  }
  newKeyDialogTitle.value = "new key";
  newKeyDialogText.value = "";
  newValueDialogText.value = "";
  newKeyDialog.value = true;
}

function copyItem() {
  if (selected.value.length == 0) {
    return;
  }
  copyDialogText.value = currSession.value;
  copyNewDirDialogText.value = "same as old (you cannot edit this)";
  if (selected.value.length == 1) {
    let key = items.value[idIndexMap[selected.value[0]]]["key"];
    if (key.split(".")[0] == "folder") {
      newDirNameDisabled.value = false;
      copyNewDirDialogText.value = key.split(".")[1];
    } else {
      newDirNameDisabled.value = true;
    }
  } else {
    newDirNameDisabled.value = true;
  }
  copyDialog.value = true;
  console.log(newDirNameDisabled.value);
}

function deleteItem() {
  deleteDialog.value = true;
  deleteDialogText.value = `delete ${selected.value.length} items?`;
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
        <v-app-bar-nav-icon
          variant="text"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>

        <v-app-bar-title>m-registry </v-app-bar-title>

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
        <v-btn icon @click="refreshUI">
          <v-icon>mdi-refresh</v-icon>
          <v-tooltip activator="parent">refresh (Ctrl+R)</v-tooltip>
        </v-btn>

        <v-btn icon @click="newDir">
          <v-icon>mdi-folder-plus-outline</v-icon>
          <v-tooltip activator="parent">new dir (Shift+N)</v-tooltip>
        </v-btn>

        <v-btn icon @click="newKey">
          <v-icon>mdi-key-plus</v-icon>
          <v-tooltip activator="parent">new key (N)</v-tooltip>
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

        <v-btn icon @click="popMore">
          <v-icon>mdi-dots-vertical</v-icon>
          <v-tooltip activator="parent">more</v-tooltip>
        </v-btn>
      </v-app-bar>

      <v-main>
        <v-container fluid> </v-container>
      </v-main>
    </v-layout>
  </v-card>

  <v-dialog v-model="moreDialog" persistent>
    <v-card>
      <v-card-title align="center"
        >BSD 2-Clause License. Copyright &copy; 2025 SQCG & ztzhu.</v-card-title
      >

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="plain" @click="moreClick"> OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ToolBar",

  data: () => ({}),
};
</script>
