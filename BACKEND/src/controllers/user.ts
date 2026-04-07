import asyncHandler from "../middlewares/AsyncHandler";
import { CookieOptions, Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import { validate, dbUserDelete } from "../middlewares/Validator";
import {
  idValidater,
  loginValidator,
  roleParamsValidater,
  forgotPasswordValidator,
} from "../validators";
import { Admin, HOD, Faculty, Student, IBaseUser } from "../models";
import { RoleEnum, Role } from "../types";
import { BadRequest, Unauthorized } from "../customErrors";
import {
  generateJwtToken,
  getModelByRole,
  getUserByRole,
  uploadLocal,
  removeFile,
} from "../constants/lib";
import CONFIG from "../config";
import { allowRoles } from "../middlewares/RoleGuard";

const router = Router();

// ----------------------------------------------------------------------
// Helper to extract common fields from request body
// ----------------------------------------------------------------------
const extractCommonFields = (body: any) => ({
  name: body.name,
  email: body.email,
  password: body.password,
  mobileNumber: body.mobileNumber,
  address: body.address,
  image: body.image, // will be overwritten by file upload
});

// ----------------------------------------------------------------------
// GET /me – current logged in user
// ----------------------------------------------------------------------
router.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const { _id: userId, role } = req.user;
    const Model = getModelByRole(role) as any;
    if (!Model) throw new BadRequest("Invalid role");

    const user = await Model.findById(userId).select("-password");
    if (!user) throw new BadRequest(`User not found`);
    const userObj = user.toObject();
    const userWithRole = { ...userObj, role };
    res.json(userWithRole);
  }),
);

// ----------------------------------------------------------------------
// GET /users – list all users (Admin only)
// ----------------------------------------------------------------------
router.get(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    // Only admins can list all users
    if (req.user.role !== RoleEnum.ADMIN) {
      throw new Unauthorized("Access denied");
    }

    const { page = 1, limit = 10, search = "", role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const searchRegex = new RegExp(search as string, "i");

    // Build search filter
    const searchFilter = search
      ? {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { mobileNumber: searchRegex },
          ],
        }
      : {};

    let results: any[] = [];
    let total = 0;

    // If a specific role is requested, query only that model
    if (role && Object.values(RoleEnum).includes(role as RoleEnum)) {
      const Model = getModelByRole(role as Role) as any;
      if (!Model) throw new BadRequest("Invalid role");
      const [users, count] = await Promise.all([
        Model.find(searchFilter)
          .select("-password")
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Model.countDocuments(searchFilter),
      ]);
      results = users;
      total = count;
    } else {
      // Otherwise query all four collections and combine manually (simplistic pagination)
      // For production, consider a more efficient approach (e.g., aggregation with $facet)
      const models = [Admin, HOD, Faculty, Student];
      const allUsers = await Promise.all(
        models.map((M) =>
          (M as any).find(searchFilter).select("-password").lean(),
        ),
      );
      const combined = allUsers.flat();
      total = combined.length;
      // Simple pagination after combining
      results = combined.slice(skip, skip + Number(limit));
    }

    res.json({
      users: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }),
);

// ----------------------------------------------------------------------
// GET /users/:id – get user by ID (Admin or self)
// ----------------------------------------------------------------------
router.get(
  "/users/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role: userRole, _id: userId } = req.user;

    // Only admins or the user themselves can access
    if (userRole !== RoleEnum.ADMIN && userId.toString() !== id) {
      throw new Unauthorized("Access denied");
    }

    // Search across all models
    const models = [Admin, HOD, Faculty, Student];
    let foundUser = null;
    for (const Model of models) {
      foundUser = await (Model as any).findById(id).select("-password").lean();
      if (foundUser) break;
    }

    if (!foundUser) {
      throw new BadRequest(`User with id ${id} not found`);
    }

    res.json(foundUser);
  }),
);

// ----------------------------------------------------------------------
// GET /dropdown – get users by role (for select inputs)
// ----------------------------------------------------------------------
router.get(
  "/dropdown",
  validate(roleParamsValidater),
  asyncHandler(async (req: Request, res: Response) => {
    const { q, role } = req.query as { q?: string; role: Role };

    const Model = getModelByRole(role) as any;
    if (!Model) throw new BadRequest("Invalid role");

    const filter: any = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { mobileNumber: { $regex: q, $options: "i" } },
      ];
    }

    const users = await Model.find(filter)
      .select("name email mobileNumber image")
      .sort({ name: 1 });

    res.json(users);
  }),
);

// ----------------------------------------------------------------------
// POST /register – create a new user (any role)
// ----------------------------------------------------------------------
router.post(
  "/register",
  uploadLocal.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    const { role, ...body } = req.body;
    const file = req.file;

    // Validate role
    if (!role || !Object.values(RoleEnum).includes(role)) {
      await removeFile(file);
      throw new BadRequest("Valid role is required");
    }

    const Model = getModelByRole(role as Role) as any;
    if (!Model) {
      await removeFile(file);
      throw new BadRequest("Invalid role");
    }

    // Extract common fields
    const { name, email, password, mobileNumber, address } =
      extractCommonFields(body);

    // Basic validation
    if (!name || !email || !password || !mobileNumber || !address) {
      await removeFile(file);
      throw new BadRequest(
        "Name, email, password, mobile number, and address are required",
      );
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await removeFile(file);
      throw new BadRequest("Invalid email format");
    }

    // Mobile (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      await removeFile(file);
      throw new BadRequest("Mobile number must be 10 digits");
    }

    // Check uniqueness (email)
    const existing = await Model.findOne({ email });
    if (existing) {
      await removeFile(file);
      throw new BadRequest(`Email already registered as ${role}`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      CONFIG.SALT_ROUNDS || 10,
    );

    // Build user data – common fields
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      address,
      image: file
        ? `${CONFIG.HOST}/static/uploads/${file.filename}`
        : undefined,
      accountStatus: "Active", // or "Pending" if approval needed
      lastLogin: new Date(),
    };

    // Add role‑specific fields
    switch (role) {
      case RoleEnum.HOD:
        userData.department = body.department;
        userData.employeeId = body.employeeId;
        if (!userData.department || !userData.employeeId) {
          await removeFile(file);
          throw new BadRequest(
            "Department and employeeId are required for HOD",
          );
        }
        break;
      case RoleEnum.FACULTY:
        userData.department = body.department;
        userData.employeeId = body.employeeId;
        userData.subjects = body.subjects
          ? body.subjects.split(",").map((s: string) => s.trim())
          : [];
        if (!userData.department || !userData.employeeId) {
          await removeFile(file);
          throw new BadRequest(
            "Department and employeeId are required for Faculty",
          );
        }
        break;
      case RoleEnum.STUDENT:
        userData.rollNo = body.rollNo;
        userData.batch = body.batch;
        userData.department = body.department;
        if (!userData.rollNo || !userData.batch || !userData.department) {
          await removeFile(file);
          throw new BadRequest(
            "Roll number, batch, and department are required for Student",
          );
        }
        break;
      // Admin has no extra fields beyond common
    }

    const newUser = await Model.create(userData);
    const { password: _, ...userResponse } = newUser.toObject();

    res.status(201).json({
      msg: `${role} registered successfully`,
      user: userResponse,
    });
  }),
);

// ----------------------------------------------------------------------
// POST /login – authenticate user
// ----------------------------------------------------------------------
router.post(
  "/login",
  validate(loginValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    const user: any = await getUserByRole(role, { email });
    if (!user) throw new BadRequest(`No ${role} found with email ${email}`);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequest("Invalid password");

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateJwtToken(user, role);
    res.cookie("token", token, CONFIG.COOKIE_SETTINGS as CookieOptions);

    const userWithoutPassword = user.toObject();
    const userWithRole = { ...userWithoutPassword, role };

    res.json({
      msg: "Logged in successfully",
      user: userWithRole,
    });
  }),
);

// ----------------------------------------------------------------------
// POST /change-password – change password for logged in user
// ----------------------------------------------------------------------
router.post(
  "/change-password",
  validate(forgotPasswordValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { newPassword, role } = req.body;
    const { email } = req.user;

    // Verify that the role in token matches the requested role
    if (role !== req.user.role) {
      throw new Unauthorized("Role mismatch");
    }

    const user = await getUserByRole(role, { email });
    if (!user) throw new BadRequest(`User not found`);

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw new BadRequest(
        "New password cannot be the same as the old password",
      );
    }

    const hashed = await bcrypt.hash(newPassword, CONFIG.SALT_ROUNDS);
    await user.updateOne({ password: hashed });

    res.json({ msg: "Password changed successfully" });
  }),
);

// ----------------------------------------------------------------------
// PATCH /update-profile – update own profile
// ----------------------------------------------------------------------
router.patch(
  "/update-profile",
  uploadLocal.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    const { _id: userId, role } = req.user;
    const file = req.file;
    const body = req.body;

    const Model = getModelByRole(role) as any;
    if (!Model) throw new BadRequest("Invalid role");

    // Build update object with allowed fields
    const updateData: any = {};

    // Common fields
    if (body.name) updateData.name = body.name;
    if (body.mobileNumber) {
      // Check uniqueness if mobile is changed
      const existing = await Model.findOne({
        mobileNumber: body.mobileNumber,
        _id: { $ne: userId },
      });
      if (existing) {
        await removeFile(file);
        throw new BadRequest("Mobile number already in use");
      }
      updateData.mobileNumber = body.mobileNumber;
    }
    if (body.address) updateData.address = body.address;

    // Image
    if (file) {
      updateData.image = `${CONFIG.HOST}/static/uploads/${file.filename}`;
    }

    // Role‑specific fields
    switch (role) {
      case RoleEnum.HOD:
        if (body.department) updateData.department = body.department;
        if (body.employeeId) updateData.employeeId = body.employeeId;
        break;
      case RoleEnum.FACULTY:
        if (body.department) updateData.department = body.department;
        if (body.employeeId) updateData.employeeId = body.employeeId;
        if (body.subjects) {
          updateData.subjects = body.subjects
            .split(",")
            .map((s: string) => s.trim());
        }
        break;
      case RoleEnum.STUDENT:
        if (body.rollNo) updateData.rollNo = body.rollNo;
        if (body.batch) updateData.batch = body.batch;
        if (body.department) updateData.department = body.department;
        break;
    }

    const updatedUser = await Model.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      await removeFile(file);
      throw new BadRequest("User not found or update failed");
    }

    res.json({
      msg: "Profile updated successfully",
      user: updatedUser,
    });
  }),
);

// ----------------------------------------------------------------------
// DELETE /:id – delete a user (Admin only)
// ----------------------------------------------------------------------
router.delete(
  "/:id",
  validate(idValidater),
  validate(roleParamsValidater), // expects ?role=...
  dbUserDelete(true), // true = role in query
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({ msg: "User deleted successfully" });
  }),
);

export default router;
