const { connectMongoose } = require('./mongoConnection');

const connectDB = async () => {
  try {
    const conn = await connectMongoose();
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
