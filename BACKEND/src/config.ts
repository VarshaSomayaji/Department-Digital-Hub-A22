import dotenv from "dotenv";
dotenv.config();

/**
 * Configuration for the application
 */
const CONFIG = {
  // Application Configuration
  APP_NAME: "SHEILD A Smart LocationAware Mobile Application for Women",
  HOST: process.env.HOST || "http://localhost:8000",
  PORT: process.env.PORT || 8000,
  PRODUCTION: process.env.NODE_ENV === "production",
  CLIENT_URL: process.env.CLIENT_URL || "https://boilerplate.com",

  // Database Configuration
  DB_URL: process.env.DB_URL || "mongodb://localhost:27017/digitalHub",
  DB_POOL_SIZE: 10,

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  JWT_ISSUER: process.env.JWT_ISSUER || "ymtsindia.in",

  // Password Configuration
  SALT_ROUNDS: process.env.SALT_ROUNDS || 10, // the more the salt rounds the more the time it takes to hash the password

  // Mail Configuration
  SMTP_URL: process.env.SMTP_URL || "smtps://cse.takeoff@gmail.com:digkagfgyxcjltup@smtp.gmail.com",
  SMTP_FROM: process.env.SMTP_FROM || "cse.takeoff@gmail.com",

  // Cookie Configuration
  COOKIE_SETTINGS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 10,
  },
};
export default CONFIG;
