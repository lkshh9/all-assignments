const express = require('express');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = express();

// mongodb+srv://lokesh:gky6fEznz%23H6%23PD@cluster0.mtoakic.mongodb.net/

app.use(express.json());
const SECRET = 'einlsa98g';

// Define mongoose schemas
const userSchema = new mongoose.Schema({
  username: [{type:String}],
  password : String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]
})

const adminSchema = new mongoose.Schema({
  usernmae: String,
  password: String
})

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean
})

// Define Mongoose models
const User = mongoose.model('User', userSchema)
const Admin = mongoose.model('Admin', adminSchema)
const Course = mongoose.model('Course', courseSchema) 

const authencticateJWT = (req,res,next) => {
  const authHeader = req.headers.authorization

  if(authHeader){
    const token = authHeader.split(' ')[1]

    jwt.verify(token, secretkey, (err,user) => {
      if(err){
        return res.sendStatus(403)
      }
      req.user = user
      next()
    })
  } else {
    res.sendStatus(401)
  }
}

// Connect to MongoDB
mongoose.connect('mongodb+srv://lokesh:gky6fEznz%23H6%23PD@cluster0.mtoakic.mongodb.net/',{useNewURLParser: true, useUnifiedTopology: true})


// Admin routes
app.post('/admin/signup', async(req, res) => {
  // logic to sign up admin
  const {username,password} = req.body
  const admin = await Admin.findOne({username})
  if(admin){
    res.status(403).json({message: 'Admin already exists'})
  } else {
    const newAdmin = new Admin({username, password})
    await newAdmin.save()
    const token = jwt.sign({username, role: 'admin'}, SECRET, {expiresIn: '1h'})
    res.json({message : 'Admin created successfully', token})
  }
});

app.post('/admin/login', async(req, res) => {
  // logic to log in admin
  const {username, password} = req.headers;
  const admin = await Admin.findOne({username, password})
  if(admin) {
    const token = jwt.sign({username, role: 'admin'}, SECRET, {expriresIN: '1h'})
    res.json({message: 'Logged in successfully', token})
  } else {
    res.status(403).json({message: 'Invalid username or password'})
  }
}); 

app.post('/admin/courses', authencticateJWT, async(req, res) => {
  // logic to create a course
  const course = new Course(req.body)
  await course.save()
  res.json({message : 'course created successfully', courseId: course.id})

});

app.put('/admin/courses/:courseId', authencticateJWT, async(req, res) => {
  // logic to edit a course
 const course = await Course.findByIdAndUpdate(req.params.courseId,req.body,{new:true})
 if(course){
  res.json({message : 'course updated successfully'})
 } else {
  res.status(404).json({message : 'Course not found'})
 }
});

app.get('/admin/courses', authencticateJWT, async(req, res) => {
  // logic to get all courses
  const courses = await Course.find({})
  res.json({courses})
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
});

app.post('/users/login', (req, res) => {
  // logic to log in user
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
