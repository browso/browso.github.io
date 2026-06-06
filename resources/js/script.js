const demoButton = document.querySelector("#watch-demo");
const demo = document.querySelector("#demo");
const themeToggle = document.querySelector("#theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem("browso-theme");
const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

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
  applyTheme(nextTheme);
});

demoButton?.addEventListener("click", () => {
  demo.classList.remove("is-playing");
  requestAnimationFrame(() => demo.classList.add("is-playing"));
  demo.scrollIntoView({ behavior: "smooth", block: "center" });

  window.setTimeout(() => demo.classList.remove("is-playing"), 2400);
});
