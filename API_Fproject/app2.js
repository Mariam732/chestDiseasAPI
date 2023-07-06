
const express = require('express');
const app = express();
const auth = require('./middleware/auth')
//core module
// const cors = require('cors');
// app.use(cors);

// Hash password in regestration
const bcrypt = require('bcrypt');

//validation
const{check,validationResult}= require ('express-validator');
const validation= require('..//API project/validation/SignUp.validation')

'use strict';
var multer = require('multer');
const path = require("path");

//jwt
const jwt = require('jsonwebtoken');


//how to connect mongoo db with node js ?
const mongoose = require('mongoose');
const { log } = require('console');
mongoose.set('strictQuery', false);

mongoose.connect
('mongodb+srv://admin:admin@cluster0.mahqslt.mongodb.net/p1',
{ useNewUrlParser: true, useUnifiedTopology: true },)

.then(()=>console.log(" Database Connected Successfully"))
.catch((err)=>{ console.log(err); }) ;



//UserSchema
const userSchema = mongoose.Schema({
  fname:String ,
  lname:String ,
  email:String ,
  password:String
})

//UserModel
const userModel= mongoose.model('user',userSchema);


//Single file schema to save img path
const singleFileSchema = mongoose.Schema({
  path:String ,
  userID : mongoose.Schema.Types.ObjectId
})
//Single file model
const singleFileModel = mongoose.model('SingleFile', singleFileSchema);


app.use(express.json());




    
app.post('/login', async(req,res)=>{
  
  const{email,password}=req.body;
  let data = await userModel.findOne({email});
  console.log(data);
  if(data!=null) {
    const match = await bcrypt.compare(password, data.password);
    if(match){
      //token the same as authenication
   let token = jwt.sign({data:data._id , role:"user"}, 'mariam')
     res.json(token);
    }
    else {
      res.json({message: "Wrong password"});
    }
  } 
  else {
   res.json({message:"Email doesnt exist"})
  }
  
  
})



//to upload  path img  in db

//file filter
function fileFilter (req, file, cb) {

  // To accept this file pass `false`, like so:
  if(file.mimetype=='image/png'||file.mimetype=='image/jpg'||
   file.mimetype=='image/jpeg'){
    cb(null, true)
   }
   else {
    cb(null, false)
   }
}

// storage engine 

const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
      return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer ({storage:storage,fileFilter}).single('profile');


app.post('/uploadImg',upload,auth, async(req,res)=>{
try {
   const{userID}=req.body
  console.log(req.file)
  console.log(req.userID);
  
  
  await singleFileModel.insertMany({
   path:req.file.path ,
   userID
  })
   const{file}= req;
  res.send({
    file:file.originalname,
    path:file.path, 

  })
  
} catch (error) {
  res.json({error})
}

})





   app.post('/SignUp', validation  ,  async(req,res)=>{
   
    const errorValidation = validationResult(req);
    console.log(errorValidation);
    console.log(errorValidation.isEmpty());
    const{fname, lname,email,password}=req.body;
    let data = await userModel.findOne({email});
    if(data!=null){
        
  res.json({message:"email exist"});

    }
    else{
      bcrypt.hash(password, 7,async function(err, hash) {
        // Store hash in your password DB.
        if(errorValidation.isEmpty()){
        await userModel.insertMany({fname, lname,email,password:hash});
        res.json({message:"Insert operation is sucess in db"})
      }
        else{
          console.log("An errorrrrrrrrr !");
        //  res.json('error', errorValidation.array())
          res.status(201).json(errorValidation.array())
        }
       
    });
    }})  




  //to get all information about user
  app.get('/find',async(req,res)=>{
    try {
      let userID = req.header('userID');
      let users = await userModel.find({userID});
      res.json(users);
    } catch (error) {
      res.json({error})
    }
    
     })


   //delete users
app.delete('/delete',auth ,async (req,res)=>{
  try {
    console.log(req.body);
  const{_id} = req.body;
      await userModel.findByIdAndDelete({_id});
      res.json({message:"user is deleted successfully"});
   
  } catch (error) {
    res.json({error})
  }
  
})


//delete img
app.delete('/deleteImg',auth,async (req,res)=>{
  try {
    console.log(req.body);
  const{_id} = req.body;
  await singleFileModel.findByIdAndDelete({_id});
  res.json({message:"Image is deleted successfully"});
    
  } catch (error) {
    res.json({error})
  }
  
})
//update img
app.put('/updateImg',auth,async(req,res)=>{ 
try {
  const{_id}=req.body 
//const{path}=req.file 
await singleFileModel.findOneAndUpdate({_id}, 
  {path:req.file.path} 
  ) 
res.json({message:"Image is updated successfully"}) 
} catch (error) {
  res.json({error})
}
})



//to get all images path that user inserts it
app.get('/showAllImages',async(req,res)=>{
  let userID=req.header('userID');
  let token = req.header('token');
  jwt.verify(token ,'mariam',async(err,decoded)=>{
    if(err){
      res.json({err});
    } else{
      let  images = await singleFileModel.find({userID});
      res.json(images); 
    }
  })  
  })



   app.listen(process.env.POR || 3000,()=>{
    console.log("server is running now .....");
});





