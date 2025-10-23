import dotenv from "dotenv";
dotenv.config();

export const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, SLACK_WEBHOOK_URL } =
  process.env;
