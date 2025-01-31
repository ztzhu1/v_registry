<script setup>
import { useTheme } from "vuetify";
import { ref, shallowRef, onMounted } from "vue";
import { currSession, pathRef, pathFocus, items, idIndexMap ,selected} from "../status";
import { switchAndRefresh } from "../database.js";

const theme = useTheme();
let vimMode = "normal";
let searchFocus = ref(false);
const search = ref("");
let searchRef = ref();

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
    } else if (event.code == "KeyI" && vimMode != "insert") {
      vimMode = "insert";
    } else if (event.code == "KeyV" && vimMode == "normal") {
      vimMode = "visual";
    } else if ((event.code == "KeyF" && event.ctrlKey) || event.code == "Slash") {
      if (event.code == "KeyF" && event.ctrlKey) {
        event.preventDefault();
      }
      if (event.code == "Slash" && !searchFocus.value && !pathFocus.value) {
        event.preventDefault();
      }
      if (!pathFocus.value) {
        searchRef.value.focus();
      }
    }
  });
});

function isDark() {
  return theme.global.current._value.dark;
}

const dialog = shallowRef(false);
const dialogText = ref(null);
const dialogItem = ref(null);
const dialogTitle = ref("");
const headers = [
  { title: "key", key: "key", align: "center" },
  { title: "value", key: "value", align: "center" },
];

switchAndRefresh("/test_user");

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
  if (type.split(".")[0] == "folder") {
    if (currSession.value == "/") {
      switchAndRefresh(`${currSession.value}${name}`);
    } else {
      switchAndRefresh(`${currSession.value}/${name}`);
    }
  } else {
    dialogText.value = null;
    dialogItem.value = row.internalItem.raw;
    dialogTitle.value = name;
    dialog.value = true;
  }
}

function closeClick() {
  clearDialog();
}

function saveClick() {
  console.log(dialogText.value, dialogItem.value);
  clearDialog();
}

function clearDialog() {
  dialogText.value = null;
  dialogItem.value = null;
  dialog.value = false;
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
            <v-icon v-else>mdi-key-variant</v-icon>
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
  </v-main>
</template>

<script>
export default {
  name: "DataTable",

  data: () => ({}),
};
</script>
