import colors from 'colors';
import connectDB from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5021;

const start = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(colors.blue(`Server running in ${process.env.NODE_ENV} on port ${PORT}`));
  });
};

void start();
