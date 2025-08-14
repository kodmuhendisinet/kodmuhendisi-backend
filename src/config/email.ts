import { serverConfig } from "./server";

export const emailConfig = {
  host: serverConfig.emailHost,
  port: serverConfig.emailPort,
  secure: false, // true for 465, false for other ports
  auth: {
    user: serverConfig.emailUser,
    pass: serverConfig.emailPass,
  },
  from: `"Markaflow" <${serverConfig.emailUser}>`,
  templates: {
    welcome: "welcome-email",
    passwordReset: "password-reset",
    contactNotification: "contact-notification",
    projectUpdate: "project-update",
  },
};
