import mongoose from "mongoose";

const proyectoCollections = "Proyecto";
const proyectoSchema = mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    description: { type: String },
    fechaEntrega: { type: Date, default: Date.now() },
    cliente: { type: String, required: true, trim: true },
    creador: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    tareas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tarea",
      },
    ],
    colaboradores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
      },1
    ],
  },
  { timestamps: true }
);

const Proyecto = mongoose.model(proyectoCollections, proyectoSchema);
export default Proyecto;
