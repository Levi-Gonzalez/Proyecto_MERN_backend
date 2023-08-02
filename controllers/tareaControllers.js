import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
  try {
    const { proyecto } = req.body;
    const existeProyecto = await Proyecto.findById(proyecto);

    if (!existeProyecto) {
      const error = new Error("Proyecto no existe");
      return res.status(404).json({ msg: error.message });
    }

    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No tienes los permisos para añadir tareas");
      return res.status(403).json({ msg: error.message });
    }

    const tareaAlmacenada = await Tarea.create(req.body);
    //Almacenar el ID del proyecto accediendo al array tareas que esta en mongo del model proyecto.
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();

    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  //id de tarea.
  const { id } = req.params;
  try {
    const obtenerTarea = await Tarea.findById(id).populate("proyecto");
    if (!obtenerTarea) {
      const error = await new Error("Tarea no encontrada");
      return res.status(404).json(error.message);
    }
    if (
      obtenerTarea.proyecto.creador.toString() !== req.usuario._id.toString()
    ) {
      const error = new Error("Acción no permitida");
      return res.status(403).json(error.message);
    }
    res.json(obtenerTarea);
  } catch (error) {
    console.log(`ERROR ENCONTRADO: ${error}`);
  }
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  try {
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
      const error = new Error("La tarea no existe");
      return res.status(404).json(error.message);
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No tienes los permisos");
      return res.status(403).json(error.message);
    }

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.description = req.body.description || tarea.description;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  try {
    const tarea = await Tarea.findById(id);
    if (!tarea) {
      const error = new Error("La tarea no existe");
      return res.status(404).json(error.message);
    }
    //Corrobora si existe:
    if (
      tarea.proyecto &&
      tarea.proyecto.creador &&
      req.usuario &&
      req.usuario._id
    ) {
      if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los permisos");
        return res.status(403).json(error.message);
      }
    }
    // await tarea.deleteOne() Puede ser de ambas m

    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);
    await proyecto.save();
    await tarea.deleteOne({});
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);
    res.json({ msg: "La Tarea se eliminó" });
  } catch (error) {
    console.log(`Error: ${error}`);
    res.status(500).json("Error interno del servidor");
  }
};

const cambiarEStado = async (req, res) => {
  try {
    const { id } = req.params;
    const tarea = await Tarea.findById(id).populate("proyecto");

    if (!tarea) {
      const error = new Error("Tarea no encontrada");
      return res.status(404).json({ msg: error.message });
    }

    if (
      tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
      !tarea.proyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      const error = new Error("Acción no válida");
      return res.status(404).json({ msg: error.message });
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id
    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado")
    res.json(tarea);
    
  } catch (error) {
    console.log("Error en el servidor", error);
  }
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEStado,
};
