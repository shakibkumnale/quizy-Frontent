
import mongoose from "mongoose"

const quizSchema = new mongoose.Schema({
        topicName:String,
        question: { type: String, required: true },
        questionNo: { type: Number, required: true },
        options: {
          optionA: String,
          optionB: String,
          optionC: String,
          optionD: String,
        },
        correctAnswer: { type: String, required: true }
      
    
  });
  
  const Quiz = mongoose.model('question', quizSchema)
  export {Quiz};