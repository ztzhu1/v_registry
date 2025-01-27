<script setup>
import A from "../test.js";

function greet(message) {
  alert(message.value);
  A[2].value += 1;
}
</script>

<template>
  <v-card class="mx-auto" color="grey-lighten-3">
    <v-layout>
      <v-app-bar color="teal-darken-4" image="https://picsum.photos/1920/1080?random">
        <template v-slot:image>
          <v-img
            gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"
          ></v-img>
        </template>

        <template v-slot:prepend>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>Title</v-app-bar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <v-container fluid>
          <v-row dense v-for="n in A" :key="n" justify="center">
            <v-btn @click="greet(n)" prepend-icon="$vuetify" block>
              {{ n.value }}
            </v-btn>
            <v-divider inset></v-divider>
          </v-row>
        </v-container>
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
