import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticated } from "../middleware/auth";

export const authRoutes = Router();

authRoutes.post(
  "/create-account",
  body("name").notEmpty().withMessage("Nombre requerido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe ser de al menos 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords diferentes");
    }
    return true;
  }),
  body("email").isEmail().withMessage("Correo no valido"),
  handleInputErrors,
  AuthController.createAccount
);

authRoutes.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("Token requerido"),
  handleInputErrors,
  AuthController.confirmAccount
);

authRoutes.post(
  "/login",
  body("email").isEmail().withMessage("Correo no valido"),
  body("password").notEmpty().withMessage("Contraseña invalida"),
  handleInputErrors,
  AuthController.login
);

authRoutes.post(
  "/resend-code",
  body("email").isEmail().withMessage("Correo no valido"),
  handleInputErrors,
  AuthController.resendCode
);

authRoutes.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Correo no valido"),
  handleInputErrors,
  AuthController.forgotPassword
);

authRoutes.post(
  "/validate-token",
  body("token").notEmpty().withMessage("Token requerido"),
  handleInputErrors,
  AuthController.validateToken
);

authRoutes.post(
  "/new-password/:token",
  param("token").isNumeric().withMessage("Token no valido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe ser de al menos 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords diferentes");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.newPassword
);

authRoutes.get("/user", authenticated, AuthController.user);

//? PROFILE
authRoutes.put(
  "/profile",
  authenticated,
  body("name").notEmpty().withMessage("Nombre no valido"),
  body("email").isEmail().withMessage("Correo no valido"),
  handleInputErrors,
  AuthController.updateProfile
);

authRoutes.post(
  "/profile/change-password",
  authenticated,
  body("current_password")
    .notEmpty()
    .withMessage("El password actual no puede ser vacio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe ser de al menos 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords diferentes");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.changeUserPassword
);

authRoutes.post(
  "/check-password",
  authenticated,
  body("password").notEmpty().withMessage("Contraseña requerida"),
  handleInputErrors,
  AuthController.checkPassword
);
