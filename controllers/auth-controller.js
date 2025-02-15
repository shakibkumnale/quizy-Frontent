import nodemailer from "nodemailer";
import randomstring from "randomstring";
import { User } from "../model/users.js";
import { Quiz } from "../model/quizzs.js";
import passwordValidator from "password-validator";
import validator from "validator";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { passwordRegex } from "../constant/constant.js";
import { generateTokens } from "../utils/GenerateToken.js";

const questionbank = {};
const questionset = {};
const otps = {};
let tokeni;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDEREMAIL,
    pass: process.env.EMAILPASS,
  },
});

// home logic
const home = AsyncHandler(async (req, res) => {
  try {
    res.send("Hello World!");
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const register = AsyncHandler(async (req, res) => {
  const { Fname, Lname, Email, Password, CPassword, OTP } = req.body;

  // Input validation
  if (!Email || !validator.isEmail(Email)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid Email format"));
  }
  if (!OTP) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
  }
  if (!Password || !passwordRegex.test(Password)) {
    return res.status(400).json(new ApiResponse(400, null, "Password must be at least 8 characters long, include at least 2 digits, and 1 symbol"));
  }
  if (Password !== CPassword) {
    return res.status(400).json(new ApiResponse(400, null, "Passwords do not match"));
  }
  if (!Fname || Fname.trim() === "") {
    return res.status(400).json(new ApiResponse(400, null, "First name is required"));
  }
  if (!Lname || Lname.trim() === "") {
    return res.status(400).json(new ApiResponse(400, null, "Last name is required"));
  }

  // User existence check and registration logic
  let user;
  try {
    user = await User.findOne({ Email });
    if (user) {
      return res.status(409).json(new ApiResponse(409, null, "User already exists"));
    }
    if (OTP !== otps[Email]&& false) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
    }

    user = new User({
      Fname,
      Lname,
      Email,
      password: Password,
    });

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;

    await user.save();
    const { password, refreshToken, ...userDetails } = user._doc;

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", tokens.accessToken, options)
      .cookie("refreshToken", tokens.refreshToken, options)
      .status(201)
      .json(new ApiResponse(200, { user: userDetails, accessToken: tokens.accessToken, refreshToken: tokens.accessToken }, "User registered successfully"));
  } catch (error) {
    console.error(error);
    if (error.name === "MongoServerError" && error.code === 11000) {
      throw new ApiError(409, "Duplicate value found for a unique field");
    }
    throw error;
  }
});

const selecttopic = AsyncHandler(async (req, res) => {
  const { _id } = req.userData;
  console.log(req.userData);
  const { topics } = req.body;

  if (!_id || !topics) {
    return res.status(400).json(new ApiResponse(400, null, "Missing required fields"));
  }

  try {
    const user = await User.findOne({ _id });
    user.Topics = [];
    await user.save();
    await User.updateOne({ _id }, { $push: { Topics: { $each: topics } } });

    res.status(201).json(new ApiResponse(201, null, "Topics selected successfully"));
  } catch (error) {
    console.error(error);
    res.status(400).json(new ApiResponse(400, null, "Failed to select topics"));
  }
});

const getquetion = AsyncHandler(async (req, res) => {
  const { _id } = req.userData;
  let topic = req.params.topic;

  if (!_id ) {
    return res.status(400).json(new ApiResponse(400, null, "Missing required fields"));
  }

  try {
    if (topic === "Programming-Logic") topic = "Programming Logic";
    if (topic === "React-Native") topic = "React Native";
    if (topic === "C") topic = "C Programming";
    if (!["MERN", "Java", "Python", "C Programming", "Programming Logic", "React Native", "HTML","JavaScript"].includes(topic)) {
      topic = "HTML";
    }

    const questions = await Quiz.aggregate([{ $match: { topicName: topic } }, { $sample: { size: 5 } }]);
    questionset[_id] = questions;
    const qWithoutAns = questions.map(({ correctAnswer, ...remaining }) => remaining);
    questionbank[_id] = questions.map((item) => ({ _id: item._id.toString(), correctAnswer: item.correctAnswer }));

    res.status(200).json(new ApiResponse(200,  qWithoutAns , "Questions fetched successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, null, "Failed to fetch questions"));
  }
});

const fetchtopic = AsyncHandler(async (req, res) => {
  const { _id } = req.userData || "66e5ea97d63f397f69875911";

  if (!_id) {
    return res.status(400).json(new ApiResponse(400, null, "Missing required fields"));
  }

  try {
    const user = await User.findOne({ _id }, { _id: 0, Topics: 1 });
    const TopicArray = user.Topics.map(topic => ({ topicName: topic }));

    const questions = await Quiz.aggregate([{ $match: { $or: TopicArray } }, { $sample: { size: 5 } }]);
    console.log(questions);
    questionset[_id] = questions;
    const qWithoutAns = questions.map(({ correctAnswer, ...remaining }) => remaining);
    questionbank[_id] = questions.map((item) => ({ _id: item._id.toString(), correctAnswer: item.correctAnswer }));

    res.status(200).json(new ApiResponse(200,  qWithoutAns , "Topics fetched successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, null, "Failed to fetch topics"));
  }
});

const score = AsyncHandler(async (req, res) => {
  const { _id } = req.userData;
  const { userAnswer } = req.body;

  if (!userAnswer) {
    return res.status(400).json(new ApiResponse(400, null, "answers are required"));
  }

  try {
    let i = 0;

    if (!questionbank[_id]) {
      return res.status(400).json(new ApiResponse(400, null, "Questions not found"));
    }

    userAnswer.forEach((question) => {
      const matchQ = questionbank[_id].find(({ _id }) => _id === question._id);
      if (matchQ.correctAnswer === question.userans) {
        i++;
      }
    });

    res.status(200).json(new ApiResponse(200, { data: questionset[_id], score: i }, "Score calculated successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, null, "Failed to calculate score"));
  }
});

const login = AsyncHandler(async (req, res) => {
  const { Email, userPassword } = req.body;

  if (!Email ) {
    return res.status(400).json(new ApiResponse(400, null, "Email is required "));
  }

  if (!userPassword) {
    return res.status(400).json(new ApiResponse(400, null, "Password is required"));
  }

  try {
    const user = await User.findOne({ Email });

    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const isPasswordMatch = await user.matchPassword(userPassword);
    if (!isPasswordMatch) {
        return res
            .status(401)
            .json(new ApiResponse(401, "Invalid user credentials"));
    }
    const { accessToken, refreshToken } = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    console.log(accessToken)

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .cookie("user", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged In Successfully"
            )
        );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, null, "Failed to login"));
  }
});

const user = AsyncHandler(async (req, res) => {
  if (!req.userData) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }
  res.status(200).json(new ApiResponse(200, req.userData, "User data fetched successfully"));
});

const otp = AsyncHandler(async (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).json(new ApiResponse(400, null, "Missing required fields"));
  }

  try {
    const otp = randomstring.generate({ length: 6, charset: "numeric" });
    otps[Email] = otp;

    const option = {
      from: "stkbantai1@gmail.com",
      to: Email,
      subject: "Hello ✔",
      html: `<!DOCTYPE html>
       <html lang="en">
         <head>
           <meta charset="UTF-8" />
           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
           <meta http-equiv="X-UA-Compatible" content="ie=edge" />
           <title>Static Template</title>
           <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
         </head>
         <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
           <div style="max-width: 680px; margin: 0 auto; padding: 5px 30px 60px; background: #f4f7ff; background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner); background-repeat: no-repeat; background-size: 800px 452px; background-position: top center; font-size: 14px; color: #434343;">
             <header style="height: 130px;">
               <table style="width: 100%;">
                 <tbody>
                   <tr style="height: 160px;">
                     <td>Shaka-bank</td>
                     <td style="text-align: right;">
                       <span style="font-size: 16px; line-height: 30px; color: #ffffff;">12 Nov, 2021</span>
                     </td>
                   </tr>
                 </tbody>
               </table>
             </header>
             <main>
               <div style="margin: 0; margin-top: 70px; padding: 92px 30px 115px; background: #ffffff; border-radius: 30px; text-align: center;">
                 <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                   <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #1f1f1f;">Your OTP</h1>
                   <p style="margin: 0; margin-top: 17px; font-size: 16px; font-weight: 500;">${Email},</p>
                   <p style="margin: 0; margin-top: 17px; font-weight: 500; letter-spacing: 0.56px;">
                     Thank you for choosing Shaka-Bank. Use the following OTP to complete the registration. OTP is valid for 10 minutes only. Do not share this code with others, including AVAZ employees.
                   </p>
                   <p style="margin: 0; margin-top: 60px; font-size: 40px; font-weight: 600; letter-spacing: 25px; color: #ba3d4f;">${otp}</p>
                 </div>
               </div>
               <p style="max-width: 400px; margin: 0 auto; margin-top: 90px; text-align: center; font-weight: 500; color: #8c8c8c;">
                 Need help? Ask at <a href="mailto:Example@gmail.com" style="color: #499fb6; text-decoration: none;">AVAZ@gmail.com</a> or visit our <a href="" target="_blank" style="color: #499fb6; text-decoration: none;">Help Center</a>
               </p>
             </main>
             <footer style="width: 100%; max-width: 490px; margin: 20px auto 0; text-align: center; border-top: 1px solid #e6ebf1;">
               <p style="margin: 0; margin-top: 40px; font-size: 16px; font-weight: 600; color: #434343;">Shaka-Bank</p>
               <p style="margin: 0; margin-top: 8px; color: #434343;">1st Rabodi, Thane (West), 400601</p>
               <div style="margin: 0; margin-top: 16px;">
                 <a href="" target="_blank" style="display: inline-block;">
                   <img width="36px" alt="Facebook" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook" />
                 </a>
                 <a href="" target="_blank" style="display: inline-block; margin-left: 8px;">
                   <img width="36px" alt="Instagram" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram" />
                 </a>
                 <a href="" target="_blank" style="display: inline-block; margin-left: 8px;">
                   <img width="36px" alt="Twitter" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter" />
                 </a>
                 <a href="" target="_blank" style="display: inline-block; margin-left: 8px;">
                   <img width="36px" alt="Youtube" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube" />
                 </a>
               </div>
               <p style="margin: 0; margin-top: 16px; color: #434343;">Copyright © 2022 Company. All rights reserved.</p>
             </footer>
           </div>
         </body>
       </html>`,
    };

    transporter.sendMail(option, function (error, info) {
      if (error) {
        console.error(error);
        res.status(500).json(new ApiResponse(500, null, "Failed to send OTP"));
      } else {
        res.status(200).json(new ApiResponse(200, null, "OTP sent successfully"));
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, null, "Failed to send OTP"));
  }
});

const logout = AsyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("user");
  res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
});

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
  logout, // Add logout to the export list
};
