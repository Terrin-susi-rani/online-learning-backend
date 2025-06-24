require('dotenv').config();
const express = require("express");
const app = express();

const userRoutes = require("./routes/authRoutes"); 
const courseRoutes=require("./routes/courseRoutes");
const lessonRoutes = require('./routes/lessonRoutes');
const liveClassRoutes=require('./routes/liveClassRoutes')
const testRoutes = require('./routes/testRoutes');
const educatorRoutes = require('./routes/educatorRouters');
const progressRoutes=require('./routes/progressRoutes')

app.use(express.json());

app.use("/api", userRoutes);
app.use("/api",courseRoutes) ;
app.use("/api", lessonRoutes);
app.use("/api",liveClassRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/educators', educatorRoutes);
app.use("/api/progress",progressRoutes)
module.exports = app;
