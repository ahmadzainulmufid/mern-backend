import { NextFunction, Request, Response } from "express";
import { getUserData, IUserToken } from "../utils/jwt";

export interface IRequser extends Request {
  user?: IUserToken;
}

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers?.authorization;

  if (!authorization) {
    return res.status(403).json({
      message: "unauthorized",
      data: null,
    });
  }

  const [prefix, token] = authorization.split(" ");

  if (!(prefix === "Bearer" && token)) {
    return res.status(403).json({
      message: "unauthorized",
      data: null,
    });
  }

  const user = getUserData(token);

  if (!user) {
    return res.status(403).json({
      message: "unauthorized",
      data: null,
    });
  }

  (req as IRequser).user = user;

  next();
};
