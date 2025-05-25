/*import express from 'express';
import initApp from './src/index.router.js';
import 'dotenv/config';
import ActiveBookingModel from './DB/models/activeBooking.model.js';
import InactiveBookingModel from './DB/models/inactiveBookingSchema.model.js';
import workingHoursModel from './DB/models/workingHours.model.js';
//import professionalModel from './DB/models/professional.model.js';
const app = express();
const PORT = process.env.PORT || 3000;
initApp(app,express);
 //await professionalModel.syncIndexes();
  //await ActiveBookingModel.syncIndexes();
  //await InactiveBookingModel.syncIndexes();
  //await workingHoursModel.syncIndexes();



app.listen(PORT,()=>{
    console.log(`server is running ... ${PORT}`);
}) */
import express from 'express';
import initApp from './src/index.router.js';
import 'dotenv/config';
import mongoose from 'mongoose';

//import ActiveBookingModel from './DB/models/activeBooking.model.js';
//import InactiveBookingModel from './DB/models/inactiveBookingSchema.model.js';
//import workingHoursModel from './DB/models/workingHours.model.js';
//import professionalModel from './DB/models/professional.model.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Function to start server and connect DB
async function startServer() {
  try {
    // Connect to MongoDB using environment variable
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Initialize routes and pass express app and express itself (as you did)
    initApp(app, express);

    // Uncomment if you want to sync indexes for models (if you use them)
    // await professionalModel.syncIndexes();
   // await ActiveBookingModel.syncIndexes();
    //await InactiveBookingModel.syncIndexes();
    //await workingHoursModel.syncIndexes();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(' Error starting server:', error);
  }
}

// Call startServer to run everything
startServer();
