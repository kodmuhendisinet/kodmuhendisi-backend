import { serverConfig } from "./server";

export const authConfig = {
  jwtSecret: serverConfig.jwtSecret,
  jwtExpiresIn: serverConfig.jwtExpiresIn,
  bcryptRounds: 12,
  refreshTokenExpiresIn: "180d",
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,
  accessTokenExpiry: 30 * 60 * 1000,
  passwordMinLength: 8,
  passwordRequirements: {
    minLength: 8,
    requireLowercase: true,
    requireNumbers: true,
  },
};
