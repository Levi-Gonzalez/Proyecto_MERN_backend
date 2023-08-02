// controllers: Comunica el routing con modelos de controlador
import generarId from "../helpers/generarId.js";
import { generarJWT } from "../helpers/generarJWT.js";
import { Usuario } from "../models/Usuario.js";
import { emailRegistro, recuperarPassword} from "../helpers/email.js";

const registrar = async (req, res) => {
  //Validacion de usuario duplicado:
  const { email } = req.body;
  const usuarioExistente = await Usuario.findOne({ email });

  if (usuarioExistente) {
    const error = new Error("Lo siento, correo existente.");
    return res.status(400).json({ mensaje: error.message });
  }
  //creacion del usuario
  try {
    const nuevoUsuario = new Usuario(req.body);
    nuevoUsuario.token = generarId();
    await nuevoUsuario.save();
    //Enviar Email de confirmacion
    const { nombre, email, token } = nuevoUsuario;
    emailRegistro({
      nombre: nombre,
      email: email,
      token: token,
    });

    res.json(
      "Usuario creado correctamente, revisa tu email para confirmar tu cuenta"
    );
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

const autenticar = async (req, res) => {
  
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    const error = new Error("Usuario no existe");
    return res.status(404).json({ msg: error.message });
  }
  //Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");
    return res.status(403).json({ msg: error.message });
  }
  //Comprobar si el password es válido: Recibe el método que creamos. y le pasamos el password que esta recibiendo del body
  if (await usuario.comprobarPassword(password)) {
    //construimos un obj para que nos de una respuesta mas precisa y no traiga todo y generamos el token.
    res.json({
      msg: `Bienvenido! ${usuario.nombre}`,
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error(" Password incorrecto");
    return res.status(403).json({ msg: error.message });
  }
};

/*  Si queremos acceder a su valor despues del params ponemos el nombre de la ruta dinamica. TOKEN de 1 solo uso */
const confirmar = async (req, res) => {
  const { token } = req.params;
  const confirmarUsuario = await Usuario.findOne({ token });

  try {
    if (confirmarUsuario) {
      confirmarUsuario.confirmado = true;
      confirmarUsuario.token = "";
      await confirmarUsuario.save();

      res.json({ msg: "Usuario confirmado correctamente..." });
    }
    // else {
    //   const error = new Error("Token no válido paa");
    //   return res.status(404).json({ msg: error.message });
    // }
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

const olvidePassword = async (req, res) => {
  //capturamos el email por el usuario
  const { email } = req.body;
  const confirmarEmail = await Usuario.findOne({ email });
  if (!confirmarEmail) {
    const error = new Error("Correo no registrado");
    res.status(404).json({ msg: error.message });
  }
  try {
    //le generamos un nuevo token
    confirmarEmail.token = generarId();
    console.log(confirmarEmail);

    //enviamos por email
    const { nombre, email, token } = confirmarEmail;
    recuperarPassword({
      nombre: nombre,
      email: email,
      token: token,
    });

    await confirmarEmail.save();
    res.json({ msg: "Hemos enviado un email con las instrucciones." });
  } catch (error) {
    console.log(error);
  }
};
const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const tokenValido = await Usuario.findOne({ token });
  //Otra manera de enviar validacion correcta e incorrecta
  if (tokenValido) {
    res.json({ msg: "Token válido y el usuario existe." });
  } else {
    const error = new Error("Token invalido o el usuario no existe");
    return res.status(404).json({ msg: error.message });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const nuevoPassword = await Usuario.findOne({ token });
  nuevoPassword.password = password;
  nuevoPassword.token = "";
  try {
    await nuevoPassword.save();
    res.json({ msg: "Pasword actualizado correctamente!" });
  } catch (error) {
    console.log(error);
  }
};

const perfil = async (req, res) => {
  //Luego de las válidaciones de auth nos mandara directamente acá. entonces pasamos el usuario que se esta almacenando en auth:
  const { usuario } = req;
  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
