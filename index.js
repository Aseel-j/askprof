import express from 'express';
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
  await ActiveBookingModel.syncIndexes();
  await InactiveBookingModel.syncIndexes();
  await workingHoursModel.syncIndexes();



app.listen(PORT,()=>{
    console.log(`server is running ... ${PORT}`);
}) 

