import { state } from "./state.js";
import { dom } from "./dom.js";

export function render() {
  dom.startBtn.disabled =
    state.phase === "running" || state.phase === "finished";
  dom.stopBtn.disabled = state.phase !== "running";
  dom.submitBtn.disabled = state.phase === "ready";

  dom.timerBtn.disabled = state.phase !== "ready";
  dom.stopWatchBtn.disabled = state.phase !== "ready";
}
