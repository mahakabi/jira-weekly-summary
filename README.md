# Jira Weekly Summary

A Node.js script that automatically fetches Jira tickets you worked on during the past week and posts a summary to Slack. Designed for teams to quickly share weekly progress.


## Features

- Fetch Jira tickets updated in the past week (Sunday → Saturday).
- Include tickets where you were **assignee, reporter, or worklog author**.
- Exclude tickets still in **Open** status.
- Posts a **well-formatted Slack message** with ticket summary, status, and link.
- Supports **manual testing** and **automatic weekly scheduling** via GitHub Actions.


## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [GitHub Actions](#github-actions)
- [Testing](#testing)


## Installation

1. Clone the repository:

```bash
git clone https://github.com/mahakabi/jira-weekly-summary.git
cd jira-weekly-summary
```
2. Clone the repository:
```bash
npm install
```

## Configuration

1. Copy the example .env file:
```bash
cp .env.example .env
```
2. Open .env and fill in your credentials:
```bash
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/XXX/XXX
```
- **JIRA_API_TOKEN**: Generate from [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
- **SLACK_WEBHOOK_URL**: Create an Incoming Webhook in your Slack workspace.

## Usage
Run the script locally:
```bash
node index.js
```
- The script will fetch Jira tickets from the past week (Sunday → Saturday) and post the summary to Slack.

- Tickets in Open status are excluded.

- Each ticket includes a clickable link.

## GitHub Actions

Automate weekly reports via GitHub Actions:

**Workflow file**: .github/ ``workflows/weekly-summary.yml``

**Schedule**: Every Sunday 9 AM Riyadh time (UTC+3):
```bash
schedule:
  - cron: "0 6 * * 0"
```

- **Manual trigger**: You can run the workflow anytime via workflow_dispatch.

## Using GitHub Secrets

Set the following repository secrets instead of ``.env`` for automation:

- ``JIRA_BASE_URL``

- ``JIRA_EMAIL``

- ``JIRA_API_TOKEN``

- ``SLACK_WEBHOOK_URL``

The workflow will automatically pick them up.

## Testing

To test the workflow without waiting until Sunday:

- Change the cron schedule temporarily:
```bash
schedule:
  - cron: "*/5 * * * *" # every 5 minutes
```

- Or trigger manually via GitHub Actions → **Run workflow**.
