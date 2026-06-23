import fs from 'node:fs';
import path from 'node:path';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
const previewUrl = process.env.LIGHTHOUSE_URL || 'http://127.0.0.1:4173';
const outputPath = path.join(__dirname, '..', 'lighthouse-report.json');

const categories = ['performance', 'accessibility', 'best-practices', 'seo'];

async function runLighthouse() {
  if (!fs.existsSync(distIndex)) {
    throw new Error('Production build missing. Run `npm run build` first.');
  }

  const chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox'] });

  try {
    const runnerResult = await lighthouse(previewUrl, {
      logLevel: 'error',
      output: 'json',
      onlyCategories: categories,
      port: chrome.port,
    });

    const report = JSON.parse(runnerResult.report);
    const scores = Object.fromEntries(
      categories.map((category) => [
        category,
        Math.round((report.categories[category]?.score || 0) * 100),
      ]),
    );

    fs.writeFileSync(outputPath, JSON.stringify({ url: previewUrl, scores, generatedAt: new Date().toISOString() }, null, 2));
    console.log(JSON.stringify(scores, null, 2));
  } finally {
    await chrome.kill();
  }
}

runLighthouse().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
