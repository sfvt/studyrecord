export function setupRecord() {
  //timer-stopwatchボタンのタブ切り替え
  const timerBtn = document.getElementById("timerBtn");
  const stopWatchBtn = document.getElementById("stopwatchBtn");

  function toggleTimerToSW(){
    const isTimers = document.querySelectorAll(".is-timer");
    for(let i = 0; i < isTimers.length; i++){
      isTimers[i].classList.remove("is-timer");
      isTimers[i].classList.add("is-stopwatch");
    }
  }

  function toggleSWToTimer(){
    const isStopWatches = document.querySelectorAll(".is-stopwatch");
    for(let i = 0; i < isStopWatches.length; i++){
      isStopWatches[i].classList.remove("is-stopwatch");
      isStopWatches[i].classList.add("is-timer");
    }
  }

  timerBtn.addEventListener("click", () => {
    toggleSWToTimer();
  });

  stopWatchBtn.addEventListener("click", () => {
    toggleTimerToSW();
  });
  //_____________________________________________________________
}
