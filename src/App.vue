<template>
  <v-app>
    <v-main>
      <ToolBar />
      <DataTable />
    </v-main>
  </v-app>
</template>

<script>
import ToolBar from "./components/ToolBar.vue";
import DataTable from "./components/DataTable.vue";

export default {
  name: "App",

  components: {
    ToolBar,
    DataTable,
  },

  data: () => ({}),
};
</script>
