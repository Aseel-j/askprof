import cors from 'cors'
import connectDb from '../DB/connection.js';
const initApp = async(app,express)=>{
    app.use(express.json());
    app.use(cors());
    connectDb();
    app.get('/',(req,res)=>{
        return res.status(200).json({message:"welcome ..."});
    });
   app.use('',(req,res)=>{
    return res.status(404).json({message:"page not found"});
   });
    
}
export default initApp; 