import mongoose  from 'mongoose'
/*const connectDb=async()=>{
    return await mongoose.connect(process.env.DB).then(()=>{
       console.log("database connection established");
       
    })
    .catch((err)=>{
        console.log(`error to connect database:${err}`);
    })
}
*/
const connectDb = async () => {
    console.log("MongoDB URI:", process.env.DB);  // Log the URI to check if it's being loaded
    return await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => {
        console.log("Database connection established");
      })
      .catch((err) => {
        console.log(`Error to connect database: ${err}`);
      });
  }
  export default connectDb;