import { getJiraTickets } from "./jira.js";
import { sendToSlack } from "./slack.js";
import { SystemLogger } from "./logger.js";

(async () => {
  SystemLogger.info("[Jira Weekly Summary] Started");
  const tickets = await getJiraTickets();
  await sendToSlack(tickets);
  SystemLogger.info("[Jira Weekly Summary] Finished");
})();
