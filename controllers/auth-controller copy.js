import cors from "cors";
import express from "express";
import dotenv from "dotenv";

import nodemailer from "nodemailer";
import randomstring from "randomstring";
import {User} from "../model/users.js";
import {Quiz}   from "../model/quizzs.js";
import passwordValidator from "password-validator";

import bcrypt from "bcrypt";


dotenv.config();
const app = express();
app.use(cors());

const questionbank = {};
const questionset = {};
const otps = {};
let tokeni;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "stkbantai1@gmail.com",
    pass: "temr kfpt iyws vwit",
  },
});

// home logic
const home = async (req, res) => {
  try {
    res.send("Hello Wold! dd");
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    const { Fname, Lname, Email, Password, CPassword, OTP } = req.body;
    console.log(req.body)
    // Create a schema
    var schema = new passwordValidator();

    // Add properties to it
    schema
      .is()
      .min(8) // Minimum length 8
      .is()
      .max(100) // Maximum length 100
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters
      .has()
      .digits() // Must have at least 2 digits
      .has()
      .not()
      .spaces() // Should not have spaces
      .is()
      .not()
      .oneOf(["Passw0rd", "Password123"]); // Blacklist these values
    if (!schema.validate(Password)) {
      return res.status(401).json({ message: "invailid_pass" });
    }
    console.log(OTP === otps[Email])
    if (OTP === otps[Email]) {
      delete otps[Email];
      const user = new User({
        Fname,
        Lname,
        Password,
        Topics: [],
        Email,
      });

      try {
        const token = await user.generateAuthToken();
        console.log(token);
        tokeni = token;
        // res.json({ message: "success", token });
        // If you want to set a cookie
        // res.cookie("jwt", token, {
        //     expires: new Date(Date.now() + 500000),
        //     httpOnly: true
        // });
      } catch (tokenError) {
        console.error("Error generating auth token:", tokenError);
        // res.status(500).json({ error: "Failed to generate auth token" });
        res.send(tokenError);
        return;
      }

      try {
        const created = await user.save();
        console.log("one");
        res.json({ message: "success", token: tokeni });
        // res.json({ message: "success", token }); // Already sending response after generating token
      } catch (saveError) {
        res.send(saveError);
        console.error("Error saving user:", saveError);
        return;
        // res.status(500).json({ error: "Failed to save user" });
      }
    } else {
      res.status(400).json({ message: "invailid" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message:error });
    // res.send(error)
  }
};

const selecttopic = async (req, res) => {
  try {
    const { _id } = req.userData;
    const { topics } = req.body;
    console.log(req.body);
    
    const userObj = await User.findOne({ _id });
    userObj.Topics = [];
    userObj.save();
    await User.updateOne(
      { _id },
      { $push: { Topics: { $each: topics } } }
    );

    res.status(201).json({ message: "success" });
  } catch (error) {
    console.log(console.error());
    res.status(400).json({message:error});
  }
};
const getquetion = async (req, res) => {
  console.log("ss");

  try {
    const { _id } = req.userData;
    var topic = req.params.topic;
    if(topic === "Programming-Logic"){
      topic = "Programming Logic";
    }
    if (topic === "React-Native") {
      topic = "React Native";
    }
    if (topic === "C") {
      topic = "C Programming";
    }
    if (
      topic === "MERN" ||
      topic === "Java" ||
      topic === "Python" ||
      topic === "C Programming" ||
      topic === "Programming Logic" ||
      topic === "React Native" ||
      topic === "HTML"
    ) {
    } else {
      topic = "HTML";
    }

    const questions = await Quiz.aggregate([
      { $match: { topicName: topic } },
      { $sample: { size: 5 } },
    ]);
    questionset[_id]=questions;
    const qWithoutAns = questions.map(
      ({ correctAnswer, ...remaining }) => remaining
    );
    questionbank[_id] = questions.map((item) => {
      const itm = {
        _id: item._id.toString(),
        correctAnswer: item.correctAnswer,
      };
      return itm;
    });
    console.log(questionbank[_id]);
 let a=questionset[_id]
    console.log(a)
    console.log(questionbank[_id])
    
    res.status(200).json({message:"success", qWithoutAns});
    // const qWithoutAns = question.map(
    //   ({ correctAnswer, ...remaining }) => remaining
    // );
    // questionbank[_id] = question.map((item) => {
    //   const itm = {
    //     _id: item._id.toString(),
    //     correctAnswer: item.correctAnswer,
    //   };
    //   return itm;
    // });
    // console.log(qWithoutAns);

    // // console.log(qWithoutAns)
    // res.status(200).json({message:"success", qWithoutAns});
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error });
  }
};

const fetchtopic = async (req, res) => {
  try {
    const { _id } = req.userData || "66e5ea97d63f397f69875911";
    const TopicArray = await User.findOne({ _id }, { _id: 0, Topics: 1 });

    console.log(TopicArray);

    const questions = await Quiz.aggregate([
      { $match: { $or: TopicArray.Topics } },
      { $sample: { size: 5  } },
    ]);
    questionset[_id]=questions;
    const qWithoutAns = questions.map(
      ({ correctAnswer, ...remaining }) => remaining
    );
    questionbank[_id] = questions.map((item) => {
      const itm = {
        _id: item._id.toString(),
        correctAnswer: item.correctAnswer,
      };
      return itm;
    });
    console.log(questionbank[_id]);
 let a=questionset[_id]
    // console.log(qWithoutAns)
    res.status(200).json({message:"success", qWithoutAns});
  } catch (error) {
    console.error(error);
    res.status(500).json({message:error});
  }
};

const score = async (req, res) => {
  try {
    let i = 0;
    const { _id } = req.userData;
    const { userAnswer } = req.body;
    console.log(userAnswer);
    console.log(questionbank[_id]);
    if (!questionbank[_id]) {
      return res.status(400).json({ message: "question not find" });
    }
    userAnswer.map((question) => {
      const matchQ = questionbank[_id].find(({ _id }) => _id === question._id);
      console.log(question);
      console.log(matchQ);

      if (matchQ.correctAnswer === question.userans) {
        console.log("match");
        i++;
        console.log(i);
      }
    });
    res.status(200).json({message:'success', data:questionset[_id] ,score:i});
  } catch (error) {
    console.error(error);
    res.send(error);
  }
};

const login = async (req, res) => {
  try {
    const { Email, userPassword } = req.body;
console.log(req.body)
    const userObj = await User.findOne({ Email });
    console.log(userObj)
    const { Password } = userObj;
    const HashPass = await bcrypt.compare(userPassword, Password);
    if (HashPass) {
      const token = await userObj.generateAuthToken();
      res.json({ message: "success", token });
    } else {
      console.log("wrong");
      // res.json({ message: "wrong password"})
      res.send("wrong");
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "user not exist" });
  }
};

const user = async (req, res) => {
  if (!req.userData) {
    return res.send({ Email: "eeee" });
  }
  console.log(req.userData);

  res.send(req.userData);
};
const otp = async (req, res) => {
  try {
    const { Email } = req.body;
    console.log(Email);
    const otp = randomstring.generate({ length: 6, charset: "numeric" }); //online
    // const otp = "1";
    otps[Email] = otp;
    console.log(otps[Email]);
    var option = {
      from: "stkbantai1@gmail.com", // sender address
      to: Email, // list of receivers
      subject: "Hello ✔", // Subject line
      // text: ` your otp is ${otp} `, // plain text body

      html: `<!DOCTYPE html>
       <html lang="en">
         <head>
           <meta charset="UTF-8" />
           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
           <meta http-equiv="X-UA-Compatible" content="ie=edge" />
           <title>Static Template</title>
       
           <link
             href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
             rel="stylesheet"
           />
         </head>
         <body
           style="
             margin: 0;
             font-family: 'Poppins', sans-serif;
             background: #ffffff;
             font-size: 14px;
           "
         >
           <div
             style="
               max-width: 680px;
               margin: 0 auto;
               padding: 5px 30px 60px;
               background: #f4f7ff;
               background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
               background-repeat: no-repeat;
               background-size: 800px 452px;
               background-position: top center;
               font-size: 14px;
               color: #434343;
             "
           >
             <header style="height: 130px;">
               <table style="width: 100%;">
                 <tbody>
                   <tr style="height: 160px;">
                     <td>
                       Shaka-bank
                     </td>
                     <td style="text-align: right;">
                       <span
                         style="font-size: 16px; line-height: 30px; color: #ffffff;"
                         >12 Nov, 2021</span
                       >
                     </td>
                   </tr>
                 </tbody>
               </table>
             </header>
       
             <main>
               <div
                 style="
                   margin: 0;
                   margin-top: 70px;
                   padding: 92px 30px 115px;
                   background: #ffffff;
                   border-radius: 30px;
                   text-align: center;
                 "
               >
                 <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                   <h1
                     style="
                       margin: 0;
                       font-size: 24px;
                       font-weight: 500;
                       color: #1f1f1f;
                     "
                   >
                     Your OTP
                   </h1>
                   <p
                     style="
                       margin: 0;
                       margin-top: 17px;
                       font-size: 16px;
                       font-weight: 500;
                     "
                   >
                    ${Email},
                   </p>
                   <p
                     style="
                       margin: 0;
                       margin-top: 17px;
                       font-weight: 500;
                       letter-spacing: 0.56px;
                     "
                   >
                     Thank you for choosing Shaka-Bank. Use the following OTP
                     to complete the registeration . OTP is
                     valid for 10 minutes only
                     <span style="font-weight: 600; color: #1f1f1f;">5 minutes</span>.
                     Do not share this code with others, including AVAZ
                     employees.
                   </p>
                   <p
                     style="
                       margin: 0;
                       margin-top: 60px;
                       font-size: 40px;
                       font-weight: 600;
                       letter-spacing: 25px;
                       color: #ba3d4f;
                     "
                   >
                   ${otp}
                   </p>
                 </div>
               </div>
       
               <p
                 style="
                   max-width: 400px;
                   margin: 0 auto;
                   margin-top: 90px;
                   text-align: center;
                   font-weight: 500;
                   color: #8c8c8c;
                 "
               >
                 Need help? Ask at
                 <a
                   href="mailto: Example@gmail.com"
                   style="color: #499fb6; text-decoration: none;"
                   >AVAZ@gmail.com</a
                 >
                 or visit our
                 <a
                   href=""
                   target="_blank"
                   style="color: #499fb6; text-decoration: none;"
                   >Help Center</a
                 >
               </p>
             </main>
       
             <footer
               style="
                 width: 100%;
                 max-width: 490px;
                 margin: 20px auto 0;
                 text-align: center;
                 border-top: 1px solid #e6ebf1;
               "
             >
               <p
                 style="
                   margin: 0;
                   margin-top: 40px;
                   font-size: 16px;
                   font-weight: 600;
                   color: #434343;
                 "
               >
                 Shaka-Bank
               </p>
               <p style="margin: 0; margin-top: 8px; color: #434343;">
                1st Rabodi, Thane (West), 400601
               </p>
               <div style="margin: 0; margin-top: 16px;">
                 <a href="" target="_blank" style="display: inline-block;">
                   <img
                     width="36px"
                     alt="Facebook"
                     src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook"
                   />
                 </a>
                 <a
                   href=""
                   target="_blank"
                   style="display: inline-block; margin-left: 8px;"
                 >
                   <img
                     width="36px"
                     alt="Instagram"
                     src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram"
                 /></a>
                 <a
                   href=""
                   target="_blank"
                   style="display: inline-block; margin-left: 8px;"
                 >
                   <img
                     width="36px"
                     alt="Twitter"
                     src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter"
                   />
                 </a>
                 <a
                   href=""
                   target="_blank"
                   style="display: inline-block; margin-left: 8px;"
                 >
                   <img
                     width="36px"
                     alt="Youtube"
                     src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube"
                 /></a>
               </div>
               <p style="margin: 0; margin-top: 16px; color: #434343;">
                 Copyright © 2022 Company. All rights reserved.
               </p>
             </footer>
           </div>
         </body>
       </html>
       `,
      // html body
    };
    transporter.sendMail(option, function (error, info) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log("gg");
        res.send("done");
      }
    });
  } catch (error) {
    res.send(error);
  }
};

export {
  home,
  register,
  score,
  login,
  selecttopic,
  getquetion,
  otp,
  user,
  fetchtopic,
};
