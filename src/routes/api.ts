import express from "express";
import authController from "../controllers/auth.controllers";

const router = express.Router();

router.post("/auth/register", authController.register);

export default router;
