const cron = require('node-cron');
const { login, scrapeDashboard } = require('./scraper');
const { makeFingerprint } = require('./fingerprint');
const { isDuplicate, saveListing } = require('./db');
const { notifyNewListing } = require('./notify');
const { withRetry } = require('./retry');
const config = require('./config');

async function runCycle() {
  console.log(`[${new Date().toISOString()}] Starting scrape cycle`);

  await withRetry(login, { label: 'login' });
  const listings = await withRetry(scrapeDashboard, { label: 'scrape' });

  let newCount = 0;
  for (const item of listings) {
    const fp = makeFingerprint(item);
    const dup = await isDuplicate(fp);
    if (!dup) {
      await saveListing(item, fp);
      await notifyNewListing(item);
      newCount++;
    }
  }
  console.log(`Cycle done. ${newCount} new listing(s) out of ${listings.length}.`);
}

cron.schedule(config.cronSchedule, () => {
  runCycle().catch((err) => console.error('Cycle failed:', err));
});

console.log(`Bot scheduled: ${config.cronSchedule}`);
runCycle().catch((err) => console.error('Initial run failed:', err)); // run once on boot
