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
import AdminModel from './DB/models/admin.model.js'
import connectDb from './DB/connection.js';  // استيراد دالة الربط
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function startServer() {
  try {
    await connectDb(); // تنفيذ الربط مع الداتا بيز

    initApp(app, express);
await AdminModel.syncIndexes();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();
