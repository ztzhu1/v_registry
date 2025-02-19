<script setup>
import { useTheme } from "vuetify";
import { ref, onMounted } from "vue";
import {
  currSession,
  pathRef,
  pathFocus,
  search,
  searchFocus,
  items,
  idIndexMap,
  selected,
  dialog,
  dialogText,
  dialogItem,
  dialogTitle,
  deleteDialog,
  deleteDialogTitle,
  deleteDialogText,
  newDirDialog,
  newDirDialogText,
  newKeyDialog,
  newKeyDialogText,
  newKeyDialogTitle,
  newValueDialogText,
  newDirDialogTitle,
  copyDialog,
  copyDialogTitle,
  copyDialogText,
  copyNewDirDialogText,
  newDirNameDisabled,
  noDialog,
  drawer,
  drawerItems,
} from "../status";
import {
  currUser,
  currPath,
  refreshUI,
  switchAndRefresh,
  saveKey,
  deleteKey,
  deleteDir,
  showUsers,
  newDir,
  copyKey,
  copyDir,
} from "../database.js";

const theme = useTheme();
let vimMode = "normal";
let searchRef = ref();
let keyDialogRef = ref();

onMounted(() => {
  window.addEventListener("keydown", (event) => {
    if (event.code == "Escape" || (event.code == "BracketLeft" && event.ctrlKey)) {
      selected.value = [];
      if (searchFocus.value) {
        searchRef.value.blur();
      }
      if (pathFocus.value) {
        pathRef.value.blur();
      }
      clearDialog();
      vimMode = "normal";
    } else if (event.code == "Enter" && event.ctrlKey) {
      if (dialog.value) {
        saveClick();
      }
      if (deleteDialog.value) {
        deleteClick();
      }
      if (newDirDialog.value) {
        newDirClick();
      }
      if (newKeyDialog.value) {
        newKeyClick();
      }
      if (copyDialog.value) {
        copyClick();
      }
    } else if (event.code == "KeyI" && vimMode != "insert") {
      vimMode = "insert";
    } else if (event.code == "KeyV" && vimMode == "normal") {
      vimMode = "visual";
    } else if (
      ((event.code == "KeyF" && event.ctrlKey) || event.code == "Slash") &&
      noDialog()
    ) {
      if (event.code == "KeyF" && event.ctrlKey) {
        event.preventDefault();
      }
      if (event.code == "Slash" && !searchFocus.value && !pathFocus.value) {
        event.preventDefault();
      }
      if (!pathFocus.value) {
        searchRef.value.focus();
      }
    } else if (event.code == "KeyR" && event.ctrlKey) {
      event.preventDefault();
      refreshUI();
    }
  });
});

function isDark() {
  return theme.global.current._value.dark;
}

const headers = [
  { title: "key", key: "key", align: "left" },
  { title: "value", key: "value", align: "left" },
];

switchAndRefresh(null);

function rowClick(event, row) {
  if (event.detail != 1) {
    return;
  }
  if (event.ctrlKey == true) {
    row.toggleSelect(row.internalItem);
  }
  if (event.shiftKey == true) {
    if (selected.value.length == 0) {
      selected.value.push(row.internalItem.key);
    } else {
      let formerIndex = idIndexMap[selected.value[selected.value.length - 1]];
      let currIndex = idIndexMap[row.internalItem.key];
      if (formerIndex > currIndex) {
        [formerIndex, currIndex] = [currIndex, formerIndex];
      }
      for (let i = formerIndex; i <= currIndex; i++) {
        if (!selected.value.includes(items.value[i]["id"])) {
          selected.value.push(items.value[i]["id"]);
        }
      }
    }
  }
}

function rowDoubleClick(event, row) {
  if (event.detail != 2) {
    return;
  }

  let [type, name] = row.internalItem.raw["key"].split(".");
  selected.value = [];
  search.value = "";
  if (type.split(".")[0] == "folder") {
    if (currSession.value == "/") {
      switchAndRefresh(`${currSession.value}${name}`);
    } else {
      switchAndRefresh(`${currSession.value}/${name}`);
    }
  } else {
    refreshUI(name);
  }
}

function drawerClick(index) {
  let session = drawerItems.value[index]["title"];
  if (session == "" || session == "/") {
    session = null;
  }
  switchAndRefresh(session);
  drawer.value = false;
}

function getKey(id) {
  return items.value[idIndexMap[id]]["key"];
}

function closeClick() {
  clearDialog();
}

function copyClick() {
  let result = copyDialogText.value.split("/");
  result = result.slice(1, result.length);

  for (const id of selected.value) {
    const [type, key] = getKey(id).split(".");
    if (type == "folder") {
      let newUser = "";
      let newPath = "";
      let name = copyNewDirDialogText.value;
      if (selected.value.length > 1) {
        name = key;
      }

      if (result.length == 0) {
        alert("invalid new path (1)");
        return;
      } else if (result.length == 1) {
        if (result[0] != "") {
          newUser = result[0];
          newPath = name;
        } else {
          newUser = name;
        }
        if (showUsers.value) {
          newPath = "";
        }
      } else {
        [newUser, ...newPath] = result;
        newPath = newPath.join("/");
        newPath = `${newPath}/${name}`;
      }
      if (newUser == "") {
        alert("invalid new path");
        return;
      }
      if (showUsers.value) {
        if (newPath != "") {
          alert("invalid new path");
          return;
        }
        copyDir(currUser.value, "", newUser, newPath);
      } else {
        let cp = currPath.value;
        if (cp == "") {
          cp = key;
        } else {
          cp = `${cp}/${key}`;
        }
        copyDir(currUser.value, cp, newUser, newPath);
      }
    } else {
      let newUser = "";
      let newPath = "";

      if (result.length == 0) {
        alert("invalid new path");
        return;
      } else if (result.length == 1) {
        newUser = result[0];
      } else {
        [newUser, ...newPath] = result;
        newPath = newPath.join("/");
      }
      if (newUser == "") {
        alert("invalid new path");
        return;
      }
      copyKey(currUser.value, currPath.value, newUser, newPath, key);
    }
  }
  clearDialog();
}

function saveClick() {
  saveKey(dialogItem.value["key"].split(".")[1], dialogText.value);
  clearDialog();
}

function newDirClick() {
  if (showUsers.value) {
    newDir(newDirDialogText.value);
    clearDialog();
  } else {
    let exists = false;
    for (const item of items.value) {
      if (item["key"] == `folder.${newDirDialogText.value}`) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      newDir(newDirDialogText.value);
      clearDialog();
    } else {
      alert(`${newDirDialogText.value} already exists`);
    }
  }
}

function newKeyClick() {
  if (showUsers.value) {
    alert("Cannot create new key in root directory");
    clearDialog();
  } else {
    let exists = false;
    for (const item of items.value) {
      if (item["key"] == `key.${newKeyDialogText.value}`) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      saveKey(newKeyDialogText.value, newValueDialogText.value);
      clearDialog();
    } else {
      alert(`${newKeyDialogText.value} already exists`);
      keyDialogRef.value.focus();
    }
  }
}

function deleteClick() {
  // saveKey(dialogItem.value["key"].split(".")[1], dialogText.value);
  const keys = [];
  const folders = [];
  let type = "";
  let key = "";
  for (const id of selected.value) {
    key = getKey(id);
    [type, key] = key.split(".");
    if (type == "key") {
      keys.push(key);
    } else {
      folders.push(key);
    }
  }
  if (keys.length > 0) {
    deleteKey(keys);
  }
  for (const folder of folders) {
    deleteDir(folder);
  }
  clearDialog();
}

function clearDialog() {
  dialogText.value = null;
  dialogItem.value = null;
  copyDialogText.value = null;
  copyNewDirDialogText.value = null;
  dialog.value = false;
  deleteDialog.value = false;
  newDirDialog.value = false;
  newKeyDialog.value = false;
  copyDialog.value = false;
}

function getColor(value, isKey) {
  if (!isKey) {
    if (isDark()) {
      return "#ffffff";
    }
    return "#000000";
  } else {
    let type = "";
    [type, value] = value.split(".");
    if (type == "key") {
      if (isDark()) {
        return "#ffffff";
      }
      return "#000000";
    } else {
      if (isDark()) {
        return "#ffffff";
      }
      return "#000000";
    }
  }
}

function customFilter(value, query, item) {
  let key = item["raw"]["key"];
  key = key.split(".")[1];
  let pattern = query
    .toLowerCase()
    .split("")
    .reduce(function (a, b) {
      return a + ".*" + b;
    });
  let match = new RegExp(pattern).test(key.toLowerCase());
  return value != null && query != null && typeof value === "string" && match;
}

function colorRowItem(item) {
  let className = "";
  if (selected.value.includes(item.item.id)) {
    className = "selected-row";
  } else {
    className = "unselected-row";
  }
  if (isDark()) {
    className = className.concat("-dark");
  }
  return { class: className };
}
</script>

<template>
  <v-main>
    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          placeholder="search (Ctrl+F or /)"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          ref="searchRef"
          @focus="searchFocus = true"
          @blur="searchFocus = false"
          single-line
        ></v-text-field>
      </v-card-title>

      <v-row align="center" justify="center">
        <v-data-table
          :headers="headers"
          :items="items"
          :items-per-page="-1"
          :hover="true"
          :row-props="colorRowItem"
          :search="search"
          :custom-filter="customFilter"
          hide-default-footer
          v-model="selected"
          disable-sort
          show-select
          @click:row="rowClick"
          @dblclick:row="rowDoubleClick"
        >
          <template v-slot:[`item.key`]="{ value }">
            <v-icon v-if="value.split('.')[0] == 'folder'" color="#dcb67a"
              >mdi-folder</v-icon
            >
            <v-icon v-else>mdi-file-key-outline</v-icon>
            <v-chip :color="getColor(value, true)" v-ripple variant="tonal">
              {{ value.split(".")[1] }}
            </v-chip>
          </template>
          <template v-slot:[`item.value`]="{ value }">
            <v-chip
              :color="getColor(value, false)"
              v-ripple
              variant="tonal"
              class="rowValueChip"
              v-if="value != null"
            >
              <td class="rowValue">{{ value }}</td>
            </v-chip>
          </template>
        </v-data-table>
      </v-row>
    </v-card>

    <v-dialog v-model="dialog" persistent>
      <v-card prepend-icon="mdi-pen" :title="dialogTitle">
        <v-card-title
          ><v-textarea
            label="new value"
            variant="outlined"
            v-model="dialogText"
            clear-icon="mdi-close-circle"
            clearable
            autofocus
            counter
            auto-grow
          ></v-textarea
        ></v-card-title>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="plain" @click="closeClick">
            <v-icon>mdi-close-circle-outline </v-icon
            ><v-tooltip activator="parent">(Esc)</v-tooltip>Close</v-btn
          >
          <v-btn color="primary" variant="tonal" @click="saveClick">
            <v-icon>mdi-content-save-edit-outline</v-icon
            ><v-tooltip activator="parent">(Ctrl+Enter)</v-tooltip>Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" persistent>
      <v-card prepend-icon="mdi-trash-can" :title="deleteDialogTitle">
        <v-card-title>{{ deleteDialogText }}</v-card-title>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="plain" @click="closeClick">
            <v-icon>mdi-close-circle-outline </v-icon
            ><v-tooltip activator="parent">(Esc)</v-tooltip>Close</v-btn
          >
          <v-btn color="primary" variant="tonal" @click="deleteClick">
            <v-icon>mdi-trash-can</v-icon
            ><v-tooltip activator="parent">(Ctrl+Enter)</v-tooltip>Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="newDirDialog" persistent>
      <v-card prepend-icon="mdi-folder-plus-outline" :title="newDirDialogTitle">
        <v-card-title
          ><v-text-field
            variant="outlined"
            v-model="newDirDialogText"
            clear-icon="mdi-close-circle"
            clearable
            autofocus
            counter
            auto-grow
          ></v-text-field
        ></v-card-title>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="plain" @click="closeClick">
            <v-icon>mdi-close-circle-outline </v-icon
            ><v-tooltip activator="parent">(Esc)</v-tooltip>Close</v-btn
          >
          <v-btn color="primary" variant="tonal" @click="newDirClick">
            <v-icon>mdi-content-save-edit-outline</v-icon
            ><v-tooltip activator="parent">(Ctrl+Enter)</v-tooltip>Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="newKeyDialog" persistent>
      <v-card prepend-icon="mdi-key-plus" :title="newKeyDialogTitle">
        <v-card-title
          ><v-text-field
            label="new key"
            variant="outlined"
            v-model="newKeyDialogText"
            ref="keyDialogRef"
            autofocus
            counter
            auto-grow
          ></v-text-field
        ></v-card-title>

        <v-card-title
          ><v-textarea
            label="new value"
            variant="outlined"
            v-model="newValueDialogText"
            counter
            auto-grow
          ></v-textarea
        ></v-card-title>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="plain" @click="closeClick">
            <v-icon>mdi-close-circle-outline </v-icon
            ><v-tooltip activator="parent">(Esc)</v-tooltip>Close</v-btn
          >
          <v-btn color="primary" variant="tonal" @click="newKeyClick">
            <v-icon>mdi-content-save-edit-outline</v-icon
            ><v-tooltip activator="parent">(Ctrl+Enter)</v-tooltip>Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="copyDialog" persistent>
      <v-card prepend-icon="mdi-content-copy" :title="copyDialogTitle">
        <v-card-title
          ><v-text-field
            label="new dir name"
            variant="outlined"
            v-model="copyNewDirDialogText"
            counter
            auto-grow
            :disabled="newDirNameDisabled"
          ></v-text-field>

          <v-text-field
            label="new dir"
            variant="outlined"
            v-model="copyDialogText"
            counter
            auto-grow
            autofocus
          ></v-text-field
        ></v-card-title>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="plain" @click="closeClick">
            <v-icon>mdi-close-circle-outline </v-icon
            ><v-tooltip activator="parent">(Esc)</v-tooltip>Close</v-btn
          >
          <v-btn color="primary" variant="tonal" @click="copyClick">
            <v-icon>mdi-content-save-edit-outline</v-icon
            ><v-tooltip activator="parent">(Ctrl+Enter)</v-tooltip>Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          v-for="(item, index) in drawerItems"
          :key="index"
          @click="drawerClick(index)"
          align="center"
          justify="center"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-main>
</template>

<script>
export default {
  name: "DataTable",

  data: () => ({}),
};
</script>
