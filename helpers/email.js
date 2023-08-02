import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { nombre, email, token } = datos;

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "b0a3d328b33ffa",
      pass: "48a2b58c4e5408",
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

        <img src="https://www.fayerwayer.com/resizer/6InU4oo4h9NOiJaeLUfSjytz4I0=/800x0/filters:format(jpg):quality(70)/cloudfront-us-east-1.images.arcpublishing.com/metroworldnews/AXW44VF4LVE7DDVUY7WYIEEYYY.jpg" class="w-5 h-5" alt="Imagen de Goku"  />`,
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
