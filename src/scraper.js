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
  // Confirmed via real DevTools payload capture: the extra field is sent
  // EMPTY, not a fixed value — it's a placement-centre selector that's
  // optional for a normal student login.
  form.append(fields.extraName, '');
  form.append(fields.password, password);
  form.append(fields.submitField, fields.submitValue);

  await client.post(`${baseUrl}${loginPath}`, form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  // Don't guess at a keyword in the response body — check the one thing
  // that actually proves a session was established: did the cookie jar
  // capture a session cookie?
  const cookies = await jar.getCookies(baseUrl);
  if (cookies.length === 0) {
    throw new Error(
      'Login request completed but no session cookie was captured. This usually means ' +
      'the field names in .env don\'t match what the form actually sends, or the portal ' +
      'needs a CSRF token first — re-check the real login payload in DevTools > Network.'
    );
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