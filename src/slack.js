import { IncomingWebhook } from "@slack/webhook";
import { SLACK_WEBHOOK_URL } from "./config.js";
import { getWeekRange } from "./jira.js";
import { SystemLogger } from "./logger.js";

const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);

export async function sendToSlack(tickets) {
  const { start, end } = getWeekRange();

  if (!tickets.length) {
    SystemLogger.info("[Jira Weekly Summary] No tickets to send to Slack.");
    return await webhook.send({
      text: `🎯 No tickets worked on this week (${start} → ${end}).`,
    });
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
  ];

  SystemLogger.info("[Jira Weekly Summary] Sending tickets to Slack...");
  await webhook.send({ blocks });
}
