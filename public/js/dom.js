export const dom = {};

export function initDom() {
  //タイマーボタン
  dom.timerBtn = document.getElementById("timer-btn");
  dom.stopWatchBtn = document.getElementById("stopwatch-btn");

  dom.submitBtn = document.querySelector("#submit-button");

  dom.startBtn = document.querySelector("#start-button");
  dom.stopBtn = document.querySelector("#stop-button");

  dom.modeTargets = document.querySelectorAll(".mode-target");
  dom.submitModal = document.querySelector("#study-modal");
  dom.addSubjectModal = document.querySelector("#subject-modal");
  dom.addSubjectBotton = document.querySelector("#plus-subject-button");
  dom.cancelSubmitBtn = document.querySelector("#cancel-submit");
  dom.cancelSubjectBtn = document.querySelector("#cancel-add-subject");
}
