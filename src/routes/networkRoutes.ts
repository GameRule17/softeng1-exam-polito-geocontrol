import { authenticateUser } from "@middlewares/authMiddleware";
import AppError from "@models/errors/AppError";
import { UserType } from "@models/UserType";
import { Router } from "express";

const router = Router();

// Get all networks (Any authenticated user)
router.get("", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Create a new network (Admin & Operator)
router.post("", authenticateUser([UserType.Admin, UserType.Operator]), (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Get a specific network (Any authenticated user)
router.get("/:networkCode", authenticateUser([UserType.Admin, UserType.Operator]), (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Update a network (Admin & Operator)
router.patch("/:networkCode", authenticateUser([UserType.Admin, UserType.Operator]), (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Delete a network (Admin & Operator)
router.delete("/:networkCode", authenticateUser([UserType.Admin, UserType.Operator]), (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

export default router;
