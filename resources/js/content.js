const progress = document.querySelector("[data-reading-progress]");
const docsSidebar = document.querySelector("[data-docs-sidebar]");

function updateReadingProgress() {
  if (!progress) return;
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = available > 0 ? (window.scrollY / available) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
}

document.querySelectorAll("[data-copy-code]").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".code-block")?.querySelector("code")?.textContent;
    if (!code) return;
    await navigator.clipboard.writeText(code);
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 1600);
  });
});

document.querySelector("[data-docs-open]")?.addEventListener("click", () => {
  docsSidebar?.classList.add("is-open");
});

document.querySelector("[data-docs-close]")?.addEventListener("click", () => {
  docsSidebar?.classList.remove("is-open");
});

window.addEventListener("scroll", updateReadingProgress, { passive: true });
updateReadingProgress();
