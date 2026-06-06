const demoButton = document.querySelector("#watch-demo");
const demo = document.querySelector("#demo");
const demoLabel = demoButton?.querySelector(".demo-label");
const demoUserMessage = demo?.querySelector("[data-demo-user]");
const demoAgentMessage = demo?.querySelector("[data-demo-agent]");
const demoTasks = [...(demo?.querySelectorAll("[data-demo-task]") ?? [])];
const demoActionTitle = demo?.querySelector("[data-demo-action-title]");
const demoActionDetail = demo?.querySelector("[data-demo-action-detail]");
const demoAddress = demo?.querySelector("[data-demo-address]");
const demoResults = demo?.querySelector("[data-demo-results]");
const demoApproval = demo?.querySelector("[data-demo-approval]");
const demoApprove = demo?.querySelector("[data-demo-approve]");
const demoCancel = demo?.querySelector("[data-demo-cancel]");
const demoInput = demo?.querySelector("[data-demo-input]");
const demoInputText = demo?.querySelector("[data-demo-input-text]");
const faqDialog = document.querySelector("#faq");
const faqLinks = document.querySelectorAll('a[href="#faq"]');
const faqClose = document.querySelector("[data-close-faq]");
const themeToggle = document.querySelector("#theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem("browso-theme");
const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const demoPrompt = "Find a quiet cabin near a lake for this weekend under $300.";
let demoRun = 0;
let awaitingApproval = false;

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle?.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
  );
  themeColor?.setAttribute("content", theme === "dark" ? "#07080b" : "#f7f8fb");
}

applyTheme(savedTheme === "light" || savedTheme === "dark" ? savedTheme : systemTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("browso-theme", nextTheme);

  if (document.startViewTransition && !reducedMotion.matches) {
    document.startViewTransition(() => applyTheme(nextTheme));
    return;
  }

  document.documentElement.classList.add("theme-transition");
  applyTheme(nextTheme);
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transition");
  }, 520);
});

function wait(duration, run) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(run === demoRun), duration);
  });
}

function setTaskState(index, state) {
  const task = demoTasks[index];
  if (!task) return;

  task.classList.remove("is-pending", "is-loading", "is-done");
  task.classList.add(`is-${state}`);
  task.querySelector(".task-status").textContent = state === "done" ? "✓" : "";
}

async function typeDemoPrompt(run) {
  demoInputText.textContent = "";
  demoInput.classList.add("is-typing");

  for (const character of demoPrompt) {
    if (run !== demoRun) return false;
    demoInputText.textContent += character;
    const active = await wait(character === " " ? 18 : 32, run);
    if (!active) return false;
  }

  demoInput.classList.remove("is-typing");
  return true;
}

async function sendDemoPrompt(run) {
  demoInput.classList.add("is-sending");
  if (!(await wait(180, run))) return false;
  demoUserMessage.textContent = demoPrompt;
  demo.classList.add("show-user-message");
  demoInputText.textContent = "Ask a follow-up...";
  demoInput.classList.remove("is-sending");
  return wait(250, run);
}

function resetDemo() {
  demo.classList.remove(
    "show-user-message",
    "show-agent",
    "show-search-card",
    "show-action-card",
    "show-results",
    "show-selected-result",
    "show-approval",
  );
  demoTasks.forEach((_, index) => setTaskState(index, "pending"));
  demoActionTitle.textContent = "Taking action";
  demoActionDetail.textContent = "Checking availability...";
  demoUserMessage.textContent = demoPrompt;
  demoInputText.textContent = "Ask Browso anything...";
  demoInput.classList.remove("is-typing", "is-sending");
  demoAddress.textContent = "Search or ask Browso...";
  demoResults.setAttribute("aria-hidden", "true");
  demoApproval.setAttribute("aria-hidden", "true");
  demoApproval.classList.remove("is-approved", "is-cancelled");
  demoApproval.querySelector(".approval-heading strong").textContent = "Your approval is required";
  demoApproval.querySelector(".approval-heading small").textContent = "Browso will not pay without you";
  demoApprove.disabled = false;
  demoCancel.disabled = false;
  awaitingApproval = false;
}

function requestApproval() {
  demo.classList.add("show-approval");
  demoApproval.setAttribute("aria-hidden", "false");
  demoActionTitle.textContent = "Waiting for your approval";
  demoActionDetail.textContent = "Payment has not been submitted";
  demoButton.disabled = false;
  demoLabel.textContent = "Replay demo";
  awaitingApproval = true;
}

async function playDemo({ scroll = true } = {}) {
  const run = ++demoRun;
  resetDemo();
  demo.classList.remove("is-playing");
  demo.classList.add("is-demoing");
  requestAnimationFrame(() => demo.classList.add("is-playing"));
  demoButton.disabled = true;
  demoLabel.textContent = "Running demo...";
  if (scroll) {
    demo.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "center",
    });
  }

  if (reducedMotion.matches) {
    demoUserMessage.textContent = demoPrompt;
    demoInputText.textContent = "Ask a follow-up...";
    demo.classList.add(
      "show-user-message",
      "show-agent",
      "show-search-card",
      "show-action-card",
      "show-results",
      "show-selected-result",
    );
    demoAddress.textContent = "Pine Lake Cabin · $248 total";
    demoResults.setAttribute("aria-hidden", "false");
    demoTasks.forEach((_, index) => setTaskState(index, "done"));
    requestApproval();
  } else {
    const typed = await typeDemoPrompt(run);
    if (!typed || !(await sendDemoPrompt(run))) return;

    demo.classList.add("show-agent", "show-action-card");
    demo.classList.add("show-results");
    demoAddress.textContent = "quiet lake cabin under $300";
    demoResults.setAttribute("aria-hidden", "false");
    setTaskState(0, "loading");
    if (!(await wait(850, run))) return;

    setTaskState(0, "done");
    demo.classList.add("show-search-card");
    setTaskState(1, "loading");
    if (!(await wait(900, run))) return;

    setTaskState(1, "done");
    setTaskState(2, "loading");
    demoActionDetail.textContent = "Opening the best matches...";
    if (!(await wait(1000, run))) return;

    setTaskState(2, "done");
    demo.classList.add("show-selected-result");
    demoAddress.textContent = "Pine Lake Cabin · $248 total";
    demoActionTitle.textContent = "Availability confirmed";
    demoActionDetail.textContent = "Preparing payment summary";
    if (!(await wait(600, run))) return;
    requestApproval();
  }

  demoAgentMessage.setAttribute("aria-label", "Browso found and compared 12 available stays.");
}

demoButton?.addEventListener("click", () => playDemo());

demoApprove?.addEventListener("click", () => {
  if (!awaitingApproval) return;
  awaitingApproval = false;
  demoApprove.disabled = true;
  demoCancel.disabled = true;
  demoApproval.classList.add("is-approved");
  demoApproval.querySelector(".approval-heading strong").textContent = "Approved by you";
  demoApproval.querySelector(".approval-heading small").textContent = "Booking submitted securely";
  demoActionTitle.textContent = "Booking confirmed";
  demoActionDetail.textContent = "You approved the $248 payment";
  demoAddress.textContent = "Booking confirmed · Pine Lake Cabin";
});

demoCancel?.addEventListener("click", () => {
  if (!awaitingApproval) return;
  awaitingApproval = false;
  demoApprove.disabled = true;
  demoCancel.disabled = true;
  demoApproval.classList.add("is-cancelled");
  demoApproval.querySelector(".approval-heading strong").textContent = "Payment cancelled";
  demoApproval.querySelector(".approval-heading small").textContent = "Nothing was charged";
  demoActionTitle.textContent = "Stopped by you";
  demoActionDetail.textContent = "No booking was made";
});

function openFaq(event) {
  event?.preventDefault();
  if (!faqDialog?.open) faqDialog?.showModal();
  history.replaceState(null, "", "#faq");
}

function closeFaq() {
  faqDialog?.close();
  if (window.location.hash === "#faq") {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
}

faqLinks.forEach((link) => link.addEventListener("click", openFaq));
faqClose?.addEventListener("click", closeFaq);
faqDialog?.addEventListener("click", (event) => {
  if (event.target === faqDialog) closeFaq();
});
faqDialog?.addEventListener("close", () => {
  if (window.location.hash === "#faq") {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
});

if (window.location.hash === "#faq") openFaq();

if (demo) {
  window.setTimeout(() => playDemo({ scroll: false }), 450);
}
