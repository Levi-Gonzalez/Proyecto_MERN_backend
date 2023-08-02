import Proyecto from "../models/Proyecto.js";
import { Usuario } from "../models/Usuario.js";
const obtenerProyectos = async (req, res) => {
  const mostrarProyectos = await Proyecto.find({
    //Esto permite que el colaborador pueda ver los proyectos donde fue incluido
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  })
    //cuando traigamos a todos los proyectos no es necesario traer todas las tareas
    .select("-tareas");
  res.json(mostrarProyectos);
};

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const obtenerProyecto = async (req, res) => {
  try {
    const { id } = req.params;

    const obtenerProyecto = await Proyecto.findById(id)
      .populate({
        path: "tareas",
        populate: { path: "completado", select: "nombre" },
      })
      //acceder datos cruzados de otra collection usamos populate y como 2do parametro recibe lo que vamos a traer.
      .populate("colaboradores nombre", "nombre email");

    if (!obtenerProyecto) {
      const error = new Error("No encontrado");
      return res.status(404).json({ msg: error.message });
    }

    if (!obtenerProyecto) {
      console.log("No se encontró el proyecto"); // Agrega esta línea
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }

    if (
      obtenerProyecto.creador.toString() !== req.usuario._id.toString() &&
      !obtenerProyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      return res.status(403).json({ msg: "Accion no válida" });
    }

    res.json(obtenerProyecto);
  } catch (error) {
    console.log("Error al obtener el proyecto:", error);
  }
};

const editarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizarProyecto = await Proyecto.findById(id);

    if (!actualizarProyecto) {
      const error = new Error("Proyecto no encontrado :(");
      return res.status(404).json({ msg: error.message });
    }

    if (actualizarProyecto.creador.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ msg: "No tienes los permisos" });
    }

    actualizarProyecto.nombre = req.body.nombre || actualizarProyecto.nombre;
    actualizarProyecto.description =
      req.body.description || actualizarProyecto.description;
    actualizarProyecto.fechaEntrega =
      req.body.fechaEntrega || actualizarProyecto.fechaEntrega;
    actualizarProyecto.cliente = req.body.cliente || actualizarProyecto.cliente;

    const proyectoAlmacenado = await actualizarProyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(`Error: ${error}`);
    res.status(404).json({ msg: "Proyecto no encontrado" });
  }
};

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  try {
    const proyectoAEliminar = await Proyecto.findById(id);
    if (!proyectoAEliminar) {
      return res.status(404).json({ msg: "No existe proyecto" });
    }

    if (proyectoAEliminar.creador.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ msg: "No tienes los permisos" });
    }

    await proyectoAEliminar.deleteOne();
    res.json({ msg: "Proyecto eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};
const buscarColaborador = async (req, res) => {
  try {
    const { email } = req.body;
    const usuarioAlmacenado = await Usuario.findOne({ email }).select({
      //que no incluya esta info
      token: 0,
      __v: 0,
      createdAt: 0,
      confirmado: 0,
      password: 0,
      updatedAt: 0,
    });

    if (!usuarioAlmacenado) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ msg: error.message });
    }

    res.json(usuarioAlmacenado);
  } catch (error) {
    console.log(`error: ${error}`);
  }
};

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado!");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(404).json({ msg: error.message });
  }

  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select({
    password: 0,
    token: 0,
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
    confirmado: 0,
  });

  if (!usuario) {
    const error = new Error("user no find");
    return res.status(404).json({ msg: error.message });
  }
  //si el admin se quiere autoagregar como colaborador
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error(
      "El creador del proyecto no puede ser el colaborador."
    );
    return res.status(404).json({ msg: error.message });
  }
  // Revisa que no este agregado previamente
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("El usuario ya pertenece al proyecto.");
    return res.status(404).json({ msg: error.message });
  }

  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: "Colaborador agregado correctamente!" });
};

const eliminarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id); // Corregir aquí

    if (!proyecto) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({ msg: error.msg });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Áccion no válida");
      return res.status(403).json({ msg: error.message }); // Cambiar a 403 (Acceso prohibido)
    }

    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();
    res.json({ msg: "colaborador eliminado correctamente" });
  } catch (error) {
    return res.status(500).json("error en el servidor", error);
  }
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
};
