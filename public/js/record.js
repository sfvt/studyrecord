export function setupRecord() {
  //timer/stopwatchのタブ切り替えボタン
  const timerBtn = document.getElementById("timerBtn");
  const stopWatchBtn = document.getElementById("stopwatchBtn");

  function setupModeSwitch(before, after, switchBtn) {
    switchBtn.addEventListener("pointerdown", () => {
      const status = document.querySelectorAll(`.${before}`);
      for (let i = 0; i < status.length; i++) {
        status[i].classList.remove(before);
        status[i].classList.add(after);
      }
    });
  }
  setupModeSwitch("is-timer", "is-stopwatch", stopWatchBtn);
  setupModeSwitch("is-stopwatch", "is-timer", timerBtn);
  //モーダルの表示
  const studyRstModal = document.querySelector("#study-modal");
  const addSubModal = document.querySelector("#subject-modal");
  const submitButton = document.querySelector("#submit-button");
  const plusSubBotton = document.querySelector("#plus-subject-button");

  function setupShowModal(openBtnEl, modalEl) {
    openBtnEl.addEventListener("pointerdown", () => {
      modalEl.classList.remove("hidden");
    });
  }
  setupShowModal(submitButton, studyRstModal);
  setupShowModal(plusSubBotton, addSubModal);
  //モーダルの非表示
  const cancelSubmit = document.querySelector("#cancel-submit");
  const cancelSubject = document.querySelector("#cancel-add-subject");

  function setupHideModal(modalEl, modalContent, closeBtnEl) {
    function hide() {
      modalEl.classList.add("hidden");
    }
    closeBtnEl?.addEventListener("pointerdown", () => {
      hide();
    });
    modalEl.addEventListener("pointerdown", (ev) => {
      if (ev.target.closest(modalContent)) {
        return;
      }
      hide();
    });
  }
  setupHideModal(studyRstModal, ".submit-modal-content", cancelSubmit);
  setupHideModal(addSubModal, ".subject-modal-content", cancelSubject);
}
