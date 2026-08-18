const FROM = process.env.RESEND_FROM_EMAIL ?? "hello@shopwires.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://shopwires.vercel.app";

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f8fafc; font-family: system-ui, sans-serif; }
  .wrap { max-width:560px; margin:40px auto; background:white; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; }
  .header { background:#4f46e5; padding:28px 32px; }
  .header span { color:white; font-size:20px; font-weight:700; letter-spacing:-0.3px; }
  .body { padding:32px; color:#1e293b; font-size:15px; line-height:1.7; }
  .body p { margin:0 0 16px; }
  .btn { display:inline-block; background:#4f46e5; color:white !important; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; font-size:15px; margin:8px 0 20px; }
  .footer { padding:20px 32px; border-top:1px solid #f1f5f9; font-size:13px; color:#94a3b8; }
  .stat { display:inline-block; background:#f1f5f9; border-radius:8px; padding:12px 20px; margin:4px; text-align:center; }
  .stat-num { font-size:24px; font-weight:700; color:#4f46e5; display:block; }
  .stat-label { font-size:12px; color:#64748b; }
  .highlight { background:#eef2ff; border-left:4px solid #4f46e5; padding:12px 16px; border-radius:0 8px 8px 0; margin:16px 0; }
</style></head>
<body><div class="wrap">
<div class="header"><span>ShopWires</span></div>
<div class="body">${content}</div>
<div class="footer">ShopWires · Soddy Daisy, TN · <a href="${APP_URL}/legal/terms" style="color:#94a3b8">Terms</a> · <a href="${APP_URL}/legal/privacy" style="color:#94a3b8">Privacy</a></div>
</div></body></html>`;
}

export const emails = {
  welcome: (shopName: string, keyword: string) => ({
    from: FROM,
    subject: `Welcome to ShopWires, ${shopName}! 🎉`,
    html: baseTemplate(`
      <p>Hey ${shopName} team,</p>
      <p>Welcome to ShopWires! Your 30-day free trial has started — no credit card needed, no pressure.</p>
      <p>Here's what to do first to get your first opt-in:</p>
      <div class="highlight">
        <strong>Your opt-in keyword is: ${keyword || "set up in your dashboard"}</strong><br>
        Tell customers to text it to your Twilio number to join your loyalty list.
      </div>
      <p><strong>3 quick ways to get your first opt-ins:</strong></p>
      <p>1. Put a small sign at your register or counter<br>
      2. Add it to your receipts<br>
      3. Post it on your social media</p>
      <a href="${APP_URL}/dashboard" class="btn">Go to your dashboard →</a>
      <p>If you haven't connected Twilio yet, do that first in Settings — it only takes 2 minutes.</p>
      <p>Any questions? Just reply to this email.</p>
      <p>— The ShopWires team</p>
    `),
  }),

  day7: (shopName: string, customerCount: number) => ({
    from: FROM,
    subject: `How's it going, ${shopName}?`,
    html: baseTemplate(`
      <p>Hey ${shopName} team,</p>
      <p>You're one week into your ShopWires trial. Here's where things stand:</p>
      <div style="margin:20px 0">
        <div class="stat">
          <span class="stat-num">${customerCount}</span>
          <span class="stat-label">customers on your list</span>
        </div>
      </div>
      ${customerCount === 0 ? `
        <p>Looks like you haven't gotten your first opt-in yet — that's okay! The most common reason is customers just haven't seen the keyword yet.</p>
        <p><strong>Easiest fix:</strong> Print a small sign and put it right at your register. Something like:<br>
        <em>"Join our VIP text list for exclusive deals — text [YOUR KEYWORD] to [YOUR NUMBER]"</em></p>
      ` : `
        <p>Nice work getting your first customers on the list! Now's a good time to set up a win-back campaign so they get a text automatically if they haven't visited in a while.</p>
      `}
      <a href="${APP_URL}/dashboard/campaigns" class="btn">Set up a campaign →</a>
      <p>You have 23 days left in your free trial. No rush — just making sure you're getting value.</p>
      <p>— The ShopWires team</p>
    `),
  }),

  day23: (shopName: string, customerCount: number) => ({
    from: FROM,
    subject: `Your ShopWires trial ends in 7 days`,
    html: baseTemplate(`
      <p>Hey ${shopName} team,</p>
      <p>Your free trial ends in <strong>7 days</strong>. Here's what you've built so far:</p>
      <div style="margin:20px 0">
        <div class="stat">
          <span class="stat-num">${customerCount}</span>
          <span class="stat-label">customers on your list</span>
        </div>
      </div>
      <p>After your trial ends, your account will be paused until you choose a plan. Your customer list and all your data will be saved — nothing gets deleted.</p>
      <p>Plans start at <strong>$29/month</strong> — less than a tank of gas to keep your loyal customers coming back automatically.</p>
      <a href="${APP_URL}/dashboard/billing" class="btn">Choose a plan →</a>
      <p>No pressure — but if you want to keep the automations running, now's a good time to get set up.</p>
      <p>— The ShopWires team</p>
    `),
  }),

  day28: (shopName: string, customerCount: number) => ({
    from: FROM,
    subject: `2 days left on your ShopWires trial`,
    html: baseTemplate(`
      <p>Hey ${shopName} team,</p>
      <p>Just a heads up — your trial ends in <strong>2 days</strong>.</p>
      <p>You've got <strong>${customerCount} customers</strong> on your loyalty list. That's real value sitting there — and your win-back campaigns will stop running when the trial ends.</p>
      <p>To keep everything going without interruption, choose a plan before your trial ends:</p>
      <a href="${APP_URL}/dashboard/billing" class="btn">Keep my account active →</a>
      <p>Starter plan is $29/month. Cancel anytime.</p>
      <p>— The ShopWires team</p>
    `),
  }),

  day30: (shopName: string, customerCount: number) => ({
    from: FROM,
    subject: `Your ShopWires trial has ended`,
    html: baseTemplate(`
      <p>Hey ${shopName} team,</p>
      <p>Your 30-day free trial has ended. Your account is currently paused.</p>
      <p>The good news: your <strong>${customerCount} customers</strong> and all your data are safe. Nothing has been deleted.</p>
      <p>To reactivate your account and keep bringing customers back, choose a plan:</p>
      <a href="${APP_URL}/dashboard/billing" class="btn">Reactivate my account →</a>
      <p>Plans start at $29/month. You'll be back up and running in under a minute.</p>
      <p>If you have any questions or feedback about your trial, just reply to this email — we read every response.</p>
      <p>— The ShopWires team</p>
    `),
  }),
};

export async function sendEmail(to: string, email: { from: string; subject: string; html: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: email.from,
      to,
      subject: email.subject,
      html: email.html,
    }),
  });
  return res.ok;
}
