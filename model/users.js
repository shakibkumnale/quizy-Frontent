
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";




// const HashPass=await bcrypt.compare(Pass_word,UserO.password)
const userSchegma= new mongoose.Schema({

Fname:{
    type:String,
    required:true

},
Lname:{
    type:String,
    required:true

},
password:{ 
    type:String,
    required:true
},


Email:{ type:String,
    required:true,
    unique: true
},
Topics:[{type:Object}]
  ,
  refreshToken: String,
})
// Hash password before saving
userSchegma.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});



// Method to compare hashed password
userSchegma.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};



const User = new mongoose.model("user",userSchegma);
export {User};
