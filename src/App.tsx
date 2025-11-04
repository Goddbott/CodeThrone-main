import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Discussion from './pages/Discussion';
import DiscussionDetail from './pages/DiscussionDetail';
import Game from './pages/Game';
import GameMain from './pages/GameMain';
import RapidFire from './pages/RapidFire';
import Contest from './pages/Contest';
import Interview from './pages/Interview';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Redeem from './pages/Redeem';
import CompanyProblems from './pages/CompanyProblems';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ContestProblems from './pages/ContestProblems';
import ContestProblemDetail from './pages/ContestProblemDetail';  
import Announcements from './pages/Announcements';
import AnnounceDetail from './pages/AnnounceDetail';
import OAuthHandler from './pages/OAuthHandler';
import Chat from './pages/Chat';
import ContestLeaderboard from './pages/ContestLeaderboard';
import GameLeaderboard from './pages/GameLeaderboard';
import RapidFireLeaderboard from './pages/RapidFireLeaderboard';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

// Move loading logic to a wrapper component
const tips = [
  "Tip 1: Solve problems daily to build consistency.",
  "Tip 2: Write clean and readable code.",
  "Tip 3: Debug systematically, not randomly.",
  "Tip 4: Learn by explaining your solution.",
  "Tip 5: Focus on time and space optimization."
];

const AppRoutes = () => {
  const { loading } = useAuth();
  const { isDark } = useTheme();
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 2000); // Change tip every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  if (loading) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-t-transparent border-orange-600 mx-auto"></div>
          <Trophy className="text-orange-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={40} />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Loading <span className="text-orange-600">AlgoClash</span>...</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This will take 15 seconds</p>
        <p className="italic text-sm text-gray-600 dark:text-gray-300 transition-all duration-500">{tips[tipIndex]}</p>
      </div>
    </div>
  );
  }

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 relative ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}>
        
        {/* Beautiful Falling White Balls Animation for Dark Mode */}
        {isDark && (
          <>

            

          </>
        )}

        {/* Beautiful Light Mode Animations */}


        <Navbar />
        <div className="pt-0 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/chats" element={<Chat />} />
            <Route path="/top" element={<Discussion />} />
            <Route path="/top/:id" element={<DiscussionDetail />} />
            <Route path="/game" element={<ProtectedRoute><GameMain /></ProtectedRoute>} />
            <Route path="/game/coding" element={<ProtectedRoute><Game /></ProtectedRoute>} />
            <Route path="/game/play/:gameId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
            <Route path="/rapidfire" element={<ProtectedRoute><RapidFire /></ProtectedRoute>} />
            <Route path="/rapidfire/play/:gameId" element={<ProtectedRoute><RapidFire /></ProtectedRoute>} />
            <Route path="/contest" element={<Contest />} />
            <Route path="/contest/:id/problems" element={<ContestProblems />} />
            <Route path="/contest/:id/problem/:problemId" element={<ContestProblemDetail />} />
            <Route path="/contest/leaderboard" element={<ContestLeaderboard />} />
            <Route path="/game/leaderboard" element={<GameLeaderboard />} />
            <Route path="/rapidfire/leaderboard" element={<RapidFireLeaderboard />} />
            {/* <Route path="/contest" element={<Contest />} />
            <Route path="/contest/:contestId/problems" element={<ContestProblems />} />
            <Route path="/contest/:contestId/problem/:problemId" element={<ContestProblemDetail />} /> */}
            {/* <Route path="/contest/:id" element={<ProtectedRoute><Contest /></ProtectedRoute>}/> */}
            <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/redeem" element={<ProtectedRoute><Redeem /></ProtectedRoute>} />
            <Route path="/company/:company" element={<CompanyProblems />} />
            <Route path="/company-problems" element={<CompanyProblems />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path='/announcements' element={<Announcements/>}/>
            <Route path='/announcements/:id' element={<AnnounceDetail/>}/>
            <Route path="/oauth" element={<OAuthHandler />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </ThemeProvider>
    
  );
}

export default App;
