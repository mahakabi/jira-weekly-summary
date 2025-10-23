import fetch from "node-fetch";
import dotenv from "dotenv";
import { IncomingWebhook } from "@slack/webhook";

dotenv.config();

const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, SLACK_WEBHOOK_URL } =
  process.env;

const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);

// Get the current week's Sunday → Saturday
function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const diffToSunday = day;
  const diffToSaturday = 6 - day;

  const sunday = new Date(now);
  sunday.setDate(now.getDate() - diffToSunday);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(now);
  saturday.setDate(now.getDate() + diffToSaturday);
  saturday.setHours(23, 59, 59, 999);

  const format = (d) => d.toISOString().split("T")[0];
  return { start: format(sunday), end: format(saturday) };
}

async function getJiraTickets() {
  const { start, end } = getWeekRange();

  // Exclude Open tickets
  const jql = `updated >= "${start}" AND updated <= "${end}" AND (assignee = currentUser() OR worklogAuthor = currentUser() OR reporter = currentUser()) AND status != "Open" ORDER BY updated DESC`;

  try {
    console.log("Jira JQL URL:", `${JIRA_BASE_URL}/rest/api/3/search/jql`);
    console.log("Week Range:", start, "→", end);

    const response = await fetch(`${JIRA_BASE_URL}/rest/api/3/search/jql`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${JIRA_EMAIL}:${JIRA_API_TOKEN}`
        ).toString("base64")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jql,
        fields: ["summary", "status"],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Jira API error:", response.status, text);
      return [];
    }

    const data = await response.json();
    return (data.issues || []).map((issue) => ({
      key: issue.key,
      summary: issue.fields?.summary || "No summary",
      status: issue.fields?.status?.name || "Unknown",
      url: `${JIRA_BASE_URL}/browse/${issue.key}`,
    }));
  } catch (error) {
    console.error("Jira API error:", error.message);
    return [];
  }
}

async function sendToSlack(tickets) {
  const { start, end } = getWeekRange();

  if (!tickets.length) {
    await webhook.send({
      text: `🎯 No tickets worked on this week (${start} → ${end}).`,
    });
    return;
  }

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "📝 Weekly Jira Tickets Summary",
        emoji: true,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "plain_text",
          text: `Week: Sunday ${start} → Saturday ${end}`,
          emoji: true,
        },
      ],
    },
    ...tickets.map((t) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${t.url}|${t.key}>* — ${t.summary}\nStatus: \`${t.status}\``,
      },
    })),
    // {
    //   type: "actions",
    //   elements: [
    //     {
    //       type: "button",
    //       text: { type: "plain_text", text: "Ready", emoji: true },
    //       style: "primary",
    //       value: "ready",
    //     },
    //     {
    //       type: "button",
    //       text: { type: "plain_text", text: "Needs Edit", emoji: true },
    //       style: "danger",
    //       value: "edit",
    //     },
    //   ],
    // },
  ];

  await webhook.send({ blocks });
}

(async () => {
  const tickets = await getJiraTickets();
  await sendToSlack(tickets);
})();
