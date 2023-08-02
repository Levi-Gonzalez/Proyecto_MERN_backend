import mongoose from "mongoose";

const conectarMongoDB = async () => {
  try {
    const URI = process.env.MONGO_URI;
    const conexionMongoDB = await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const url = `${conexionMongoDB.connection.host}:${conexionMongoDB.connection.port}`;
    console.log(`MongoDB conectado exitosamente en: ${url}`);
  } catch (error) {
    console.log(`Error al conectar a MongoDB: ${error.message}`);
  }
};
export default conectarMongoDB;
