const express = require('express')
const app = express();
const port =5000;
const mongoose =require("mongoose");
const cors =require("cors");

app.use(cors())
require('./models/model')
require('./models/post')
app.use(express.json())
app.use(require("./routes/auth"))
app.use(require("./routes/CreatePost"))
app.use(require("./routes/user"))
const uri = 'mongodb://127.0.0.1:27017/edugram';
 // Replace with your connection string

 async function connectDB() {
    try {
        await mongoose.connect(uri, {});
        console.log('Successfully connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
    }
}

connectDB();

app.listen(port,()=>{
    console.log("server is running on port"+" " +port)
});