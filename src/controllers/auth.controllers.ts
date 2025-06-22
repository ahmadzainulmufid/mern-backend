import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";

type TRegister = {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  userName: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export default {
  async register(req: Request, res: Response) {
    const { fullName, userName, email, password, confirmPassword } =
      req.body as TRegister;

    const result = await UserModel.create({
      fullName,
      userName,
      email,
      password,
    });

    try {
      await registerValidateSchema.validate(
        {
          fullName,
          userName,
          email,
          password,
          confirmPassword,
        },
        { abortEarly: false }
      );

      return res.status(200).json({
        message: "Success Registration!",
        data: result,
      });
    } catch (error) {
      const err = error as Yup.ValidationError;
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
      });
    }
  },
};
