<script setup>
import { useTheme } from "vuetify";
import { ref, onMounted } from "vue";

const theme = useTheme();
let vimMode = "normal";
let searchFocus = false;
const search = ref("");
const selected = ref([]);
const searchRef = ref();

onMounted(() => {
  window.addEventListener("keydown", (event) => {
    if (event.code == "Escape" || (event.code == "BracketLeft" && event.ctrlKey)) {
      selected.value = [];
      if (searchFocus) {
        searchRef.value.blur();
      }
      vimMode = "normal";
    } else if (event.code == "KeyI" && vimMode != "insert") {
      vimMode = "insert";
    } else if (event.code == "KeyV" && vimMode == "normal") {
      vimMode = "visual";
    } else if ((event.code == "KeyF" && event.ctrlKey) || event.code == "Slash") {
      event.preventDefault();
      searchRef.value.focus();
    }
  });
});

function isDark() {
  return theme.global.current._value.dark;
}

const items = ref([]);
const id_index_map = {};
for (let i = 0; i < 20; i++) {
  let item = {
    key: `key${i}`,
    value: 100 * i,
    id: `id${i}`,
    type: "key",
  };
  items.value.push(item);
  id_index_map[item["id"]] = i;
}
const headers = [
  { title: "key", key: "key", align: "center" },
  { title: "value", key: "value", align: "center" },
];

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
      let formerIndex = id_index_map[selected.value[selected.value.length - 1]];
      let currIndex = id_index_map[row.internalItem.key];
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
  console.log("double", selected.value[selected.value.length - 1]);
}

function getColor(value) {
  if (isDark()) {
    return "#ffffff";
  }
  return "#000000";
}

function customFilter(value, query, item) {
  let key = item["raw"]["key"];
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
          placeholder="search"
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
            <v-chip :color="getColor(value)" v-ripple variant="tonal">
              {{ value }}
            </v-chip>
          </template>
          <template v-slot:[`item.value`]="{ value }">
            <v-chip
              :color="getColor(value)"
              v-ripple
              variant="tonal"
              class="rowValueChip"
            >
              <td class="rowValue">{{ value }}</td>
            </v-chip>
          </template>

          <!-- <template v-slot:item="{ item }">
          <tr v-ripple :row-props="colorRowItem">
            <td align="center" justify="center">
              <v-chip :color="getColor(item.value)">{{ item.key }}</v-chip>
            </td>
            <td align="center" justify="center">{{ item.value }}</td>
          </tr>
        </template> -->
        </v-data-table>
      </v-row>
    </v-card>
  </v-main>
</template>

<script>
export default {
  name: "DataTable",

  data: () => ({}),
};
</script>
