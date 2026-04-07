import express from "express";
import cors from "cors";
import compression from "compression";
import config from "./config";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { TokenInfo } from "./types";
import cookieParser from "cookie-parser";
import {
  FOLDER_PATH,
  blueText,
  greenText,
  redLogger,
  redText,
} from "./constants";
import { memberAuthHandler } from "./middlewares/AuthHandler";
import ErrorHandler from "./middlewares/ErrorHandler";
import mongoose from "mongoose";
import CONFIG from "./config";
import { paginationChecker } from "./middlewares/PaginationChecker";
import { Admin } from "./models";
import { hash } from "bcrypt";
import { startNotificationJobs } from "./jobs/notification.job";

const publicFolderPath = path.join(process.cwd(), FOLDER_PATH.PUBLIC);
const uploadFolderPath = path.join(publicFolderPath, FOLDER_PATH.UPLOADS);

console.log(blueText, "🚀 Application Starting...", blueText);
// 📁 Public Folder Creation
if (!fs.existsSync(publicFolderPath)) {
  fs.mkdirSync(publicFolderPath);
  console.log(blueText, "📁 Public Folder Created", blueText);
} else {
  console.log(blueText, "📁 Public Folder Exists", blueText);
}

if (!fs.existsSync(uploadFolderPath)) {
  fs.mkdirSync(uploadFolderPath);
  console.log(blueText, "📁 Uploads Folder Created", blueText);
} else {
  console.log(blueText, "📁 Uploads Folder Exists", blueText);
}

const corsConfig = {
  credentials: true,
  origin: [
    "http://localhost:3000/",
    "http://localhost:3000"
  ],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};

//! 🚀 Create an instance of express
const app = express();

app.use(morgan("dev")); //! 📝 Log HTTP or HTTPS requests

app.use(cors(corsConfig)); //! 📝 Enable Cross-Origin Resource Sharing (CORS)

app.use(express.json()); //! 📝 Parse JSON bodies

app.use(cookieParser()); //! 📝 Parse Cookie headers

app.use(compression()); //! 📝 Compress HTTP or HTTPS responses

app.use("/static", express.static(publicFolderPath)); //! 📝 Serve Static Files

/**
 * ? 🌐 Global Declaration
 */
declare global {
  namespace Express {
    interface Request {
      user: TokenInfo;
      prevObject: any;
    }
  }
}

// 🔄 Immediately Invoked Function Expression (IIFE) for async initialization
(async () => {
  try {
    // 📦 Database Initialization
    console.log(blueText, "📦  Database Initialization Started", blueText);
    // connecting to database
    await mongoose.connect(CONFIG.DB_URL, {
      maxPoolSize: CONFIG.DB_POOL_SIZE,
    });
    const admin = await Admin.findOne({ email: "admin.secure@company-demo.com" });
    if (!admin) {
      await Admin.create({
        name: "Company_Admin",
        email: "admin.secure@company-demo.com",
        isApproved: "true",
        password: await hash("  ", CONFIG.SALT_ROUNDS),
      });
      console.log(greenText, "📦  Admin User Created", greenText);
    }
    console.log(greenText, "📦  Database Initialization Completed", greenText);
    console.log(greenText, `📦  Connected To ${config.DB_URL} `, greenText);
    // 🌐 Server Initialization
    console.log(
      blueText,
      ` Starting the server on port ${config.PORT}...`,
      blueText
    );
    startNotificationJobs();
    try {
      app.listen(config.PORT, () => {
        console.log(
          greenText,
          `🎧 Server is listening on port: ${config.PORT} 🚀`,
          greenText
        );
      });
    } catch (error) {
      console.log(
        redText,
        "🚨 Error in server initialization \n",
        JSON.stringify(error).replace(/,|{|}|and/g, "\n"),
        redText
      );
    }
  } catch (error) {
    // console.log("🚨 Error in server initialization", error);
    console.log(
      redText,
      "🚨 Error in server initialization \n",
      JSON.stringify(error).replace(/,|{|}|and/g, "\n"),
      redText
    );
    // 🛑 restart by executing rs in cmd
    redLogger("🛑 Application Stopped due to error in server initialization");
    process.exit(1);
  }
})();

/**
 * ! This is the Health check of the application
 */
app.get("/", (_, res) => {
  res.json({
    status: "OK",
    health: "✅ Good",
    message: `Welcome to the API of ${config.APP_NAME}`,
  });
});

app.use(paginationChecker); //! 🚨 Pagniation Middleware
app.use(memberAuthHandler); //! 🚨 Auth Middleware

app.use("/api/auth", require("./controllers/user").default);
app.use("/api/announcements", require("./controllers/announcement").default);
app.use("/api/polls", require("./controllers/poll").default);
app.use("/api/placements", require("./controllers/placement").default);
app.use("/api/attendance", require("./controllers/attendance").default);
app.use("/api/marks", require("./controllers/marks").default);
app.use("/api/quizzes", require("./controllers/quiz").default);
app.use("/api/timetable", require("./controllers/timetable").default);
app.use("/api/notes", require("./controllers/note").default);
app.use("/api/leave", require("./controllers/leave").default);
app.use("/api/classroom", require("./controllers/classroom").default);
app.use("/api/projects", require("./controllers/project").default);
app.use("/api/ai", require("./controllers/ai").default);
app.use("/api/analytics", require("./controllers/analytics").default);
app.use("/api/students", require("./controllers/student").default);
app.use("/api/admin/stats", require("./controllers/adminStats").default);
app.use("/api/department", require("./controllers/department").default);

app.use("*", (_, res) => {
  res.status(404).json({
    status: "Not Found",
    health: "❌ Bad",
    msg: `Route Not Found`,
  });
});

//! 🚨 Error Middleware came here and the response is given back
app.use(ErrorHandler);







