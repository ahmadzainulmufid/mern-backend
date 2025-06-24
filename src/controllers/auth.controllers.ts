import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IRequser } from "../middlewares/auth.middleware";

type TRegister = {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
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

  async login(req: Request, res: Response) {
    const { identifier, password } = req.body as unknown as TLogin;
    try {
      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            userName: identifier,
          },
        ],
      });

      if (!userByIdentifier) {
        return res.status(403).json({
          message: "user not found",
          data: null,
        });
      }

      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return res.status(403).json({
          message: "user not found",
          data: null,
        });
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      res.status(200).json({
        message: "Login Success",
        data: token,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async me(req: IRequser, res: Response) {
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      res.status(200).json({
        message: "Success get user profile",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
};
