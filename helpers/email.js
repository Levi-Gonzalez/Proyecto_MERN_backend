import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { nombre, email, token } = datos;

  const transport = nodemailer.createTransport({
    host: env.process.EMAIL_HOST,
    port: env.process.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const confirmar = await transport.sendMail({
    from: "LBG Proyectos",
    date: new Date(),
    to: email,
    subject: "Comprueba tu cuenta LBG",
    text: "Comprueba tu cuenta y comienza a crear tus proyectos",
    html: `
        <h3>Hola: ${nombre},</h3>
        <p>Comprueba tu cuenta en LBG </p>
        <p>Tu cuenta ya esta casi lista:</p> 
        <p>Solo debes comprobarla con el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
        `,
  });
};

export const recuperarPassword = async (data) => {
  const { nombre, email, token } = data;

  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const recuperar = await transport.sendMail({
    from: "LGB Proyectos - Recupera tu password",
    to: `${email}`,
    subject: "Comienza a recuperar tu password!",
    text: "Recupera tu password y comienza a crear tus proyectos!",
    html: `
        <h1>Hola ${nombre}, has solicitado restablecer tu password</h1>
        <p>Tu cuenta ya esta casi lista,</p>
        <p>Continúa con en el siguiente enlace:</p>
        <a href=${process.env.FRONTEND_URL}/olvide-password/${token}>Restablecer Password</a>
        <p>Si tu no solicitaste este email, puedes ignorar este mensaje. </p>
    `,
  });
};
