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
const webDemo = document.querySelector("#web-demo");
const webDemoOpeners = document.querySelectorAll("[data-open-web-demo]");
const webDemoClosers = document.querySelectorAll("[data-close-web-demo]");
const webBrowser = webDemo?.querySelector("[data-web-browser]");
const webPageContent = webDemo?.querySelector("[data-web-page-content]");
const webFeed = webDemo?.querySelector("[data-web-feed]");
const webForm = webDemo?.querySelector("[data-web-form]");
const webInput = webDemo?.querySelector("[data-web-input]");
const webSuggestions = webDemo?.querySelector("[data-web-suggestions]");
const webCursor = webDemo?.querySelector("[data-web-cursor]");
const webCursorLabel = webDemo?.querySelector("[data-web-cursor-label]");
const webTabTitle = webDemo?.querySelector("[data-web-tab-title]");
const webDomain = webDemo?.querySelector("[data-web-domain]");
const webPath = webDemo?.querySelector("[data-web-path]");
const webSiteName = webDemo?.querySelector("[data-web-site-name]");
const savedTheme = localStorage.getItem("browso-theme");
const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const demoPrompt = "Find a quiet cabin near a lake for this weekend under $300.";
let demoRun = 0;
let awaitingApproval = false;
let webDemoRun = 0;

const webScenarios = {
  travel: {
    prompt: "Find a quiet lake cabin under $300 for this weekend.",
    eyebrow: "12 stays · this weekend",
    heading: "Cabins made for switching off.",
    meta: "Prices include fees",
    site: "stayfinder",
    tab: "Lake cabins under $300",
    domain: "stayfinder.demo",
    path: "/search/lake-cabins",
    intro: "I’ll compare total price, guest reviews, and cancellation terms.",
    steps: ["Searching 4 trusted sites", "Comparing 12 available stays", "Checking the best match"],
    result: "Pine Lake Cabin is the strongest match: quiet location, 4.9 rating, free cancellation, and $248 total.",
    approval: "Reserve Pine Lake Cabin for $248?",
    approvalNote: "No payment will be made in this demo.",
    success: "Reservation step completed. In the Browso app, you would review the real checkout before anything is submitted.",
    cards: [
      ["Lakeside stays", "Pine Lake Cabin", "4.9 ★ · Quiet · Free cancellation", "$248 total", "PL"],
      ["Cabin finder", "Stillwater Retreat", "4.8 ★ · Lake view · 2 nights", "$276 total", "SR"],
      ["Weekend away", "Cedar Shore Cottage", "4.7 ★ · Private dock", "$289 total", "CS"],
    ],
  },
  shopping: {
    prompt: "Compare noise-cancelling headphones under $350.",
    eyebrow: "8 products · 5 retailers",
    heading: "Hear more. Compare less.",
    meta: "Live-style demo prices",
    site: "soundshop",
    tab: "Noise-cancelling headphones",
    domain: "soundshop.demo",
    path: "/compare/noise-cancelling",
    intro: "I’ll compare comfort, battery life, noise cancellation, and return policy.",
    steps: ["Reading expert reviews", "Comparing prices and policies", "Verifying the best value"],
    result: "The QuietWave Pro offers the best balance: excellent ANC, 38-hour battery, and a 30-day return window at $299.",
    approval: "Add QuietWave Pro to cart for $299?",
    approvalNote: "You stay in control of checkout.",
    success: "Added to the demo cart. The desktop app can continue through a real retailer with your approval.",
    cards: [
      ["Soundshop", "QuietWave Pro", "38h battery · Top-rated ANC", "$299", "QW"],
      ["Audio direct", "Silence 700", "30h battery · Light fit", "$329", "S7"],
      ["Tech market", "Studio Air Max", "42h battery · Rich sound", "$349", "SA"],
    ],
  },
  research: {
    prompt: "Research the best European city for remote work.",
    eyebrow: "24 sources · updated comparison",
    heading: "A clearer place to work from.",
    meta: "Cost, internet, transit, community",
    site: "fieldnotes",
    tab: "Remote work city research",
    domain: "fieldnotes.demo",
    path: "/reports/remote-work-europe",
    intro: "I’ll synthesize current cost, connectivity, transit, and quality-of-life data.",
    steps: ["Reading 24 sources", "Cross-checking key claims", "Building a ranked summary"],
    result: "Valencia ranks first for this brief: strong broadband, lower costs than major capitals, good transit, and an established remote-work community.",
    approval: "Save this comparison to local knowledge?",
    approvalNote: "Saved pages remain under your control.",
    success: "Research saved in the demo. Browso can keep useful pages and notes available for later questions.",
    cards: [
      ["Best overall", "Valencia", "Fast internet · Strong value", "Score 9.1", "VA"],
      ["Best community", "Lisbon", "Large network · Higher rent", "Score 8.7", "LI"],
      ["Best budget", "Kraków", "Low cost · Great transit", "Score 8.5", "KR"],
    ],
  },
};

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

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

function pickWebScenario(prompt) {
  const normalized = prompt.toLowerCase();
  if (/(headphone|buy|shop|product|price|laptop|camera)/.test(normalized)) return "shopping";
  if (/(research|city|remote|source|summar|learn|compare cities)/.test(normalized)) return "research";
  return "travel";
}

function renderWebPage(scenario, selected = false) {
  if (!webPageContent) return;

  webTabTitle.textContent = scenario.tab;
  webDomain.textContent = scenario.domain;
  webPath.textContent = scenario.path;
  webSiteName.textContent = scenario.site;
  webPageContent.innerHTML = `
    <div class="demo-page-heading">
      <div>
        <span>${escapeHTML(scenario.eyebrow)}</span>
        <h3>${escapeHTML(scenario.heading)}</h3>
      </div>
      <small>${escapeHTML(scenario.meta)}</small>
    </div>
    <div class="demo-result-grid">
      ${scenario.cards.map((card, index) => `
        <article class="demo-result${selected && index === 0 ? " is-target" : ""}${selected && index > 0 ? " is-muted" : ""}">
          <div class="demo-result-visual">${escapeHTML(card[4])}</div>
          <div class="demo-result-copy">
            <span>${escapeHTML(card[0])}</span>
            <strong>${escapeHTML(card[1])}</strong>
            <small>${escapeHTML(card[2])}</small>
            <b>${escapeHTML(card[3])}</b>
          </div>
          ${selected && index === 0 ? '<em class="demo-best">Best match</em>' : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function setWebFeed(prompt, scenario) {
  webFeed.innerHTML = `
    <div class="web-message is-user">${escapeHTML(prompt)}</div>
    <div class="web-message is-agent">
      <span class="web-message-mark">B</span>
      <div>
        <span>${escapeHTML(scenario.intro)}</span>
        <div class="web-agent-steps">
          ${scenario.steps.map((step, index) => `
            <div class="web-agent-step" data-web-step="${index}">
              <i></i><span>${escapeHTML(step)}</span>
            </div>
          `).join("")}
        </div>
        <div data-web-response></div>
      </div>
    </div>
  `;
}

function setWebStep(index, state) {
  const step = webFeed?.querySelector(`[data-web-step="${index}"]`);
  if (!step) return;
  step.className = `web-agent-step is-${state}`;
  step.querySelector("i").textContent = state === "done" ? "✓" : "";
}

function moveWebCursor(index, label) {
  if (!webCursor) return;
  const positions = [
    ["31%", "34%"],
    ["58%", "63%"],
    ["38%", "77%"],
  ];
  const [left, top] = positions[index] ?? positions[0];
  webCursor.style.left = left;
  webCursor.style.top = top;
  webCursorLabel.textContent = label;
}

async function runWebDemo(scenarioKey, customPrompt) {
  const scenario = webScenarios[scenarioKey] ?? webScenarios.travel;
  const prompt = customPrompt || scenario.prompt;
  const run = ++webDemoRun;
  const submitButton = webForm?.querySelector('button[type="submit"]');

  renderWebPage(scenario);
  setWebFeed(prompt, scenario);
  webBrowser?.classList.add("is-running");
  if (submitButton) submitButton.disabled = true;
  if (webInput) webInput.value = "";
  webFeed.scrollTop = webFeed.scrollHeight;

  for (let index = 0; index < scenario.steps.length; index += 1) {
    if (run !== webDemoRun) return;
    setWebStep(index, "running");
    moveWebCursor(index, index === 0 ? "Searching" : index === 1 ? "Comparing" : "Checking");
    await new Promise((resolve) => window.setTimeout(resolve, reducedMotion.matches ? 40 : 850));
    if (run !== webDemoRun) return;
    setWebStep(index, "done");
  }

  renderWebPage(scenario, true);
  webBrowser?.classList.remove("is-running");
  const response = webFeed?.querySelector("[data-web-response]");
  if (response) {
    response.innerHTML = `
      <p>${escapeHTML(scenario.result)}</p>
      <div class="web-approval">
        <span>Approval required</span>
        <strong>${escapeHTML(scenario.approval)}</strong>
        <small>${escapeHTML(scenario.approvalNote)}</small>
        <div class="web-approval-actions">
          <button type="button" data-web-approve>Approve in demo</button>
          <button type="button" data-web-decline>Not now</button>
        </div>
      </div>
    `;
  }
  if (submitButton) submitButton.disabled = false;
  webFeed.scrollTop = webFeed.scrollHeight;

  response?.querySelector("[data-web-approve]")?.addEventListener("click", () => {
    response.innerHTML = `
      <div class="web-result-message">
        <strong>Done with your approval.</strong><br />
        ${escapeHTML(scenario.success)}
        <br /><a href="#download" data-demo-download-link>Download Browso →</a>
      </div>
    `;
    response.querySelector("[data-demo-download-link]")?.addEventListener("click", () => {
      webDemo?.close();
    });
    webFeed.scrollTop = webFeed.scrollHeight;
  });

  response?.querySelector("[data-web-decline]")?.addEventListener("click", () => {
    response.innerHTML = `
      <div class="web-result-message">
        Stopped. Nothing was submitted. That approval boundary is built into Browso.
      </div>
    `;
  });
}

function openWebDemo(event) {
  event?.preventDefault();
  if (!webDemo?.open) {
    renderWebPage(webScenarios.travel);
    webDemo.showModal();
    window.setTimeout(() => webInput?.focus(), 120);
  }
}

function closeWebDemo() {
  webDemoRun += 1;
  webBrowser?.classList.remove("is-running");
  webDemo?.close();
}

webDemoOpeners.forEach((opener) => opener.addEventListener("click", openWebDemo));
webDemoClosers.forEach((closer) => closer.addEventListener("click", () => {
  if (closer.matches('a[href="#download"]')) {
    webDemo?.close();
    return;
  }
  closeWebDemo();
}));

webSuggestions?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-demo-scenario]");
  if (!button) return;
  void runWebDemo(button.dataset.demoScenario);
});

webForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = webInput?.value.trim();
  if (!prompt) {
    webInput?.focus();
    return;
  }
  void runWebDemo(pickWebScenario(prompt), prompt);
});

webInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    webForm?.requestSubmit();
  }
});

webDemo?.addEventListener("click", (event) => {
  if (event.target === webDemo) closeWebDemo();
});

webDemo?.addEventListener("close", () => {
  webDemoRun += 1;
  webBrowser?.classList.remove("is-running");
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

if (new URLSearchParams(window.location.search).get("demo") === "1") {
  window.setTimeout(() => openWebDemo(), 120);
}

if (demo) {
  window.setTimeout(() => playDemo({ scroll: false }), 450);
}

const benchmarkMetrics = {
  productionBuild: "Production build",
  tests: "Automated tests",
  nodeTypecheck: "Node type check",
  webTypecheck: "Web type check",
  lint: "Linting",
  formatting: "Formatting",
};

const benchmarkLoading = document.querySelector("[data-benchmark-loading]");
const benchmarkDashboard = document.querySelector("[data-benchmark-dashboard]");
const benchmarkCards = document.querySelector("[data-benchmark-cards]");
const benchmarkChart = document.querySelector("[data-benchmark-chart]");
const benchmarkMetric = document.querySelector("[data-benchmark-metric]");
const benchmarkChartTitle = document.querySelector("[data-benchmark-chart-title]");
const benchmarkLatest = document.querySelector("[data-benchmark-latest]");
const benchmarkVersion = document.querySelector("[data-benchmark-version]");
const benchmarkRun = document.querySelector("[data-benchmark-run]");
const benchmarkOldest = document.querySelector("[data-benchmark-oldest]");
const benchmarkNewest = document.querySelector("[data-benchmark-newest]");
let benchmarkRuns = [];

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

function renderBenchmarkChart(metric) {
  const points = benchmarkRuns
    .map((run) => ({ run, value: benchmarkMedian(run, metric) }))
    .filter(({ value }) => Number.isFinite(value));

  benchmarkChartTitle.textContent = benchmarkMetrics[metric];
  if (points.length === 0) {
    benchmarkChart.textContent = "No measurements are available for this metric.";
    return;
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

  benchmarkChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${benchmarkMetrics[metric]} trend">
      <defs>
        <linearGradient id="benchmark-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2d6bff" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#2d6bff" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${grid}
      <polygon class="benchmark-area" points="${area}" />
      <polyline class="benchmark-line" points="${coordinates.join(" ")}" />
      ${circles}
    </svg>
  `;

  benchmarkOldest.textContent = benchmarkLabel(points[0].run);
  benchmarkNewest.textContent = benchmarkLabel(points.at(-1).run);
}

async function loadBenchmarks() {
  if (!benchmarkDashboard) return;

  try {
    const response = await fetch("assets/data/benchmarks.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    benchmarkRuns = Array.isArray(data.runs)
      ? data.runs
          .filter((run) => run?.schemaVersion === 2 && run?.generatedAt)
          .sort((left, right) => new Date(left.generatedAt) - new Date(right.generatedAt))
      : [];
    if (benchmarkRuns.length === 0) throw new Error("No benchmark runs published yet");

    const latest = benchmarkRuns.at(-1);
    benchmarkVersion.textContent = benchmarkLabel(latest);
    if (latest.source?.workflowRunUrl) benchmarkRun.href = latest.source.workflowRunUrl;
    benchmarkLatest.hidden = false;
    renderBenchmarkCards();
    renderBenchmarkChart(benchmarkMetric.value);
    benchmarkLoading.hidden = true;
    benchmarkDashboard.hidden = false;
  } catch (error) {
    benchmarkLoading.textContent = "Benchmark results will appear here after the next successful Browso CI run.";
    console.warn("Unable to load benchmark history", error);
  }
}

benchmarkMetric?.addEventListener("change", () => renderBenchmarkChart(benchmarkMetric.value));
void loadBenchmarks();
