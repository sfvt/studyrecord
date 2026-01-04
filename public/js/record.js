export function setupRecord() {
  //timer-stopwatchボタンのタブ切り替え
  const timerBtn = document.getElementById("timerBtn");
  const stopWatchBtn = document.getElementById("stopwatchBtn");
  const timerContainer = document.getElementById("timerContainer");

  timerBtn.addEventListener("click", () => {
    //remove class is-stopwatch
    stopWatchBtn.classList.remove("is-stopwatch");
    timerContainer.classList.remove("is-stopwatch");
    //add class is-timer
    timerBtn.classList.add("is-timer");
    timerContainer.classList.add("is-timer");
  });

  stopWatchBtn.addEventListener("click", () => {
    //remove　class is-timer
    timerBtn.classList.remove("is-timer");
    timerContainer.classList.remove("is-timer");
    //add class is-stopwatch
    stopWatchBtn.classList.add("is-stopwatch");
    timerContainer.classList.add("is-stopwatch");
  });
  //_____________________________________________________________
}
