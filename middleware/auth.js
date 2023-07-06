
//jwt
const jwt = require('jsonwebtoken');

module.exports =  (req,res,next)=>{
     const{token} = req.body;
    // const token=req.header('Authorization')?.split(' ')[1]
    jwt.verify(token ,'mariam',async(err,decoded)=>{
        if(err){
          res.json({err});
        } else{
            // req.userID = decoded.userID;
         next()
         //next function
        }
      })
}