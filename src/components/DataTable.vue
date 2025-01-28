<script setup>
import { ref } from "vue";
// import { shiftDown } from "../keyboard_events";

const selected = ref([]);

const items = ref([]);
const id_index_map = {};
for (let i = 0; i < 20; i++) {
  items.value.push({
    key: `key${i}`,
    value: 100 * i,
    id: `id${i}`,
    type: "key",
  });
  id_index_map[items.value[items.value.length - 1]["id"]] = i;
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

function colorRowItem(item) {
  if (selected.value.includes(item.item.id)) {
    return { class: "selected-row" };
  }
  return { class: "unselected-row" };
}

function getColor(value) {
  return "#000000";
}
</script>

<template>
  <v-main>
    <div class="spacer"></div>
    <input type="text" @keydown="onPressShift" />
    <v-row align="center" justify="center">
      <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="-1"
        :hover="true"
        :row-props="colorRowItem"
        hide-default-footer
        v-model="selected"
        disable-sort="true"
        show-select
        @click:row="rowClick"
        @dblclick:row="rowDoubleClick"
      >
        <template v-slot:[`item.key`]="{ value }">
          <v-chip :color="getColor(value)" v-ripple>
            {{ value }}
          </v-chip>
        </template>
        <template v-slot:[`item.value`]="{ value }">
          <v-chip :color="getColor(value)" v-ripple>
            {{ value }}
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
  </v-main>
</template>

<script>
export default {
  name: "DataTable",

  data: () => ({}),
};
</script>
