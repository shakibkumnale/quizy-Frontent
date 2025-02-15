import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { login, register, fetchTopics, getQuestions, submitScore, selectTopic, fetchUser, sendOtp } from '../api';

// Auth Components
export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ Email: email, userPassword: password });
      console.log(response.data);
      // Handle successful login (e.g., save token, redirect)
    } catch (error) {
      console.error(error);
      // Handle login error
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-800 rounded-lg p-8"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-gray-700 text-white rounded-md px-4 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-cyan-500">
              <Link to="/register" className="text-lg font-semibold ">Don't have an account?
</Link>
              </div>          
          <button
            type="submit"
            className="w-full bg-cyan-500 text-white rounded-md py-3 font-medium hover:bg-cyan-600 transition-colors"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    Fname: '',
    Lname: '',
    Email: '',
    Password: '',
    CPassword: '',
    OTP: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(formData);
      console.log(response.data);
      // Handle successful registration (e.g., save token, redirect)
    } catch (error) {
      console.error(error);
      // Handle registration error
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-800 rounded-lg p-8"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="Fname"
                  className="w-full bg-gray-700 text-white rounded-md px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="First name"
                  value={formData.Fname}
                  onChange={handleChange}
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Last Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="Lname"
                  className="w-full bg-gray-700 text-white rounded-md px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Last name"
                  value={formData.Lname}
                  onChange={handleChange}
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                name="Email"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your email"
                value={formData.Email}
                onChange={handleChange}
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="Password"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Create a password"
                value={formData.Password}
                onChange={handleChange}
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-cyan-500">
              <Link to="/register" className="text-lg font-semibold ">Already have an account?
</Link>
              </div>  
          <button
            type="submit"
            className="w-full bg-cyan-500 text-white rounded-md py-3 font-medium hover:bg-cyan-600 transition-colors"
          >
            Create Account
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// Quiz Components
const processTopics = (data) => {
  // Group questions by topicName
  const topicsMap = data.reduce((acc, question) => {
    if (!acc[question.topicName]) {
      acc[question.topicName] = {
        name: question.topicName,
        questionsCount: 0,
        timeLimit: '30 minutes',
        id: question._id
      };
    }
    acc[question.topicName].questionsCount += 1;
    return acc;
  }, {});

  return Object.values(topicsMap);
};

export const QuizSelection = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchTopics();
        const processedTopics = processTopics(response.data.data);
        setTopics(processedTopics);
      } catch (error) {
        console.error(error);
        setError('Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTopicSelect = async (topic) => {
    try {
      const response = await selectTopic({ topicName: topic.name });
      // Navigate to quiz interface or handle the response as needed
      console.log('Topic selected:', response);
      // You might want to use react-router here to navigate to the quiz
      // navigate(`/quiz/${topic.name}`);
    } catch (error) {
      console.error('Error selecting topic:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Select Quiz Topic</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <motion.div
                key={topic.id || topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-750 transition-colors"
              >
                <h3 className="text-xl font-semibold text-white mb-4">{topic.name}</h3>
                <div className="flex items-center text-gray-400 mb-2">
                  <Trophy className="w-4 h-4 mr-2" />
                  <span>{topic.questionsCount} Questions</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{topic.timeLimit}</span>
                </div>
                <button 
                  className="w-full mt-4 bg-cyan-500 text-white rounded-md py-2 font-medium hover:bg-cyan-600 transition-colors"
                  onClick={() => handleTopicSelect(topic)}
                >
                  Start Quiz
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400 py-8">
              No topics available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const QuizInterface = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizData, setQuizData] = useState({
    title: '',
    questions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getQuestions('MERN');
        if (response.data.message === 'success') {
          const questions = response.data.data;
          setQuizData({
            title: questions[0]?.topicName || 'Quiz',
            questions: questions.map(q => ({
              id: q._id,
              question: q.question,
              options: [
                q.options.optionA,
                q.options.optionB,
                q.options.optionC,
                q.options.optionD
              ],
              questionNo: q.questionNo
            }))
          });
        } else {
          throw new Error('Failed to fetch questions');
        }
      } catch (error) {
        console.error(error);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add score submission
  const handleSubmitQuiz = async () => {
    try {
      const userAnswers = quizData.questions.map((q, index) => ({
        _id: q.id,
        userans: selectedAnswers[index] // You need to track selected answers
      }));

      const response = await submitScore({ userAnswer: userAnswers });
      if (response.data.message === 'success') {
        // Handle successful submission
        console.log('Score:', response.data.score);
        console.log('Correct answers:', response.data.data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">{quizData.title}</h2>
            <div className="text-cyan-400">
              Question {currentQuestion + 1}/{quizData.questions.length}
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl text-white mb-6">
              {quizData.questions[currentQuestion]?.question}
            </h3>
            <div className="space-y-4">
              {quizData.questions[currentQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full p-4 rounded-md text-left transition-colors ${
                    selectedAnswer === option
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="px-6 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Profile = () => {
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    avgScore: 0,
    topPerformance: '',
    recentActivity: [] // Initialize as empty array
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchUser();
        setUserStats({
          ...response.data,
          recentActivity: response.data.recentActivity || [] // Ensure recentActivity is an array
        });
      } catch (error) {
        console.error(error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Rest of your component code remains the same
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* ...existing code... */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">John Doe</h2>
              <p className="text-gray-400">john.doe@example.com</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="text-gray-400 mb-2">Total Quizzes</div>
              <div className="text-3xl font-bold text-white">{userStats.totalQuizzes}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="text-gray-400 mb-2">Average Score</div>
              <div className="text-3xl font-bold text-white">{userStats.avgScore}%</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="text-gray-400 mb-2">Top Performance</div>
              <div className="text-xl font-bold text-white">{userStats.topPerformance}</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {userStats.recentActivity.length > 0 ? (
                userStats.recentActivity.map((activity, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{activity.topic}</div>
                      <div className="text-gray-400">{activity.date}</div>
                    </div>
                    <div className="text-2xl font-bold text-cyan-400">{activity.score}%</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-4">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  Login,
  Register,
  QuizSelection,
  QuizInterface,
  Profile
};