import mongoose, { ConnectOptions } from 'mongoose';

const connectDB = handler => async (req, res) => {
  if (mongoose.connections[0].readyState) {
    // Use current db connection
    return handler(req, res);
  }
  // Use new db connection
  await mongoose.connect(`mongodb+srv://estagio:estagio@autou.x1orzkw.mongodb.net/?retryWrites=true&w=majority`, {
    useNewUrlParser: true,    
    useUnifiedTopology: true
  } as ConnectOptions);
  return handler(req, res);
};

export default connectDB;