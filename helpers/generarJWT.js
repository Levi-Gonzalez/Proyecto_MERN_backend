import jwt  from 'jsonwebtoken'
/* jwt: permite cifrar y decifrar token. 
funcion que genera un token 
*/
export const generarJWT = (id) => {
    // creamos un obj con el ID, la variable de entorno y un objeto que nos dice que va a expirar. 
    return jwt.sign({id}, process.env.JWT, {
        expiresIn: "30d"
    })
}

