import { transporter } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
  message?: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async ({
    email,
    name,
    token,
    message,
  }: IEmail) => {
    const info = await transporter.sendMail({
      from: "UpTask <admin@uptask.com>",
      to: email,
      subject: "UpTask - Confirmar tu Cuenta",
      text: "UpTask - Confirmar tu Cuenta",
      html: `<p>Hola ${name}, ${
        message || "has creado tu cuenta UpTask, por favor"
      } confirma tu cuenta</p>
        <p>Visita el sig. enlace:</p>
        <a href="${
          process.env.FRONTEND_URL
        }/auth/confirm-account">Confirmar cuenta</a>
        <p> E ingresa el codigo: <b>${token}</b></p>
        <p>Este token expira en 10 minutos</p>
      `,
    });

    console.log("Mensaje enviado", info.messageId);
  };

  static sendForgotPasswordEmail = async ({
    email,
    name,
    token,
    message,
  }: IEmail) => {
    const info = await transporter.sendMail({
      from: "UpTask <admin@uptask.com>",
      to: email,
      subject: "UpTask - Reestablece tu password",
      text: "UpTask - Reestablece tu password",
      html: `<p>Hola ${name}, has solicitado reestablecer tu password</p>
        <p>Visita el sig. enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/new-password">Confirmar cuenta</a>
        <p> E ingresa el codigo: <b>${token}</b></p>
        <p>Este token expira en 15 minutos</p>
      `,
    });

    console.log("Mensaje enviado", info.messageId);
  };
}
