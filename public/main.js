import { handleTimekeepingClick } from "./js/handler.js";
import { initDom } from "./js/dom.js";
import { render } from "./js/render.js";

document.addEventListener("DOMContentLoaded", () => {
  initDom();
  render();
  handleTimekeepingClick();
});
