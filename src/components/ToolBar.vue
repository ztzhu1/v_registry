<script setup>
import { useTheme } from "vuetify";
const theme = useTheme();

function toggleTheme() {
  theme.global.name.value = isDark() ? "light" : "dark";
}

function isDark() {
  return theme.global.current._value.dark;
}
</script>

<template>
  <v-card>
    <v-layout>
      <v-app-bar>
        <template v-slot:prepend>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>v-registry</v-app-bar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="toggleTheme">
          <v-icon v-if="isDark()">mdi-brightness-4</v-icon>
          <v-icon v-else>mdi-brightness-5</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
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
