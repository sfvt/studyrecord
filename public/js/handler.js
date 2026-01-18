import { dom } from "./dom.js";
import { state } from "./state.js";
export function handleTimekeepingClick() {
  //timer/stopwatchのタブ切り替えボタン

  function setupModeSwitch(before, after, switchBtn) {
    switchBtn.addEventListener("click", () => {
      switch (switchBtn.id) {
        case "timer-btn":
          state.mode = "timer";
          break;
        case "stopwatch-btn":
          state.mode = "stopwatch";
          break;
      }

      for (let i = 0; i < dom.modeTargets.length; i++) {
        dom.modeTargets[i].classList.remove(before);
      }
      const activeTargets = document.querySelectorAll(
        `.mode-target[data-mode~="${after}"]`,
      );
      for (let i = 0; i < activeTargets.length; i++) {
        activeTargets[i].classList.add(after);
      }
    });
  }
  setupModeSwitch("is-timer", "is-stopwatch", dom.stopWatchBtn);
  setupModeSwitch("is-stopwatch", "is-timer", dom.timerBtn);
  //モーダルの表示
  function setupShowModal(openBtnEl, modalEl) {
    openBtnEl.addEventListener("click", () => {
      modalEl.classList.remove("hidden");
    });
  }
  setupShowModal(dom.submitBtn, dom.submitModal);
  setupShowModal(dom.addSubjectBotton, dom.addSubjectModal);
  //モーダルの非表示
  function setupHideModal(modalEl, modalContent, closeBtnEl) {
    function hide() {
      modalEl.classList.add("hidden");
    }
    closeBtnEl?.addEventListener("click", () => {
      hide();
    });
    modalEl.addEventListener("click", (ev) => {
      if (ev.target.closest(modalContent)) {
        return;
      }
      hide();
    });
  }
  setupHideModal(dom.submitModal, ".submit-modal-content", dom.cancelSubmitBtn);
  setupHideModal(
    dom.addSubjectModal,
    ".subject-modal-content",
    dom.cancelSubjectBtn,
  );
}
