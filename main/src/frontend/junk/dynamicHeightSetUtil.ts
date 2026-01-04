import { nextTick } from "vue";

export const dynamicHeightSetUtil = async (el: HTMLElement, callback: () => void) => {
  if (!el) return;

  const currentHeight = el.getBoundingClientRect().height;

  // Remove previous animation class
  el.classList.remove("dynamicHeightSetAnimation-enter-active", "dynamicHeightSetAnimation-leave-active");
  el.style.height = "auto";

  await nextTick();
  callback();
  await nextTick();
  const targetHeight = el.scrollHeight;
  el.style.height = currentHeight + "px";
  // Force reflow to ensure animation triggers
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  el.offsetHeight;
  el.classList.add("dynamicHeightSetAnimation-enter-active");
  el.style.height = targetHeight + "px";
  setTimeout(() => {
    el.classList.remove("dynamicHeightSetAnimation-enter-active");
  }, 400); // match your CSS animation duration
};
