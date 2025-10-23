import chalk from "chalk";

const showLogs = process.env.DEBUG === "true";

export const SystemLogger = {
  info(message, ...optionalParams) {
    if (showLogs)
      console.log(
        chalk.blue(`[INFO] ${new Date().toISOString()} →`),
        message,
        ...optionalParams
      );
  },
  warn(message, ...optionalParams) {
    if (showLogs)
      console.warn(
        chalk.yellow(`[WARN] ${new Date().toISOString()} →`),
        message,
        ...optionalParams
      );
  },
  error(message, ...optionalParams) {
    if (showLogs)
      console.error(
        chalk.red(`[ERROR] ${new Date().toISOString()} →`),
        message,
        ...optionalParams
      );
  },
};
