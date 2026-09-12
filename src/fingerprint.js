const crypto = require('crypto');

function makeFingerprint(item) {
  const str = `${item.title}|${item.company}|${item.deadline}`;
  return crypto.createHash('sha256').update(str).digest('hex');
}

module.exports = { makeFingerprint };
