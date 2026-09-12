const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const config = require('./config');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

async function login() {
  const { baseUrl, loginPath, username, password, fields } = config.portal;
  const form = new URLSearchParams();
  form.append(fields.username, username);
  form.append(fields.password, password);
  form.append(fields.extraName, 'BTECH'); // adjust if this is dynamic
  form.append(fields.submitField, fields.submitValue);

  const res = await client.post(`${baseUrl}${loginPath}`, form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.data.includes('logout') /* adjust check to match a real logged-in page marker */) {
    throw new Error('Login failed — check credentials or selectors');
  }
}

async function scrapeDashboard() {
  const { baseUrl, dashboardPath } = config.portal;
  const res = await client.get(`${baseUrl}${dashboardPath}`);
  const $ = cheerio.load(res.data);

  const listings = [];
  $('table tr').each((i, el) => {
    // adjust selector to match the real table structure on your portal
    const cells = $(el).find('td');
    if (cells.length > 0) {
      listings.push({
        title: $(cells[0]).text().trim(),
        company: $(cells[1]).text().trim(),
        deadline: $(cells[2]).text().trim(),
        raw: $(el).html(),
      });
    }
  });
  return listings;
}

module.exports = { login, scrapeDashboard };
