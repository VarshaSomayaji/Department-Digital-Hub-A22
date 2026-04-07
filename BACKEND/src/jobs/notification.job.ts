import cron from "node-cron";
import { Announcement } from "../models/announcement.model";
import { PlacementDrive } from "../models/placementDrive.model";
import { Poll } from "../models/poll.model";
import { Quiz } from "../models/quiz.model";
import { Student, Faculty, HOD, Admin } from "../models";
import { sendMail, getModelByRole } from "../constants/lib"; // import getModelByRole
import { Role, RoleEnum } from "../types";

// Helper to get user emails by role and optional filter
const getUserEmailsByRole = async (role: Role, filter: any = {}): Promise<string[]> => {
  const model = getModelByRole(role);
  if (!model) return [];
  const users = await (model as any).find(filter).select("email");
  return users.map((u: any) => u.email);
};

// Helper to get user name by role and ID
const getUserNameById = async (role: string, id: string): Promise<string | null> => {
  // Convert stored role to uppercase for getModelByRole (it expects Role enum)
  const roleUpper = role.toUpperCase() as Role;
  const model = getModelByRole(roleUpper);
  if (!model) return null;
  const user = await (model as any).findById(id).select("name");
  return user ? user.name : null;
};

// 1. Send email notifications for new announcements
const sendNewAnnouncementEmails = async () => {
  const announcements = await Announcement.find({ emailSent: false });
  for (const ann of announcements) {
    // Fetch poster's name manually
    const posterName = await getUserNameById(ann.postedBy.role, ann.postedBy.id.toString());
    const postedByName = posterName || "Department";

    // Determine recipients based on targetAudience
    const targetRoles = ann.targetAudience; // e.g., ["STUDENT", "FACULTY"]
    const recipientEmails: string[] = [];
    for (const role of targetRoles) {
      const emails = await getUserEmailsByRole(role as Role);
      recipientEmails.push(...emails);
    }
    const uniqueEmails = [...new Set(recipientEmails)];
    if (uniqueEmails.length === 0) continue;

    const subject = `New Announcement: ${ann.title}`;
    const html = `
      <h2>${ann.title}</h2>
      <p><strong>Posted by:</strong> ${postedByName} (${ann.postedBy.role})</p>
      <p>${ann.content}</p>
      <p><small>View in the Department Digital Hub for more details.</small></p>
    `;

    for (const email of uniqueEmails) {
      await sendMail(email, subject, "announcement", { html });
    }

    ann.emailSent = true;
    await ann.save();
  }
};

// 2. Send reminders for polls nearing expiry
const sendPollReminders = async () => {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const polls = await Poll.find({
    expiresAt: { $lte: next24h, $gte: now },
    reminderSent: false,
  });

  for (const poll of polls) {
    // Get all target users (ADMIN, HOD, FACULTY, STUDENT)
    const targetRoles = poll.targetAudience;
    const allTargetUsers: { id: string; email: string }[] = [];

    for (const role of targetRoles) {
      const model = getModelByRole(role as Role);
      if (!model) continue;
      const users = await (model as any).find().select("_id email");
      allTargetUsers.push(...users.map((u: any) => ({ id: u._id.toString(), email: u.email })));
    }

    // Get users who have already responded
    const respondedUserIds = poll.responses.map((r) => r.user.id.toString());

    const nonResponders = allTargetUsers.filter((u) => !respondedUserIds.includes(u.id));
    if (nonResponders.length === 0) continue;

    const subject = `Reminder: Poll "${poll.question}" ends soon`;
    const html = `
      <p>The poll <strong>"${poll.question}"</strong> will expire on ${poll.expiresAt.toLocaleString()}.</p>
      <p>Please cast your vote before the deadline.</p>
      <p><a href="${process.env.CLIENT_URL}/polls/${poll._id}">Click here to vote</a></p>
    `;

    for (const user of nonResponders) {
      await sendMail(user.email, subject, "poll-reminder", { html });
    }

    poll.reminderSent = true;
    await poll.save();
  }
};

// 3. Send alerts for upcoming quizzes
const sendQuizReminders = async () => {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const quizzes = await Quiz.find({
    startTime: { $lte: next24h, $gte: now },
    reminderSent: false,
  });

  for (const quiz of quizzes) {
    const students = await Student.find({ batch: quiz.batch }).select("email");
    if (students.length === 0) continue;

    const subject = `Upcoming Quiz: ${quiz.title}`;
    const html = `
      <h3>Quiz: ${quiz.title}</h3>
      <p><strong>Subject:</strong> ${quiz.subject}</p>
      <p><strong>Batch:</strong> ${quiz.batch}</p>
      <p><strong>Start Time:</strong> ${quiz.startTime.toLocaleString()}</p>
      <p><strong>Duration:</strong> ${quiz.duration} minutes</p>
      <p>Please be ready. The quiz will be available in the portal at the scheduled time.</p>
    `;

    for (const student of students) {
      await sendMail(student.email, subject, "quiz-reminder", { html });
    }

    quiz.reminderSent = true;
    await quiz.save();
  }
};

// 4. New placement drive emails
const sendNewPlacementDriveEmails = async () => {
  const drives = await PlacementDrive.find({ emailSent: false });
  for (const drive of drives) {
    // Get poster's name (optional)
    const posterName = await getUserNameById(drive.postedBy.role, drive.postedBy.id.toString());

    const students = await Student.find().select("email");
    const emails = students.map((s) => s.email);
    if (emails.length === 0) continue;

    const subject = `New Placement Drive: ${drive.companyName} - ${drive.jobProfile}`;
    const html = `
      <h2>${drive.companyName} - ${drive.jobProfile}</h2>
      <p><strong>Description:</strong> ${drive.description}</p>
      <p><strong>Eligibility:</strong> ${drive.eligibility}</p>
      <p><strong>Last Date to Apply:</strong> ${drive.lastDateToApply.toLocaleDateString()}</p>
      <p><strong>Drive Date:</strong> ${drive.driveDate.toLocaleDateString()}</p>
      <p>Check the placement section for more details and application link.</p>
    `;

    for (const email of emails) {
      await sendMail(email, subject, "placement-drive", { html });
    }

    drive.emailSent = true;
    await drive.save();
  }
};

// Master job that runs every hour
export const startNotificationJobs = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("Running notification jobs...");
    try {
      await sendNewAnnouncementEmails();
      await sendNewPlacementDriveEmails();
      await sendPollReminders();
      await sendQuizReminders();
      console.log("Notification jobs completed.");
    } catch (error) {
      console.error("Error in notification jobs:", error);
    }
  });
};