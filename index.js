import express from 'express';
import initApp from './src/index.router.js';
import 'dotenv/config';
//import professionalModel from './DB/models/professional.model.js';
const app = express();
const PORT = process.env.PORT || 3000;
initApp(app,express);
 //await professionalModel.syncIndexes();

app.listen(PORT,()=>{
    console.log(`server is running ... ${PORT}`);
}) 

