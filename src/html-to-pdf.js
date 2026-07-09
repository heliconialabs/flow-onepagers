const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer");

const INPUT = path.resolve(__dirname, "index.html");
const OUTPUT = path.resolve(__dirname, "..", "out", "flow-onepagers.pdf");

async function htmlToPdf() {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const browser = await puppeteer.launch({
    args: process.env.CI ? ["--no-sandbox", "--disable-setuid-sandbox"] : [],
  });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(INPUT).href, { waitUntil: "networkidle0" });
    await page.pdf({
      path: OUTPUT,
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "22mm", right: "22mm" },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      // Footer: page number on every page.
      footerTemplate: `
        <div style="width:100%; font-family:Arial,Helvetica,sans-serif; font-size:8px; color:#999; padding:0 22mm;">
          <div style="text-align:right;">
            Heliconia Labs &nbsp;&middot;&nbsp; Page <span class="pageNumber"></span>
          </div>
        </div>`,
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
