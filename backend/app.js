   
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const authRoutes=require('./routes/auth');
const projectRoutes=require('./routes/projectroute')
const todoRoutes=require("./routes/todoroute")
const gistRoutes=require('./routes/gistroute')
const mongodbURI = process.env.MONGODB_URI
const port = process.env.PORT

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/project',projectRoutes);
app.use('/todo',todoRoutes)
app.use('/gist',gistRoutes)
mongoose.connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
.catch(err => console.error('Error connecting to MongoDB:', err));

