import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";
/*
Es para que verifique si todas las válidaciones son válidas.
Comprobara el jwt sea válido, que el usuario sea correcto y que no haya expirado.
Si todo se cumple podremos acceder a la funcion del perfil
next: es para seguir con el siguiente middleware.
En los headers se mandan los jwt, si todo esta bien entonces se le da acceso al usuario.

postman: authorization ✔ bearer ✔ token ✔
(req.headers.authorization)

//Autenticamos el usuario para copiar el token
*/

export const checkAuth = async (req, res, next) => {
  let token;
  //Si hay autorizacion y startsWith con Bearer, significa que estamos enviando los token con esos headers. Si existe Bearer obtenemos el token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      //vamos a decifrar el token y recibe la env del token. En caso de que expire la funcion decoded se encargara.
      const decoded = jwt.verify(token, process.env.JWT);
      //este se lo pásamos a perfil.
      req.usuario = await Usuario.findById(decoded.id).select(
        "-password -confirmado -token -__v -createdAt -updatedAt"
      );
      //busca al usueario por su ID y se le asigna a esa variable. select: exluye esos datos.
    //   console.log(req.usuario);
      //despues de todo vamos al siguiente middleware
      return next();
    } catch (error) {
      return res.status(404).json({ msg: "Hubo un error en autenticacion", error });
    }
  }
  if (!token) {
    const error = new Error ("Token no válido")
    return res.status(401).json({ msg: error.message })
  }
};
