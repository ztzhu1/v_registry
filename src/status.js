import { ref, shallowRef } from "vue"

export let currSession = ref("/test_user/N121H09")

export let pathFocus = ref(false);
export let pathRef = ref();

export let selected = ref([]);
export let items = ref([]);
export let idIndexMap = {};
export let candidateSessions = ref([]);


export let dialog = shallowRef(false);
export let dialogText = ref(null);
export let dialogItem = ref(null);
export let dialogTitle = ref("");

export let deleteDialog = shallowRef(false);
export let deleteDialogText = ref(null);
export let deleteDialogTitle = ref("delete");