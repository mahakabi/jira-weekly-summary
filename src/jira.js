import axios from "axios";
import dayjs from "dayjs";
import { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } from "./config.js";
import { SystemLogger } from "./logger.js";

// Calculate Sunday → Saturday week range
export function getWeekRange() {
  const now = dayjs();
  const start = now.startOf("week"); // Sundayk
  const end = now.endOf("week"); // Saturday
  return { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") };
}

export async function getJiraTickets() {
  const { start, end } = getWeekRange();
  const jql = `updated >= "${start}" AND updated <= "${end}" AND (assignee = currentUser() OR worklogAuthor = currentUser() OR reporter = currentUser()) AND status != "Open" ORDER BY updated DESC`;

  SystemLogger.info(
    "[Jira Weekly Summary] Fetching Jira tickets with JQL:",
    jql
  );

  try {
    const response = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/search/jql`,
      { jql, fields: ["summary", "status"] },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${JIRA_EMAIL}:${JIRA_API_TOKEN}`
          ).toString("base64")}`,
          Accept: "application/json",
        },
      }
    );

    const tickets = (response.data.issues || []).map((issue) => ({
      key: issue.key,
      summary: issue.fields?.summary || "No summary",
      status: issue.fields?.status?.name || "Unknown",
      url: `${JIRA_BASE_URL}/browse/${issue.key}`,
    }));

    SystemLogger.info(`[Jira Weekly Summary] Found ${tickets.length} tickets`);
    return tickets;
  } catch (error) {
    SystemLogger.error(
      "[Jira Weekly Summary] Failed to fetch Jira tickets:",
      error.message
    );
    return [];
  }
}
