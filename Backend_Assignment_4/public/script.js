let socket = io();

// Simple screen management
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

// Timer simulation (for demo purposes)
let timerInterval;
function startTimer() {
  let seconds = 60;
  const timerDisplay = document.getElementById("timer-display");
  const timer = document.querySelector(".timer");

  timerInterval = setInterval(() => {
    seconds--;
    timerDisplay.textContent = seconds;

    if (seconds <= 10) {
      timer.classList.add("danger");
    } else if (seconds <= 30) {
      timer.classList.add("warning");
    }

    if (seconds <= 0) {
      clearInterval(timerInterval);
      showScreen("results-screen");
    }
  }, 1000);
}

// Copy session code functionality
document.querySelector(".copy-btn")?.addEventListener("click", function () {
  const code = document.querySelector(".code-display").textContent;
  navigator.clipboard.writeText(code).then(() => {
    this.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      this.innerHTML = '<i class="fas fa-copy"></i>';
    }, 2000);
  });
});
