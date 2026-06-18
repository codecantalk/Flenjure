const { Resend } = require('resend');

const resend = new Resend('re_EP5PuYiJ_FLdeGgwEdr18wk5qsoBpqQLp');

async function run() {
  try {
    const res = await resend.emails.get('490dd368-db24-4e6a-b914-ba3064eddc29'); // The ID from our previous test
    console.log("Status:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
