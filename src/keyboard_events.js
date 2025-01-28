import { ref } from "vue"

export const shiftDown = ref(false)
export const ctrlDown = ref(false)

export function keyDown(event) {
    if (event.code == "ShiftLeft" || event.code == "ShiftRight") {
        shiftDown.value = true;
    }
    if (event.code == "ControlLeft" || event.code == "ControlLeft") {
        ctrlDown.value = true;
    }
}

export function keyUp(event) {
    if (event.code == "ShiftLeft" || event.code == "ShiftRight") {
        shiftDown.value = false;
    }
    if (event.code == "ControlLeft" || event.code == "ControlLeft") {
        ctrlDown.value = false;
    }
}
