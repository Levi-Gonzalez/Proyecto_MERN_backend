import express from "express";
import dotenv from "dotenv";
import conectarMongoDB from "./config/db.js";
import usuarioRoutes from "./routes/usuariosRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import TareasRoutes from "./routes/tareaRoutes.js";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;
conectarMongoDB();

app.use(express.json());

const listaBlanca = [process.env.FRONTEND_URL];

const corsOpciones = {
  origin: (origin, callback) => {
    if (listaBlanca.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Error de CORS"));
    }
  },
};

app.use(cors(corsOpciones));

app.use("/api", usuarioRoutes);
app.use("/proyectos", proyectoRoutes);
app.use("/tareas", TareasRoutes);

const servidor = app.listen(PORT, () => {
  console.log(`servidor corriendo en el puerto ${PORT}`);
});

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("conectado a socket.io");

  socket.on("abrir proyecto", (proyecto) => {
    socket.join(proyecto);
  });

  socket.on("nueva tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tarea);
  });

  socket.on("actualizar tarea", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("tarea actualizada", tarea);
  });

  socket.on("cambiar estado", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("nuevo estado", tarea);
  });
});
