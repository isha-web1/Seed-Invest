import assert from "node:assert";
import { MongoMemoryServer } from "mongodb-memory-server";

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri("seedinvest_smoke");
process.env.JWT_SECRET = "smoke_test_secret";
process.env.PORT = "5099";
process.env.CLIENT_URL = "http://localhost:3000";

const BASE = "http://localhost:5099/api";

const json = async (res) => {
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
};

const call = (method, path, { token, body } = {}) =>
  fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(json);

const results = [];
const check = (name, cond) => {
  results.push([name, cond]);
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
};

await import("../src/index.js");
await new Promise((r) => setTimeout(r, 1200));

// health
let r = await call("GET", "/health");
check("health ok", r.status === 200 && r.body.status === "ok");

// register supporter + creator
r = await call("POST", "/auth/register", {
  body: {
    display_name: "Smoke Supporter",
    user_email: "smoke.supporter@test.com",
    password: "pass123",
    role: "supporter",
  },
});
check("register supporter gets 50 credits", r.status === 201 && r.body.user.credits === 50);
const supporterToken = r.body.token;

r = await call("POST", "/auth/register", {
  body: {
    display_name: "Smoke Creator",
    user_email: "smoke.creator@test.com",
    password: "pass123",
    role: "creator",
  },
});
check("register creator gets 20 credits", r.status === 201 && r.body.user.credits === 20);
const creatorToken = r.body.token;

// duplicate email rejected
r = await call("POST", "/auth/register", {
  body: {
    display_name: "Dup",
    user_email: "smoke.supporter@test.com",
    password: "pass123",
    role: "supporter",
  },
});
check("duplicate email rejected", r.status === 409);

// weak password rejected
r = await call("POST", "/auth/register", {
  body: { display_name: "Weak", user_email: "weak@test.com", password: "abc", role: "supporter" },
});
check("weak password rejected", r.status === 400);

// login
r = await call("POST", "/auth/login", {
  body: { user_email: "smoke.creator@test.com", password: "pass123" },
});
check("login works", r.status === 200 && !!r.body.token);

// create admin directly
const { default: User } = await import("../src/models/User.js");
await User.create({
  display_name: "Smoke Admin",
  user_email: "smoke.admin@test.com",
  password: "admin123",
  role: "admin",
  credits: 0,
});
r = await call("POST", "/auth/login", {
  body: { user_email: "smoke.admin@test.com", password: "admin123" },
});
const adminToken = r.body.token;
check("admin login works", r.status === 200);

// creator creates campaign
r = await call("POST", "/campaigns", {
  token: creatorToken,
  body: {
    campaign_title: "Smoke Campaign",
    campaign_story: "A test campaign story.",
    category: "Technology",
    funding_goal: 1000,
    minimum_contribution: 10,
    deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
    reward_info: "A badge",
  },
});
check("creator creates pending campaign", r.status === 201 && r.body.campaign.status === "pending");
const campaignId = r.body.campaign._id;

// supporter cannot create campaign (role middleware)
r = await call("POST", "/campaigns", {
  token: supporterToken,
  body: {
    campaign_title: "Nope",
    campaign_story: "x",
    category: "Art",
    funding_goal: 10,
    minimum_contribution: 1,
    deadline: new Date(Date.now() + 86400000).toISOString(),
  },
});
check("role middleware blocks supporter from creating campaign", r.status === 403);

// not visible in explore before approval
r = await call("GET", "/campaigns/explore");
check("pending campaign hidden from explore", r.body.campaigns.length === 0);

// admin approves
r = await call("GET", "/campaigns/pending", { token: adminToken });
check("admin sees pending campaign", r.body.campaigns.length === 1);

r = await call("PATCH", `/campaigns/${campaignId}/review`, {
  token: adminToken,
  body: { action: "approve" },
});
check("admin approves campaign", r.status === 200 && r.body.campaign.status === "approved");

// now visible
r = await call("GET", "/campaigns/explore");
check("approved campaign visible in explore", r.body.campaigns.length === 1);

// top funded
r = await call("GET", "/campaigns/top-funded");
check("top-funded returns campaign", r.body.campaigns.length === 1);

// supporter attempts too-large contribution with only 50 credits -> blocked
r = await call("POST", `/contributions/campaign/${campaignId}`, {
  token: supporterToken,
  body: { contribution_amount: 250, message: "Love it" },
});
check("supporter without enough credits is blocked", r.status === 400);

// buy credits (dummy payments) via checkout package 800
r = await call("POST", "/payments/checkout", { token: supporterToken, body: { packageId: "pack-800" } });
check("dummy credit purchase works", r.status === 200 && r.body.credits === 850);

// now contribute 250
r = await call("POST", `/contributions/campaign/${campaignId}`, {
  token: supporterToken,
  body: { contribution_amount: 250, message: "Love it" },
});
check("supporter contribution created", r.status === 201 && r.body.contribution.status === "pending");
check("credits deducted", r.body.credits === 600);
const contributionId = r.body.contribution._id;

// below minimum blocked
r = await call("POST", `/contributions/campaign/${campaignId}`, {
  token: supporterToken,
  body: { contribution_amount: 5 },
});
check("below-minimum contribution blocked", r.status === 400);

// creator sees pending contribution
r = await call("GET", "/contributions/creator?status=pending", { token: creatorToken });
check("creator sees pending contribution", r.body.contributions.length === 1);

// creator approves
r = await call("PATCH", `/contributions/${contributionId}/review`, {
  token: creatorToken,
  body: { action: "approve" },
});
check("creator approves contribution", r.status === 200 && r.body.contribution.status === "approved");

// campaign raised updated
r = await call("GET", `/campaigns/${campaignId}`);
check("campaign raised updated", r.body.campaign.amount_raised === 250);

// supporter notifications
r = await call("GET", "/notifications", { token: supporterToken });
check("supporter got notification", r.body.notifications.length >= 1);

// supporter stats
r = await call("GET", "/contributions/mine/stats", { token: supporterToken });
check("supporter stats correct", r.body.totalContributed === 250 && r.body.totalContributions === 1);

// creator withdrawal overview
r = await call("GET", "/withdrawals/overview", { token: creatorToken });
check("creator available credits (250 < 200? no, 250>=200)", r.body.availableCredits === 250);

// withdraw 200
r = await call("POST", "/withdrawals", {
  token: creatorToken,
  body: { withdrawal_credit: 200, payment_system: "stripe", account_number: "acct_123" },
});
check("creator withdrawal request created", r.status === 201 && r.body.withdrawal.withdrawal_amount === 10);

// admin approves withdrawal
r = await call("GET", "/withdrawals/pending", { token: adminToken });
check("admin sees pending withdrawal", r.body.withdrawals.length === 1);
r = await call("PATCH", `/withdrawals/${r.body.withdrawals[0]._id}/approve`, { token: adminToken });
check("admin approves withdrawal", r.status === 200 && r.body.withdrawal.status === "approved");

// admin stats
r = await call("GET", "/users/stats", { token: adminToken });
check("admin stats", r.body.totalSupporters === 1 && r.body.totalCreators === 1);

// manage users role change (target the creator so the supporter keeps reporting rights)
r = await call("GET", "/users", { token: adminToken });
const creatorUser = r.body.users.find((u) => u.user_email === "smoke.creator@test.com");
r = await call("PATCH", `/users/${creatorUser.id}/role`, { token: adminToken, body: { role: "admin" } });
check("admin changes role", r.status === 200 && r.body.user.role === "admin");

// reports
r = await call("POST", "/reports", {
  token: supporterToken,
  body: { campaign_id: campaignId, reason: "Looks suspicious" },
});
check("supporter can report campaign", r.status === 201);
r = await call("GET", "/reports", { token: adminToken });
check("admin sees report", r.body.reports.length === 1);

const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
await mongo.stop();
process.exit(failed.length === 0 ? 0 : 1);
