const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const OUTPUT = path.resolve(__dirname, "..", "out", "sample.pdf");

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod " +
  "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, " +
  "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

// The set of one-pagers. Add/remove entries here to change the deck.
const ONE_PAGERS = [
  { title: "Customer Onboarding" },
  { title: "Billing & Invoicing" },
  { title: "Support Operations" },
  { title: "Data Pipeline" },
  { title: "Release Management" },
];

const esc = (s) =>
  String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

function introPage() {
  return `
    <section class="page intro">
      <h1>Flow One-Pagers</h1>
      <p class="subtitle">Insights &amp; impact overview</p>
      <p>${esc(LOREM)}</p>
      <p>${esc(LOREM)}</p>
      <h2>Contents</h2>
      <ol class="toc">
        ${ONE_PAGERS.map((p) => `<li>${esc(p.title)}</li>`).join("\n        ")}
      </ol>
    </section>`;
}

function onePager({ title }, index) {
  return `
    <section class="page">
      <header class="pager-head">
        <span class="eyebrow">One-Pager ${index + 1}</span>
        <h1>${esc(title)}</h1>
      </header>

      <h2>Insights</h2>
      <ul>
        <li>${esc(LOREM)}</li>
        <li>${esc(LOREM)}</li>
        <li>${esc(LOREM)}</li>
      </ul>

      <h2>Impact</h2>
      <div class="metrics">
        <div class="metric"><span class="value">+42%</span><span class="label">Lorem ipsum</span></div>
        <div class="metric"><span class="value">-18%</span><span class="label">Dolor sit</span></div>
        <div class="metric"><span class="value">3.4x</span><span class="label">Consectetur</span></div>
      </div>
      <p>${esc(LOREM)}</p>
    </section>`;
}

function buildHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Flow One-Pagers</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        color: #1a1a1a;
        line-height: 1.55;
        margin: 0;
      }
      /* Each section is its own printed page. */
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }

      h1 { font-size: 26px; margin: 0 0 0.25rem; }
      h2 {
        font-size: 15px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #475569;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 0.25rem;
        margin: 1.75rem 0 0.75rem;
      }
      p, li { font-size: 12px; }

      .intro { display: flex; flex-direction: column; }
      .intro h1 { font-size: 34px; }
      .subtitle { color: #64748b; font-size: 15px; margin: 0 0 2rem; }
      .toc { color: #334155; }
      .toc li { margin: 0.25rem 0; }

      .pager-head { border-left: 4px solid #2563eb; padding-left: 0.75rem; }
      .eyebrow {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #2563eb;
        font-weight: 600;
      }

      .metrics { display: flex; gap: 0.75rem; }
      .metric {
        flex: 1;
        background: #f5f7fa;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.9rem 1rem;
        text-align: center;
      }
      .metric .value { display: block; font-size: 24px; font-weight: 700; color: #0f172a; }
      .metric .label { display: block; font-size: 11px; color: #64748b; margin-top: 0.25rem; }
    </style>
  </head>
  <body>
    ${introPage()}
    ${ONE_PAGERS.map((p, i) => onePager(p, i)).join("\n")}
  </body>
</html>`;
}

async function htmlToPdf() {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(buildHtml(), { waitUntil: "networkidle0" });
    await page.pdf({
      path: OUTPUT,
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
    });
  } finally {
    await browser.close();
  }
  return OUTPUT;
}

htmlToPdf()
  .then((out) => console.log(`Wrote ${out}`))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
