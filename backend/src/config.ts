import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  defaultJpTarget: Number(process.env.DEFAULT_JP_TARGET || 20),
  jitsi: {
    domain: process.env.JITSI_DOMAIN || "meet.jit.si",
    appId: process.env.JITSI_APP_ID || "",
    appSecret: process.env.JITSI_APP_SECRET || "",
  },
  siasn: {
    baseUrl: process.env.SIASN_API_BASE_URL || "",
    clientId: process.env.SIASN_CLIENT_ID || "",
    clientSecret: process.env.SIASN_CLIENT_SECRET || "",
  },
};
