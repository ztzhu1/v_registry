<script setup>
import { ref } from "vue";

const selected = ref([]);

const items = [];
for (let i = 0; i < 20; i++) {
  items.push({ key: i, value: 100 * i, id: i, type: "key" });
}
const headers = [
  { title: "key", key: "key", align: "center" },
  { title: "value", key: "value", align: "center" },
];

function rowClick(item, { internalItem, toggleSelect }) {
  toggleSelect(internalItem);
}
// function rowClick(item, row) {
//   let selectState = row.isSelected ? false : true;
//   row.select(selectState);
// }

function getColor(value) {
  return "#61afef";
}
</script>

<template>
  <v-main>
    <div class="spacer"></div>
    <v-row align="center" justify="center">
        <v-data-table
          :headers="headers"
          :items="items"
          :items-per-page="-1"
          :hover="true"
          hide-default-footer
          v-model="selected"
          show-select
          @click:row="rowClick"
        >
          <template v-slot:[`item.key`]="{ value }">
            <v-chip :color="getColor(value)">
              {{ value }}
            </v-chip>
          </template>
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
