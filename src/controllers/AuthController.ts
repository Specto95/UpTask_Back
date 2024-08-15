import { Request, Response } from "express";
import { IUser, User } from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { Token } from "../models/Token";
import { generateUniqueToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (
    req: Request<{}, {}, Pick<IUser, "password" | "email">>,
    res: Response
  ) => {
    try {
      const { password, email } = req.body;
      const user = new User(req.body);

      //?PREVENIR DUPLICADOS
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El Usuario ya existe");
        return res.status(409).json({ error: error.message });
      }

      user.password = await hashPassword(password);

      //?GENERAR TOKEN
      const token = new Token();
      token.token = await generateUniqueToken();
      token.user = user.id;

      //?ENVIAR EMAIL
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send("Cuenta creada, revisa tu email para confirmar");
    } catch (error) {
      res.status(500).json({ error: "Hubo un mistake" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no valido");
        return res.status(404).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("Confirmación exitosa");
    } catch (error) {
      res.status(500).json({ error: "Hubo un mistake" });
    }
  };

  static resendCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      //?USUARIO EXISTE
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El Usuario no esta registrado");
        return res.status(404).json({ error: error.message });
      }

      if (user.confirmed) {
        const error = new Error("El Usuario ya esta confirmado");
        return res.status(403).json({ error: error.message });
      }

      //?GENERAR TOKEN
      const token = new Token();
      token.token = await generateUniqueToken();
      token.user = user.id;

      //?ENVIAR EMAIL
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send("Se envio un nuevo código a tu correo, porfavor verifica");
    } catch (error) {
      res.status(500).json({ error: "Hubo un mistake" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      //?USUARIO EXISTE
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El Usuario no esta registrado");
        return res.status(404).json({ error: error.message });
      }

      //?GENERAR TOKEN
      const token = new Token();
      token.token = await generateUniqueToken();
      token.user = user.id;
      await token.save();

      //?ENVIAR EMAIL
      AuthEmail.sendForgotPasswordEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send("Revisa tu email para instrucciones de la nueva contraseña");
    } catch (error) {
      res.status(500).json({ error: "Hubo un mistake" });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      //?VERIFICAR PASS
      const isPasswordCorrect = await checkPassword(password, user.password);

      if (!isPasswordCorrect) {
        const error = new Error("Password incorrecto");
        return res.status(401).json({ error: error.message });
      }

      if (!user.confirmed) {
        const token = new Token();

        token.user = user.id;
        token.token = await generateUniqueToken();
        await token.save();

        //?REENVIAR EMAIL
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
          message: "por favor",
        });

        const error = new Error(
          "Cuenta no confirmada, hemos enviado un código de confirmación a su correo"
        );
        return res.status(401).json({ error: error.message });
      }

      const token = generateJWT({ id: user.id });

      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "Hubo un mistake" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no valido");
        return res.status(404).json({ error: error.message });
      }

      res.send("Token valido, define tu nuevo password");
    } catch (error) {
      res.status(500).json({ error: "Hubo un mistake" });
    }
  };

  static newPassword = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no valido");
        return res.status(404).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("Nueva contraseña exitosa");
    } catch (error) {
      res.status(500).json({ error: "Hubo un mistake" });
    }
  };

  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    req.user.name = name;
    req.user.email = email;

    const userExists = await User.findOne({ email });

    if (userExists && userExists.id.toString() !== req.user.id.toString()) {
      const error = new Error("El correo ya esta en uso");
      return res.status(409).json({ error: error.message });
    }

    try {
      await req.user.save();
      res.send("Perfil actualizado correctamente!");
    } catch (error) {
      res.status(500).json({ error: "Hubo un mistake" });
    }
  };

  //?AUTHENTICATED
  static changeUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error("Password actual incorrecto");
      return res.status(401).json({ error: error.message });
    }

    if (current_password === password) {
      const error = new Error(
        "La nueva contraseña no puede ser igual a la actual"
      );
      return res.status(401).json({ error: error.message });
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send("Contraseña actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un mistake" });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error("Password incorrecto");
      return res.status(401).json({ error: error.message });
    }
    res.send("Password correcto");
  };
}
