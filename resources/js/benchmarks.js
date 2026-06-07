const benchmarkMetrics = {
  productionBuild: "Production build",
  tests: "Automated tests",
  nodeTypecheck: "Node type check",
  webTypecheck: "Web type check",
  lint: "Linting",
  formatting: "Formatting",
};

const benchmarkLoading = document.querySelector("[data-benchmark-loading]");
const benchmarkReport = document.querySelector("[data-benchmark-report]");
const benchmarkCards = document.querySelector("[data-benchmark-cards]");
const benchmarkCharts = document.querySelector("[data-benchmark-charts]");
const benchmarkLatest = document.querySelector("[data-benchmark-latest]");
const benchmarkVersion = document.querySelector("[data-benchmark-version]");
const benchmarkRun = document.querySelector("[data-benchmark-run]");
let benchmarkRuns = [];

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function benchmarkMedian(run, metric) {
  return Number(run?.metrics?.[metric]?.median);
}

function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds)) return "Unavailable";
  if (milliseconds >= 1000) return `${(milliseconds / 1000).toFixed(2)} s`;
  return `${Math.round(milliseconds)} ms`;
}

function benchmarkLabel(run) {
  const version = run?.source?.version ? `v${run.source.version}` : "Unversioned";
  const commit = run?.source?.commit?.slice(0, 7);
  return commit ? `${version} · ${commit}` : version;
}

function renderBenchmarkCards() {
  const latest = benchmarkRuns.at(-1);
  const previous = benchmarkRuns
    .slice(0, -1)
    .reverse()
    .find((run) => run.source?.version !== latest.source?.version)
    ?? benchmarkRuns.at(-2);

  benchmarkCards.innerHTML = Object.entries(benchmarkMetrics)
    .map(([key, label]) => {
      const current = benchmarkMedian(latest, key);
      const prior = benchmarkMedian(previous, key);
      const difference = Number.isFinite(prior) && prior !== 0
        ? ((current - prior) / prior) * 100
        : null;
      const deltaClass = difference === null || Math.abs(difference) < 0.05
        ? "is-neutral"
        : difference < 0
          ? "is-faster"
          : "is-slower";
      const delta = difference === null
        ? "First result"
        : `${difference > 0 ? "+" : ""}${difference.toFixed(1)}%`;

      return `
        <article class="benchmark-card">
          <span>${label}</span>
          <div class="benchmark-value-row">
            <strong>${formatDuration(current)}</strong>
            <small class="benchmark-delta ${deltaClass}">${delta}</small>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBenchmarkChart(metric, chartIndex) {
  const points = benchmarkRuns
    .map((run) => ({ run, value: benchmarkMedian(run, metric) }))
    .filter(({ value }) => Number.isFinite(value));

  if (points.length === 0) {
    return `
      <article class="benchmark-chart-card">
        <div class="benchmark-chart-header">
          <div><span>Trend over passing builds</span><strong>${benchmarkMetrics[metric]}</strong></div>
        </div>
        <div class="benchmark-chart benchmark-chart-empty">No measurements are available for this metric.</div>
      </article>
    `;
  }

  const width = 1000;
  const height = 300;
  const padding = { top: 24, right: 24, bottom: 36, left: 72 };
  const values = points.map(({ value }) => value);
  let minimum = Math.min(...values);
  let maximum = Math.max(...values);
  const spread = maximum - minimum || Math.max(maximum * 0.1, 1);
  minimum = Math.max(0, minimum - spread * 0.18);
  maximum += spread * 0.18;
  const x = (index) => padding.left + (index / Math.max(points.length - 1, 1)) * (width - padding.left - padding.right);
  const y = (value) => padding.top + ((maximum - value) / (maximum - minimum)) * (height - padding.top - padding.bottom);
  const coordinates = points.map(({ value }, index) => `${x(index)},${y(value)}`);
  const area = `${padding.left},${height - padding.bottom} ${coordinates.join(" ")} ${x(points.length - 1)},${height - padding.bottom}`;
  const grid = [0, 0.5, 1].map((ratio) => {
    const position = padding.top + ratio * (height - padding.top - padding.bottom);
    const value = maximum - ratio * (maximum - minimum);
    return `
      <line class="benchmark-grid-line" x1="${padding.left}" y1="${position}" x2="${width - padding.right}" y2="${position}" />
      <text class="benchmark-axis-label" x="${padding.left - 12}" y="${position + 4}" text-anchor="end">${formatDuration(value)}</text>
    `;
  }).join("");
  const circles = points.map(({ run, value }, index) => `
    <circle class="benchmark-point" cx="${x(index)}" cy="${y(value)}" r="${index === points.length - 1 ? 7 : 5}">
      <title>${escapeHTML(benchmarkLabel(run))}: ${formatDuration(value)}</title>
    </circle>
  `).join("");
  const gradientId = `benchmark-gradient-${chartIndex}`;

  return `
    <article class="benchmark-chart-card">
      <div class="benchmark-chart-header">
        <div>
          <span>Trend over passing builds</span>
          <strong>${benchmarkMetrics[metric]}</strong>
        </div>
      </div>
      <div class="benchmark-chart">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${benchmarkMetrics[metric]} trend">
          <defs>
            <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2d6bff" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#2d6bff" stop-opacity="0" />
            </linearGradient>
          </defs>
          ${grid}
          <polygon class="benchmark-area" style="fill: url(#${gradientId})" points="${area}" />
          <polyline class="benchmark-line" points="${coordinates.join(" ")}" />
          ${circles}
        </svg>
      </div>
      <div class="benchmark-chart-footer">
        <span>${escapeHTML(benchmarkLabel(points[0].run))}</span>
        <span>${escapeHTML(benchmarkLabel(points.at(-1).run))}</span>
      </div>
    </article>
  `;
}

async function loadBenchmarks() {
  try {
    const response = await fetch("assets/data/benchmarks.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    benchmarkRuns = Array.isArray(data.runs)
      ? data.runs
          .filter(
            (run) =>
              run?.schemaVersion === 2 &&
              run?.generatedAt &&
              !String(run?.source?.version || "").includes("-"),
          )
          .sort((left, right) => new Date(left.generatedAt) - new Date(right.generatedAt))
      : [];
    if (benchmarkRuns.length === 0) throw new Error("No benchmark runs published yet");

    const latest = benchmarkRuns.at(-1);
    benchmarkVersion.textContent = benchmarkLabel(latest);
    if (latest.source?.workflowRunUrl) benchmarkRun.href = latest.source.workflowRunUrl;
    benchmarkLatest.hidden = false;
    renderBenchmarkCards();
    benchmarkCharts.innerHTML = Object.keys(benchmarkMetrics)
      .map(renderBenchmarkChart)
      .join("");
    benchmarkLoading.hidden = true;
    benchmarkReport.hidden = false;
  } catch (error) {
    benchmarkLoading.textContent = "Benchmark results will appear here after the next successful Browso CI run.";
    console.warn("Unable to load benchmark history", error);
  }
}

void loadBenchmarks();
