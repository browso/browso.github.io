const releaseState = document.querySelector("[data-release-state]");
const releaseCatalog = document.querySelector("[data-release-catalog]");

const platforms = [
  ["macAppleSilicon", "macOS", "Apple Silicon", "DMG", "apple.svg"],
  ["macIntel", "macOS", "Intel", "DMG", "apple.svg"],
  ["windows", "Windows", "64-bit", "EXE", "windows.svg"],
  ["linux", "Linux", "64-bit", "AppImage", "linux.svg"],
];

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

function formatReleaseDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Published release";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function renderReleaseNotes(release) {
  const summary =
    typeof release.notesSummary === "string" && release.notesSummary.trim()
      ? '<p class="release-notes-summary">' +
        escapeHTML(release.notesSummary.trim()) +
        "</p>"
      : "";

  if (Array.isArray(release.notesSections) && release.notesSections.length > 0) {
    return (
      summary +
      release.notesSections
        .map((section) => {
          const items = Array.isArray(section.items) ? section.items : [];
          return (
            '<section class="release-note-section">' +
            "<h4>" +
            escapeHTML(section.title || "Notes") +
            "</h4>" +
            "<ul>" +
            items
              .map((note) => "<li>" + escapeHTML(note) + "</li>")
              .join("") +
            "</ul>" +
            "</section>"
          );
        })
        .join("")
    );
  }

  const notes = Array.isArray(release.notes) ? release.notes : [];
  if (notes.length === 0) {
    return (
      summary +
      '<p class="release-notes-empty">No release notes were provided for this version.</p>'
    );
  }

  return (
    summary +
    "<ul>" + notes.map((note) => "<li>" + escapeHTML(note) + "</li>").join("") + "</ul>"
  );
}

function renderRelease(release, index) {
  const downloads = platforms
    .map(([key, platform, architecture, format, icon]) => {
      const url = release.assets?.[key];
      if (!url) return "";
      return `
        <a class="release-download" href="${escapeHTML(url)}">
          <img src="assets/icons/platforms/${icon}" alt="" width="22" height="22" />
          <span>
            <strong>${platform}</strong>
            <small>${architecture} · ${format}</small>
          </span>
          <b>Download</b>
        </a>
      `;
    })
    .join("");

  return `
    <article class="release-entry${index === 0 ? " is-latest" : ""}" id="${escapeHTML(release.tag)}">
      <div class="release-entry-header">
        <div>
          <span class="release-version">Browso ${escapeHTML(release.version)}</span>
          ${index === 0 ? '<span class="release-latest-badge">Latest stable</span>' : ""}
          <h2>${release.type === "major" ? "Major release" : "Product update"}</h2>
          <p>${formatReleaseDate(release.publishedAt)}</p>
        </div>
        <a href="${escapeHTML(release.releaseUrl)}" target="_blank" rel="noopener noreferrer">
          GitHub release
        </a>
      </div>
      <div class="release-entry-grid">
        <div class="release-notes">
          <h3>What changed</h3>
          ${renderReleaseNotes(release)}
        </div>
        <div class="release-downloads">
          <h3>Downloads</h3>
          ${downloads}
          ${
            release.assets?.checksums
              ? `<a class="release-checksums" href="${escapeHTML(release.assets.checksums)}">Verify SHA-256 checksums</a>`
              : ""
          }
        </div>
      </div>
    </article>
  `;
}

async function loadReleases() {
  try {
    const response = await fetch("assets/data/releases.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const releases = Array.isArray(data.releases) ? data.releases : [];
    if (releases.length === 0) throw new Error("No stable releases published");

    releaseCatalog.innerHTML = releases.map(renderRelease).join("");
    releaseState.classList.add("is-complete");
    releaseState.innerHTML = `
      <span class="release-state-icon" aria-hidden="true">✓</span>
      <div>
        <span class="release-state-label">Release catalog</span>
        <h2>Stable builds are ready.</h2>
      </div>
    `;
    releaseCatalog.hidden = false;

    if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView();
    }
  } catch (error) {
    releaseState.innerHTML = `
      <span class="release-state-icon" aria-hidden="true">01</span>
      <div>
        <span class="release-state-label">Coming soon</span>
        <h2>The first stable Browso release is being prepared.</h2>
        <p>In the meantime, follow development on GitHub or read how Browso is built and tested.</p>
        <div class="release-state-actions">
          <a class="release-state-primary" href="https://github.com/browso/browso">View on GitHub <span aria-hidden="true">↗</span></a>
          <a href="/docs/build-and-release.html">Read the release process <span aria-hidden="true">→</span></a>
        </div>
      </div>
    `;
    console.warn("Unable to load releases", error);
  }
}

void loadReleases();
