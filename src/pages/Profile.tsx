import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Github, Linkedin, Trophy, Code, TrendingUp, Award, Star, Target, Zap, Activity, CheckCircle } from 'lucide-react';
import { API_URL, SOCKET_URL } from "../config/api";
import SubmissionCalendar from '../components/SubmissionCalendar';
import { showError, showSuccess } from '../utils/toast';

// Animated Counter Component (Animation Removed)
const AnimatedCounter: React.FC<{ end: number; prefix?: string; suffix?: string }> = ({ 
  end, 
  prefix = '', 
  suffix = '' 
}) => {
  // Directly render the end value without animation
  return <span>{prefix}{end}{suffix}</span>;
};

// Progress Circle Component (Animation Removed)
const ProgressCircle: React.FC<{ 
  percentage: number; 
  size?: number; 
  strokeWidth?: number; 
  color?: string;
  label?: string;
}> = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = '#3B82F6',
  label 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="" // Removed transition class
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          <AnimatedCounter end={Math.round(percentage)} suffix="%" />
        </span>
        {label && (
          <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{label}</span>
        )}
      </div>
    </div>
  );
};

// Mini Chart Component for activity (Animation Removed)
const ActivityChart: React.FC<{ data: number[] }> = ({ data }) => {
  const maxValue = Math.max(...data, 1);
  
  return (
    <div className="flex items-end space-x-1 h-12">
      {data.map((value, index) => (
        <div
          key={index}
          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
          style={{
            height: `${(value / maxValue) * 100}%`,
            width: '8px',
          }} // Removed animationDelay
        />
      ))}
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>{children}</div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{children}</h3>
);


interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: string;
  totalProblemsCount?: number; // Add this field
  profile: {
    firstName: string;
    lastName: string;
    linkedIn: string;
    github: string;
    avatar: string;
    bio: string;
    location: string;
    college: string;
    branch: string;
    graduationYear: number;
  };
  stats: {
    problemsSolved: {
      total: number;
      easy: number;
      medium: number;
      hard: number;
    };
    problemsAttempted: number;
    totalSubmissions: number;
    correctSubmissions: number;
    accuracy: number;
    currentStreak: number;
    maxStreak: number;
    lastSubmissionDate: string;
  };
  ratings: {
    gameRating: number;
    rapidFireRating: number;
    contestRating: number;
    globalRank: number;
    percentile: number;
  };
  topicProgress: {
    topic: string;
    solved: number;
    total: number;
  }[];
  solvedProblems: {
    _id: string;
    title: string;
    difficulty: string;
  }[];
  gameHistory: {
    opponent: {
      username: string;
    };
    result: string;
    ratingChange: number;
    problem: {
      title: string;
      difficulty: string;
    };
    date: string;
  }[];
  contestHistory: {
    contest: {
      name: string;
    };
    rank: number;
    score: number;
    ratingChange: number;
    date: string;
  }[];
  submissions: {
    problem: string;
    status: string;
    language: string;
    runtime: number;
    memory: number;
    date: string;
  }[];
  recentActivities: {
    type: string;
    date: string;
    message: string;
  }[];
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user, refreshUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ topContest: any[]; topGame: any[]; topRapidFire: any[] }>({ topContest: [], topGame: [], topRapidFire: [] });
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    linkedIn: '',
    github: '',
    bio: '',
    location: '',
    college: '',
    branch: '',
    graduationYear: ''
  });

  useEffect(() => {
    if (username) {
      // console.log('🔍 Profile component: Fetching profile for username:', username);
      fetchProfile();
    }
  }, [username]);

  const navigate = useNavigate();

  useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/global-leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      showError('Error fetching leaderboard');
    }
  };
  fetchLeaderboard();
}, []);

  const fetchProfile = async () => {
    // console.log('📡 Fetching profile for username:', username);
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/profile/${username}`);
      // console.log('✅ Profile data received:', response.data);
      
      const profileData = response.data;
      
      // Ensure all required fields exist with defaults
      const normalizedProfile: UserProfile = {
        _id: profileData._id || '',
        username: profileData.username || '',
        email: profileData.email || '',
        role: profileData.role || 'user',
        totalProblemsCount: profileData.totalProblemsCount || 100, // Default fallback
        profile: {
          firstName: profileData.profile?.firstName || '',
          lastName: profileData.profile?.lastName || '',
          linkedIn: profileData.profile?.linkedIn || '',
          github: profileData.profile?.github || '',
          avatar: profileData.profile?.avatar || '',
          bio: profileData.profile?.bio || '',
          location: profileData.profile?.location || '',
          college: profileData.profile?.college || '',
          branch: profileData.profile?.branch || '',
          graduationYear: profileData.profile?.graduationYear || 0
        },
        stats: {
          problemsSolved: {
            total: profileData.stats?.problemsSolved?.total || 0,
            easy: profileData.stats?.problemsSolved?.easy || 0,
            medium: profileData.stats?.problemsSolved?.medium || 0,
            hard: profileData.stats?.problemsSolved?.hard || 0
          },
          problemsAttempted: profileData.stats?.problemsAttempted || 0,
          totalSubmissions: profileData.stats?.totalSubmissions || 0,
          correctSubmissions: profileData.stats?.correctSubmissions || 0,
          accuracy: profileData.stats?.accuracy || 0,
          currentStreak: profileData.stats?.currentStreak || 0,
          maxStreak: profileData.stats?.maxStreak || 0,
          lastSubmissionDate: profileData.stats?.lastSubmissionDate || ''
        },
        ratings: {
          gameRating: profileData.ratings?.gameRating || 1200,
          rapidFireRating: profileData.ratings?.rapidFireRating || 1200,
          contestRating: profileData.ratings?.contestRating || 1200,
          globalRank: profileData.ratings?.globalRank || 0,
          percentile: profileData.ratings?.percentile || 0
        },
        topicProgress: profileData.topicProgress || [],
        solvedProblems: profileData.solvedProblems || [],
        gameHistory: profileData.gameHistory || [],
        contestHistory: profileData.contestHistory || [],
        submissions: profileData.submissions || [],
        recentActivities: profileData.recentActivities || []
      };
      
      setProfile(normalizedProfile);
      
      // Set edit form data
      setEditForm({
        firstName: normalizedProfile.profile.firstName,
        lastName: normalizedProfile.profile.lastName,
        linkedIn: normalizedProfile.profile.linkedIn,
        github: normalizedProfile.profile.github,
        bio: normalizedProfile.profile.bio,
        location: normalizedProfile.profile.location,
        college: normalizedProfile.profile.college,
        branch: normalizedProfile.profile.branch,
        graduationYear: normalizedProfile.profile.graduationYear.toString()
      });
      
      // console.log('✅ Profile normalized and set successfully');
    } catch (error: any) {
      showError('Error fetching profile');
      // console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      // console.log('🔄 Updating profile...', editForm);

      const response = await axios.put(`${API_URL}/profile/update`, {
        profile: {
          ...editForm,
          graduationYear: editForm.graduationYear ? parseInt(editForm.graduationYear) : null
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // console.log('✅ Profile updated successfully:', response.data);
      showSuccess('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
      // Refresh user data in AuthContext
      await refreshUser();
    } catch (error: any) {
      showError('Error updating profile');
      // console.error('❌ Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Avatar upload handler removed; now using avatar picker modal only

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-700 bg-green-200 dark:text-green-300 dark:bg-green-800/50';
      case 'Medium': return 'text-yellow-700 bg-yellow-200 dark:text-yellow-300 dark:bg-yellow-800/50';
      case 'Hard': return 'text-red-700 bg-red-200 dark:text-red-300 dark:bg-red-800/50';
      default: return 'text-gray-700 bg-gray-200 dark:text-gray-300 dark:bg-gray-800/50';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-600';
      case 'lose': return 'text-red-600';
      case 'draw': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-700 bg-green-200 dark:text-green-300 dark:bg-green-800/50';
      case 'wrong': return 'text-red-700 bg-red-200 dark:text-red-300 dark:bg-red-800/50';
      default: return 'text-gray-700 bg-gray-200 dark:text-gray-300 dark:bg-gray-800/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error || 'The user you\'re looking for doesn\'t exist.'}</p>
          <button 
            onClick={fetchProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.username === profile.username;

  return (
    <div className={`min-h-screen relative ${
      isDark
        ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
        : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
    }`}>
      
      {/* All background animation <style> and <div> blocks have been removed */}
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {profile.profile.avatar && !profile.profile.avatar.startsWith('default:') ? (
                    <img
                      src={profile.profile.avatar}
                      alt={profile.username}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                      <span className="text-white text-2xl font-bold">
                        {profile.profile.avatar?.startsWith('default:') 
                          ? profile.profile.avatar.replace('default:', '') 
                          : profile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Small avatar edit icon at bottom right */}
                  {isOwnProfile && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg focus:outline-none border-2 border-white dark:border-gray-800"
                      onClick={() => setShowAvatarModal(true)}
                      title="Change avatar"
                    >
                      <User className="h-4 w-4 text-white" />
                    </button>
                  )}
                  {/* Avatar selection modal (outside avatar box, centered) */}
                  {showAvatarModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full relative">
                        <button
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-xl font-bold"
                          onClick={() => setShowAvatarModal(false)}
                          aria-label="Close"
                        >
                          ×
                        </button>
                        <h2 className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-white">Choose your avatar</h2>
                        <div className="flex flex-wrap gap-4 justify-center mb-4">
                          {[
                            'https://png.pngtree.com/background/20230611/original/pngtree-cartoon-with-a-man-in-glasses-wearing-headphones-picture-image_3169569.jpg',
                            'https://www.freepngimg.com/download/youtube/63841-profile-twitch-youtube-avatar-discord-free-download-image.png',
                            'https://png.pngtree.com/png-clipart/20230531/original/pngtree-3d-avatar-a-nurse-female-png-image_9174297.png',
                            'https://static.vecteezy.com/system/resources/previews/021/907/479/large_2x/anime-girl-avatar-ai-generated-photo.jpg',
                            'https://wallpapers.com/images/hd/aesthetic-profile-picture-pjnvodm0tj798j1q.jpg',
                            'https://toppng.com/uploads/preview/cool-avatar-transparent-image-cool-boy-avatar-11562893383qsirclznyw.png'
                          ].map((url, idx) => (
                            <button
                              key={url}
                              className={`focus:outline-none border-2 rounded-full w-16 h-16 p-1 ${profile.profile.avatar === url ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-300 dark:border-gray-600'}`}
                              onClick={async () => {
                                setImageUploading(true);
                                try {
                                  // Save avatar to DB
                                  const res = await fetch(`${API_URL}/profile/update`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    },
                                    body: JSON.stringify({ profile: { ...profile.profile, avatar: url } })
                                  });
                                  if (res.ok) {
                                    setProfile(p => p && ({ ...p, profile: { ...p.profile, avatar: url } }));
                                    setShowAvatarModal(false);
                                    if (typeof refreshUser === 'function') refreshUser();
                                  }
                                } finally {
                                  setImageUploading(false);
                                }
                              }}
                              disabled={imageUploading}
                            >
                              <img src={url} alt={`Avatar ${idx+1}`} className="w-full h-full rounded-full object-cover" />
                            </button>
                          ))}
                        </div>
                        <button
                          className="w-full mt-2 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold"
                          onClick={() => setShowAvatarModal(false)}
                          disabled={imageUploading}
                        >Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
                {profile.profile.firstName && profile.profile.lastName && (
                  <p className="text-gray-600 dark:text-gray-300">{profile.profile.firstName} {profile.profile.lastName}</p>
                )}
                {profile.profile.bio && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{profile.profile.bio}</p>
                )}
                {profile.profile.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {profile.profile.location}</p>
                )}
              </div>
              
              {isOwnProfile && (
                <div className="mb-6">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full bg-blue-600 text-white py-2 rounded-md"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              )}
              
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={editForm.linkedIn}
                      onChange={(e) => setEditForm({...editForm, linkedIn: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={editForm.github}
                      onChange={(e) => setEditForm({...editForm, github: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`w-full py-2 rounded-md ${
                      isUpdating 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600'
                    } text-white`}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {profile.profile.linkedIn && (
                    <a
                      href={profile.profile.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600"
                    >
                      <Linkedin className="h-5 w-5 mr-2" />
                      LinkedIn Profile
                    </a>
                  )}
                  {profile.profile.github && (
                    <a
                      href={profile.profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-800"
                    >
                      <Github className="h-5 w-5 mr-2" />
                      GitHub Profile
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {/* Ratings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ratings & Ranks</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-gray-700">Game Rating</span>
                  </div>
                  <span className="font-bold text-blue-600">{profile.ratings.gameRating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-gray-700">Rapid Fire Rating</span>
                  </div>
                  <span className="font-bold text-red-600">{profile.ratings.rapidFireRating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">Contest Rating</span>
                  </div>
                  <span className="font-bold text-purple-600">{profile.ratings.contestRating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Global Rank</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {profile.ratings.globalRank || 'Unranked'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-gray-700">Percentile</span>
                  </div>
                  <span className="font-bold text-orange-600">
                    {profile.ratings.percentile ? `${profile.ratings.percentile}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          <div className="pt-6"></div>
            <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Global Leaderboard
                </h3>
              </div>
              <div className="px-6 pb-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <Award className="h-4 w-4 mr-2 text-purple-600" />
                      Top Contest Ratings
                    </h4>
                    <button
                      onClick={() => navigate('/contest/leaderboard')}
                      className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {leaderboard.topContest.map((user, idx) => (
                    <button
                      key={user._id}
                      className="w-full flex items-center px-4 py-3 mb-2 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer group shadow-sm"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${idx === 0 ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' : 
                            idx === 1 ? 'bg-gray-100 text-gray-800 border-2 border-gray-400' : 
                            idx === 2 ? 'bg-orange-100 text-orange-800 border-2 border-orange-400' : 
                            'bg-blue-100 text-blue-800 border border-blue-300'}
                        `}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                          <AnimatedCounter end={user.ratings.contestRating} />
                        </span>
                        <Star className="h-4 w-4 text-purple-500" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-green-600" />
                      Top Game Ratings
                    </h4>
                    <button
                      onClick={() => navigate('/game/leaderboard')}
                      className="text-sm text-green-600 dark:text-green-400 font-medium hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {leaderboard.topGame.map((user, idx) => (
                    <button
                      key={user._id}
                      className="w-full flex items-center px-4 py-3 mb-2 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer group shadow-sm"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${idx === 0 ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400 dark:bg-yellow-800/50 dark:text-yellow-300 dark:border-yellow-500' : 
                            idx === 1 ? 'bg-gray-100 text-gray-800 border-2 border-gray-400 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-500' : 
                            idx === 2 ? 'bg-orange-100 text-orange-800 border-2 border-orange-400 dark:bg-orange-800/50 dark:text-orange-300 dark:border-orange-500' : 
                            'bg-green-200 text-green-800 border border-green-400 dark:bg-green-800/50 dark:text-green-300 dark:border-green-500'}
                        `}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                          <AnimatedCounter end={user.ratings.gameRating} />
                        </span>
                        <Target className="h-4 w-4 text-green-500" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Top Rapid Fire Ratings */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-red-200/50 dark:border-red-600/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-red-800 dark:text-red-300 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Top Rapid Fire Ratings
                  </h4>
                  <button
                    onClick={() => navigate('/rapidfire/leaderboard')}
                    className="text-sm text-red-600 dark:text-red-400 font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {leaderboard.topRapidFire.length > 0 ? leaderboard.topRapidFire.slice(0, 5).map((user, idx) => (
                    <button
                      key={user._id}
                      onClick={() => navigate(`/profile/${user.username}`)}
                      className="w-full flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/40 rounded-lg group border border-red-200/30 dark:border-red-600/20"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${idx === 0 ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' : 
                            idx === 1 ? 'bg-gray-100 text-gray-800 border-2 border-gray-400' : 
                            idx === 2 ? 'bg-orange-100 text-orange-800 border-2 border-orange-400' : 
                            'bg-red-100 text-red-800 border border-red-300'}
                        `}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                          <AnimatedCounter end={user.ratings.rapidFireRating} />
                        </span>
                        <Zap className="h-4 w-4 text-red-500" />
                      </div>
                    </button>
                  )) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No rapid fire ratings yet</p>
                      <p className="text-xs">Play rapid fire to appear here!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Enhanced Interactive Dashboard */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                Performance Dashboard
              </h3>
              
              {/* Main Stats Grid with Animations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Problems Solved Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-200 dark:bg-green-800/40 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Problems Solved</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        <AnimatedCounter end={profile.stats.problemsSolved.total} />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Problems</p>
                    </div>
                    <ProgressCircle 
                      percentage={profile.totalProblemsCount ? ((profile.stats.problemsSolved.total || 0) / profile.totalProblemsCount) * 100 : 0} 
                      size={80}
                      color="#10B981"
                      label="Progress"
                    />
                  </div>
                  
                  {/* Difficulty Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Easy</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        <AnimatedCounter end={profile.stats.problemsSolved.easy} />
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Medium</span>
                      <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        <AnimatedCounter end={profile.stats.problemsSolved.medium} />
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hard</span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        <AnimatedCounter end={profile.stats.problemsSolved.hard} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accuracy Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Accuracy</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <ProgressCircle 
                      percentage={profile.stats.accuracy || 0} 
                      size={120}
                      color="#3B82F6"
                      label="Success Rate"
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        <AnimatedCounter end={profile.stats.correctSubmissions} />
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Accepted</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                        <AnimatedCounter end={profile.stats.totalSubmissions} />
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                  </div>
                </div>

                {/* Rapid Fire Rating Card */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Rapid Fire Rating</h4>
                    </div>
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                      MCQ
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      <AnimatedCounter end={profile.ratings.rapidFireRating} />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {profile.ratings.rapidFireRating >= 1600 ? 'Expert' :
                       profile.ratings.rapidFireRating >= 1400 ? 'Advanced' :
                       profile.ratings.rapidFireRating >= 1200 ? 'Intermediate' : 'Beginner'}
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                      <span>ELO Rating System</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>Real-time MCQ Battle</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Activity</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</span>
                    <ActivityChart data={[
                      Math.floor(Math.random() * 10) + 1,
                      Math.floor(Math.random() * 10) + 1,
                      Math.floor(Math.random() * 10) + 1,
                      Math.floor(Math.random() * 10) + 1,
                      Math.floor(Math.random() * 10) + 1,
                      Math.floor(Math.random() * 10) + 1,
                      Math.floor(Math.random() * 10) + 1
                    ]} />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      <AnimatedCounter end={Math.min(profile.stats.totalSubmissions, 50) || Math.floor(Math.random() * 30) + 5} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submissions this week</p>
                  </div>
                </div>

                {/* Contest Rating Detailed */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Contest Rating</h4>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      <AnimatedCounter end={profile.ratings?.contestRating || 1200} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Current Rating</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Contests</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          <AnimatedCounter end={profile.contestHistory?.length || 0} />
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Best Rank</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {(() => {
                            if (!profile.contestHistory || profile.contestHistory.length === 0) return 'N/A';
                            // Filter out ranks that are 0 or less
                            const validRanks = profile.contestHistory.map(c => c.rank).filter(r => r > 0);
                            if (validRanks.length === 0) return 'N/A';
                            return `#${Math.min(...validRanks)}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Rating Detailed */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Game Rating</h4>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      <AnimatedCounter end={profile.ratings?.gameRating || 1200} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Current Rating</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Games</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          <AnimatedCounter end={profile.gameHistory?.length || 0} />
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {profile.gameHistory?.length > 0 
                            ? Math.round((profile.gameHistory.filter(g => g.result === 'win').length / profile.gameHistory.length) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            {profile.recentActivities && profile.recentActivities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {profile.recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.type}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Submission Calendar */}
            <div className="mb-6">
              <SubmissionCalendar 
                submissions={profile.submissions?.map(sub => ({
                  date: sub.date,
                  status: sub.status
                })) || []}
              />
            </div>
            
            {/* Topic Progress */}
            {profile.topicProgress && profile.topicProgress.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Progress</h3>
                <div className="space-y-4">
                  {profile.topicProgress.map((topic, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{topic.topic}</span>
                        <span className="text-gray-500">{topic.solved}/{topic.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recently Solved Problems */}
            {profile.solvedProblems && profile.solvedProblems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Solved Problems</h3>
                <div className="space-y-2">
                  {profile.solvedProblems
                    .filter((p): p is NonNullable<typeof p> => p != null)
                    .slice(0, 10)
                    .map((problem, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                          <span className="font-medium text-gray-900">{problem.title}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            
            {/* Recent Submissions */}
            {profile.submissions && profile.submissions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
                <div className="space-y-2">
                  {profile.submissions.slice(Math.max(0,profile.submissions.length-5),profile.submissions.length).reverse().map((submission, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Code className="h-4 w-4 text-blue-500 mr-3" />
                        <div>
                          <span className="font-medium text-gray-900">{submission.language}</span>
                          <div className="text-xs text-gray-500">
                            {submission.runtime}ms • {submission.memory}MB
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(submission.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Game & Contest History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Game History */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Games</h3>
                <div className="space-y-3">
                  {profile.gameHistory && profile.gameHistory.length > 0 ? (
                    Array.from(
                      new Map(
                        profile.gameHistory
                        .filter(g => g.opponent != null && g.problem != null)
                        .map(game => [
                          `${game.date}-${game.opponent.username}-${game.problem.title}-${game.result}`,
                          game
                        ])
                      ).values()
                    )
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((game, index) => (
                      <div key={`${game.date}-${game.opponent.username}-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <div className="flex items-center">
                            <span className={`font-medium ${getResultColor(game.result)} mr-2`}>
                              {game.result.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">vs {game.opponent.username}</span>
                          </div>
                          <div className="text-xs text-gray-500">{game.problem.title}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${game.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {game.ratingChange >= 0 ? '+' : ''}{game.ratingChange}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {new Date(game.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No games played yet</p>
                  )}
                </div>
              </div>
              
              {/* Contest History */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contest History</h3>
                <div className="space-y-3">
                  {profile.contestHistory && profile.contestHistory.length > 0 ? (
                    (() => {
                      // Create a Set to track unique contests based on contest name and date
                      const uniqueContests = Array.from(
                        new Map(
                          profile.contestHistory
                          .filter(c => c.contest != null)
                          .map(contest => [
                            `${contest.contest.name}-${contest.date}`, // Unique key
                            contest
                          ])
                        ).values()
                      );
                      
                      
                      return uniqueContests
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((contest, index) => (
                        <div key={`${contest.contest.name}-${contest.date}-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">{contest.contest.name}</div>
                            <div className="text-sm text-gray-600">Rank #{contest.rank}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-blue-600">{contest.score} pts</div>
                            <div className="text-xs text-gray-500">
                              {new Date(contest.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    <p className="text-gray-500 text-center py-4">No contests participated yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;