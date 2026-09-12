require('dotenv').config();

module.exports = {
  portal: {
    baseUrl: process.env.PORTAL_BASE_URL,
    username: process.env.PORTAL_USERNAME,
    password: process.env.PORTAL_PASSWORD,
    loginPath: process.env.LOGIN_PATH,
    dashboardPath: process.env.DASHBOARD_PATH,
    fields: {
      username: process.env.LOGIN_USERNAME_FIELD,
      password: process.env.LOGIN_PASSWORD_FIELD,
      extraName: process.env.LOGIN_EXTRA_FIELD_NAME,
      submitField: process.env.LOGIN_SUBMIT_FIELD,
      submitValue: process.env.LOGIN_SUBMIT_VALUE,
    },
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  mail: {
    user: process.env.GMAIL_USER,
    appPassword: process.env.GMAIL_APP_PASSWORD,
    notifyTo: process.env.NOTIFY_EMAIL_TO,
  },
  cronSchedule: process.env.CRON_SCHEDULE || '*/10 * * * *',
};
