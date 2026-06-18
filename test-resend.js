const { Resend } = require('resend');

// Need to pass the user's actual key since it's not in .env.local
const resend = new Resend('re_EP5PuYiJ_FLdeGgwEdr18wk5qsoBpqQLp');

async function run() {
  try {
    const res = await resend.emails.send({
      from: 'Flenjure <system@flenjure.com>',
      to: ['orders@flenjure.com'],
      subject: 'Test Notification',
      html: '<p>Test</p>'
    });
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
