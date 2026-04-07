import jwt from "jsonwebtoken";
import config from "../config";
import multer from "multer";
import { v4 as uuid } from "uuid";
import nodemailer from "nodemailer";
import { Request } from "express";
import { Role, RoleEnum, TokenInfo } from "../types";
import { stat, unlink, readFile } from "fs/promises";
import { FOLDER_PATH } from "../constants";
import path from "path";
import { Model } from "mongoose";
import { Admin, Faculty, HOD, IBaseUser, Student } from "../models";

export const generateJwtToken = (user: IBaseUser | TokenInfo, role: Role) => {
  const dataToAdd = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role,
  } as TokenInfo;

  const token = jwt.sign(dataToAdd, config.JWT_SECRET, {
    issuer: config.JWT_ISSUER,
  });

  return token;
};

export const uploadLocal = multer({
  storage: multer.diskStorage({
    destination: (_: Request, __: Express.Multer.File, cb: Function) => {
      cb(null, path.join(process.cwd(), FOLDER_PATH.PUBLIC, FOLDER_PATH.UPLOADS));
    },
    filename: (_: Request, file: Express.Multer.File, cb: Function) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
    files: 1000, // max 1000 files
  },
});

export const uploadFile = async (file?: Express.Multer.File) => {
  if (!file) return "";
  return `${config.HOST}/static/${FOLDER_PATH.UPLOADS}/${file.filename}`;
};

export const removeFile = async (file?: Express.Multer.File) => {
  try {
    if (!file) return;
    const fileStat = await stat(file.path);
    if (fileStat.isFile()) {
      await unlink(file.path);
      console.log(`File on path ${file.path} deleted successfully`);
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 *
 * @param url - the url to remove
 * @returns true if the file is removed successfully or else false if not removed
 */
export const removeFileInURL = async (url?: string) => {
  try {
    if (!url) return false;

    const fileName = url.split("/").pop();

    if (!fileName) return false;

    const filePath = path.join(
      process.cwd(),
      FOLDER_PATH.PUBLIC,
      FOLDER_PATH.UPLOADS,
      fileName
    );

    const fileStat = await stat(filePath);

    if (fileStat.isFile()) {
      unlink(filePath);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * @description - nodemailer transporter
 * @returns - nothing
 * instance of nodemailer transporter
 */
const transpoter = nodemailer.createTransport(config.SMTP_URL, {});

export const sendMail = async (
  to: string,
  subject: string,
  templateName: string, // we can keep this but allow passing html directly
  variables?: Record<string, string> | { html: string }
) => {
  try {
    let htmlContent = "";
    if (variables && "html" in variables) {
      htmlContent = variables.html;
    } else {
      const templatePath = path.join(process.cwd(), "mail-templates", templateName);
      let template = await readFile(templatePath, "utf-8");
      const keys = Object.keys(variables || {});
      keys.forEach((key) => {
        template = template.replace(new RegExp(`{{${key}}}`, "g"), variables![key]);
      });
      htmlContent = template;
    }

    await transpoter.sendMail({
      from: config.SMTP_FROM,
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error(error, "failed to send mail");
  }
};

export const getUserByRole = async (role: Role, query?: Record<string, any>) => {
  try {
    switch (role) {
      case RoleEnum.ADMIN:
        return await Admin.findOne(query);
      case RoleEnum.HOD:
        return await HOD.findOne(query);
      case RoleEnum.FACULTY:
        return await Faculty.findOne(query);
      case RoleEnum.STUDENT:
        return await Student.findOne(query);
      default:
        return null;
    }
  } catch (error) {
    return null;
  }
};

export const getModelByRole = (role: Role) => {
  switch (role) {
    case RoleEnum.ADMIN:
      return Admin;
    case RoleEnum.HOD:
      return HOD;
    case RoleEnum.FACULTY:
      return Faculty;
    case RoleEnum.STUDENT:
      return Student;
    default:
      return null;
  }
};
