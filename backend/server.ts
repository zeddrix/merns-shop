import colors from 'colors';
import connectDB from './config/db.js';
import app from './app.js';

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(colors.blue(`Server running in ${process.env.NODE_ENV} on port ${PORT}`));
});
