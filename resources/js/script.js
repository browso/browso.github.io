const demoButton = document.querySelector("#watch-demo");
const demo = document.querySelector("#demo");

demoButton?.addEventListener("click", () => {
  demo.classList.remove("is-playing");
  requestAnimationFrame(() => demo.classList.add("is-playing"));
  demo.scrollIntoView({ behavior: "smooth", block: "center" });

  window.setTimeout(() => demo.classList.remove("is-playing"), 2400);
});
