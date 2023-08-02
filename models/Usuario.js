import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioCollection = "Usuario";
const UsuarioSchema = mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    token: { type: String },
    confirmado: { type: Boolean },
  },
  { timestamps: true } //Crea 2 columnas más de creado y actualizado.
);

/*se ejecuta antes de que se guarde el registro en la DB.
pregunsta si esta hasheado, si lo esta lo ignora y continua, si no lo esta entonces lo hashea: linea 24.
*/
UsuarioSchema.pre("save", async function (next) {
  //Si no modifica el pass, entonces no hagas nada.
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  //this hace referencia al objeto //nuevoUsuario de DB
  this.password = await bcrypt.hash(this.password, salt);
});

//Comprobar password en DB
UsuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
  //Aca retorna T o F. compare: compara un string  con uno hasheado o con un uno que no lo esta. El primer parametro que recibe es el que ingresa el usuario y el 2 es el que esta en la DB

  return await bcrypt.compare(passwordFormulario, this.password);
};

export const Usuario = mongoose.model(usuarioCollection, UsuarioSchema);

