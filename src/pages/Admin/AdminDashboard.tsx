import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from "../../config/api";
import { useTheme } from '../../contexts/ThemeContext'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Trophy, 
  MessageSquare,
  Megaphone,
  Code,
  Settings,
  Save,
  X,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  TestTube,
  Eye,
  EyeOff,
  Calendar,
  Award,
  ShoppingCart,
  HelpCircle
} from 'lucide-react';

interface MCQQuestion {
  _id: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  domain: string;
  difficulty: string;
  explanation?: string;
  tags: string[];
  timesAsked: number;
  correctAnswers: number;
  totalAttempts: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

interface RedeemItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  coinCost: number;
  imageUrl?: string;
  isActive: boolean;
  stockQuantity?: number;
  createdAt: string;
}

interface RedeemOrder {
  _id: string;
  user: string;
  items: Array<{
    item: string;
    quantity: number;
    coinCostAtTime: number;
  }>;
  totalCoinCost: number;
  status: string;
  createdAt: string;
}

interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  type: string;
  isActive: boolean;
  participants: string[];
  createdBy: string;
  createdAt: string;
}

interface ContestProblem {
  problemId: string;
  score: number;
}

interface Game {
  _id: string;
  title: string;
  description: string;
  type: string;
  settings: any;
  isActive: boolean;
  participants: string[];
  status: string;
  createdAt: string;
}

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  tags: string[];
  submissions: number;
  accepted: number;
  acceptanceRate: number;
}

interface Contest {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
  participants: any[];
}

interface Discussion {
  _id: string;
  title: string;
  author: { username: string };
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  createdAt: string;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  linkedIn?: string;
  github?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  college?: string;
  branch?: string;
  graduationYear?: number;
}

interface User {
  _id: string;
  username?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  profile?: UserProfile;
}
  

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProblem, setShowCreateProblem] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [editProblemData, setEditProblemData] = useState<any>(null);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [editingContestId, setEditingContestId] = useState<string | null>(null);
  const [editContestData, setEditContestData] = useState<any>(null);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    tags: '',
    companies: '',
    constraints: '',
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [
      { input: '', output: '', explanation: '', isPublic: true },
      { input: '', output: '', explanation: '', isPublic: true },
      { input: '', output: '', explanation: '', isPublic: false },
      { input: '', output: '', explanation: '', isPublic: false },
      { input: '', output: '', explanation: '', isPublic: false }
    ],
    codeTemplates: {
      cpp: '// C++ template\nclass Solution {\npublic:\n    // Your function here\n};',
      java: '// Java template\nclass Solution {\n    public int functionName() {\n        // Your code here\n    }\n}',
      python: '# Python template\nclass Solution:\n    def function_name(self):\n        # Your code here\n        pass',
      c: '// C template\n#include <stdio.h>\n\nint functionName() {\n    // Your code here\n}',
      javascript: '// JavaScript template\nvar functionName = function(nums) {\n    // Your code here\n};'
    },
    functionSignature: {
      cpp: 'int functionName(vector<int>& nums)',
      java: 'public int functionName(int[] nums)',
      python: 'def function_name(self, nums: List[int]) -> int:',
      c: 'int functionName(int* nums, int numsSize)',
      javascript: 'var functionName = function(nums) { };'
    },
    timeLimit: 2000,
    memoryLimit: 256,
    isPublished: false,
    isFeatured: false,
    editorial: {
      written: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: 0
    },
    visibility: 'public',
    referenceSolution: [
      { language: 'cpp', completeCode: '' },
      { language: 'java', completeCode: '' },
      { language: 'python', completeCode: '' },
      { language: 'c', completeCode: '' }
    ]
  });

  const [newContest, setNewContest] = useState({
    name: '',
    description: '',
    bannerImage: '',
    startTime: '',
    endTime: '',
    duration: 60,
    isPublic: true,
    password: '',
    leaderboardVisible: true,
    freezeTime: 0,
    rules: '',
    editorial: '',
    allowedLanguages: ['cpp', 'python', 'java', 'c', 'js'],
    problems: [] as ContestProblem[] // Array of {problemId, score}
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    tags: '',
    imageUrl: '',
    link: '',
    expiresAt: '',
    visibleToRoles: ['user'],
    pinned: false
  });

  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [editAnnouncementData, setEditAnnouncementData] = useState<any>(null);

  // MCQ Questions state
  const [showCreateMCQ, setShowCreateMCQ] = useState(false);
  const [newMCQ, setNewMCQ] = useState({
    question: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    domain: 'dsa',
    difficulty: 'Medium',
    explanation: '',
    tags: [] as string[],
    isActive: true
  });

  // Chat Rooms state
  const [showCreateChatRoom, setShowCreateChatRoom] = useState(false);
  const [newChatRoom, setNewChatRoom] = useState({
    name: '',
    description: '',
    type: 'general',
    isActive: true
  });

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Helper function to show notifications
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // User CRUD handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/users`, newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUsers([response.data, ...users]);
      setShowCreateUser(false);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      showNotification('success', 'User created successfully!');
    } catch (error: any) {
      showNotification('error', `Failed to create user: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user._id);
    setEditUserData({ ...user });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/users/${editingUserId}`, editUserData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUsers(users.map(u => u._id === editingUserId ? response.data : u));
      setEditingUserId(null);
      setEditUserData(null);
      showNotification('success', 'User updated!');
    } catch (error: any) {
      showNotification('error', 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== userId));
      showNotification('success', 'User deleted successfully!');
    } catch (error) {
      showNotification('error', 'Failed to delete user.');
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [
        problemsRes, 
        contestsRes, 
        discussionsRes, 
        announcementsRes, 
        usersRes,
        mcqRes,
        chatRoomsRes
      ] = await Promise.all([
        axios.get(`${API_URL}/problems/admin/all`, { headers }),
        axios.get(`${API_URL}/contests`, { headers }),
        axios.get(`${API_URL}/discussion`, { headers }),
        axios.get(`${API_URL}/announcements`, { headers }),
        axios.get(`${API_URL}/users`, { headers }),
        axios.get(`${API_URL}/mcq`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/chats/rooms`, { headers }).catch(() => ({ data: [] }))
      ]);

      setProblems(problemsRes.data.problems || []);
      setContests(contestsRes.data || []);
      setDiscussions(discussionsRes.data.discussions || []);
      setAnnouncements(announcementsRes.data || []);
      setUsers(usersRes.data || []);
      setMcqQuestions(mcqRes.data.questions || []);
      setChatRooms(chatRoomsRes.data || []);
    } catch (error: any) {
      console.error('❌ [AdminDashboard] Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Admin: Creating new problem...');
    console.log('👤 Current user role:', user?.role);
    console.log('🔑 Token exists:', !!localStorage.getItem('token'));

    try {
      const problemData = {
        title: newProblem.title,
        description: newProblem.description,
        difficulty: newProblem.difficulty,
        tags: newProblem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        companies: newProblem.companies.split(',').map(company => company.trim()).filter(company => company),
        constraints: newProblem.constraints,
        examples: newProblem.examples.filter(ex => ex.input && ex.output),
        testCases: newProblem.testCases.filter(tc => tc.input && tc.output),
        codeTemplates: newProblem.codeTemplates,
        functionSignature: newProblem.functionSignature,
        timeLimit: newProblem.timeLimit,
        memoryLimit: newProblem.memoryLimit,
        isPublished: newProblem.isPublished,
        isFeatured: newProblem.isFeatured,
        editorial: newProblem.editorial.written ? newProblem.editorial : undefined,
        visibility: newProblem.visibility
      };

      console.log('📤 Sending problem data:', problemData);

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token');
        alert('Please login again.');
        return;
      }

      const response = await axios.post(`${API_URL}/problems`, problemData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Admin: Problem created successfully');

      setProblems([response.data, ...problems]);
      setShowCreateProblem(false);
      setNewProblem({
        title: '',
        description: '',
        difficulty: 'Easy',
        tags: '',
        companies: '',
        constraints: '',
        examples: [{ input: '', output: '', explanation: '' }],
        testCases: [{ input: '', output: '', explanation: '', isPublic: true }],
        codeTemplates: {
          cpp: '',
          java: '',
          python: '',
          c: '',
          javascript: ''
        },
        functionSignature: {
          cpp: '',
          java: '',
          python: '',
          c: '',
          javascript: ''
        },
        timeLimit: 2000,
        memoryLimit: 256,
        isPublished: false,
        isFeatured: false,
        editorial: {
          written: '',
          videoUrl: '',
          thumbnailUrl: '',
          duration: 0
        },
        visibility: 'public',
        referenceSolution: [
          { language: 'cpp', completeCode: '' },
          { language: 'java', completeCode: '' },
          { language: 'python', completeCode: '' },
          { language: 'c', completeCode: '' }
        ]
      });
      showNotification('success', 'Problem created successfully!');
    } catch (error: any) {
      console.error('❌ Admin: Error creating problem:', error);
      console.error('📊 Error response:', error.response?.data);

      if (error.response?.status === 401) {
        showNotification('error', 'Authentication failed. Please logout and login again.');
      } else {
        showNotification('error', `Failed to create problem: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Helper functions for managing test cases and examples
  const addTestCase = () => {
    setNewProblem(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', output: '', explanation: '', isPublic: false }]
    }));
  };

  const removeTestCase = (index: number) => {
    if (newProblem.testCases.length > 1) {
      setNewProblem(prev => ({
        ...prev,
        testCases: prev.testCases.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTestCase = (index: number, field: string, value: string | boolean) => {
    setNewProblem(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const addExample = () => {
    setNewProblem(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const removeExample = (index: number) => {
    if (newProblem.examples.length > 1) {
      setNewProblem(prev => ({
        ...prev,
        examples: prev.examples.filter((_, i) => i !== index)
      }));
    }
  };

  const updateExample = (index: number, field: string, value: string) => {
    setNewProblem(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const updateCodeTemplate = (language: string, value: string) => {
    setNewProblem(prev => ({
      ...prev,
      codeTemplates: { ...prev.codeTemplates, [language]: value }
    }));
  };

  const updateFunctionSignature = (language: string, value: string) => {
    setNewProblem(prev => ({
      ...prev,
      functionSignature: { ...prev.functionSignature, [language]: value }
    }));
  };

  const updateReferenceSolution = (index: number, field: string, value: string) => {
    setNewProblem(prev => ({
      ...prev,
      referenceSolution: prev.referenceSolution.map((sol, i) => 
        i === index ? { ...sol, [field]: value } : sol
      )
    }));
  };

  // MCQ CRUD handlers
  const handleCreateMCQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/mcq`, newMCQ, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMcqQuestions([response.data, ...mcqQuestions]);
      setShowCreateMCQ(false);
      setNewMCQ({
        question: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        domain: 'dsa',
        difficulty: 'Medium',
        explanation: '',
        tags: [] as string[],
        isActive: true
      });
      showNotification('success', 'MCQ Question created successfully!');
    } catch (error: any) {
      showNotification('error', `Failed to create MCQ: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteMCQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this MCQ question?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/mcq/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMcqQuestions(mcqQuestions.filter(mcq => mcq._id !== id));
      showNotification('success', 'MCQ Question deleted!');
    } catch (error: any) {
      showNotification('error', 'Failed to delete MCQ question.');
    }
  };

  // Chat Room CRUD handlers
  const handleCreateChatRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chats/rooms`, newChatRoom, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setChatRooms([response.data, ...chatRooms]);
      setShowCreateChatRoom(false);
      setNewChatRoom({
        name: '',
        description: '',
        type: 'general',
        isActive: true
      });
      showNotification('success', 'Chat Room created successfully!');
    } catch (error: any) {
      showNotification('error', `Failed to create chat room: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteChatRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chat room?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/chats/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatRooms(chatRooms.filter(room => room._id !== id));
      showNotification('success', 'Chat Room deleted!');
    } catch (error: any) {
      showNotification('error', 'Failed to delete chat room.');
    }
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🏆 Admin: Creating new contest...');
    console.log('👤 Current user role:', user?.role);
    console.log('🔑 Token exists:', !!localStorage.getItem('token'));

    try {
      console.log('📤 Sending contest data:', newContest);

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token');
        alert('Please login again.');
        return;
      }

      const response = await axios.post(`${API_URL}/contests`, newContest, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Admin: Contest created successfully');

      setContests([response.data, ...contests]);
      setShowCreateContest(false);
      setNewContest({
        name: '',
        description: '',
        bannerImage: '',
        startTime: '',
        endTime: '',
        duration: 60,
        isPublic: true,
        password: '',
        leaderboardVisible: true,
        freezeTime: 0,
        rules: '',
        editorial: '',
        allowedLanguages: ['cpp', 'python', 'java', 'c', 'js'],
        problems: [] as ContestProblem[]
      });
      showNotification('success', 'Contest created successfully!');
    } catch (error: any) {
      console.error('❌ Admin: Error creating contest:', error);
      console.error('📊 Error response:', error.response?.data);

      if (error.response?.status === 401) {
        showNotification('error', 'Authentication failed. Please logout and login again.');
      } else {
        showNotification('error', `Failed to create contest: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📢 Admin: Creating new announcement...');
    console.log('👤 Current user in admin dashboard:', user);
    console.log('🔑 Token from localStorage:', localStorage.getItem('token'));
    console.log('🔍 User role check:', user?.role);

    try {
      const announcementData = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        type: newAnnouncement.type,
        priority: newAnnouncement.priority,
        tags: newAnnouncement.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageUrl: newAnnouncement.imageUrl,
        link: newAnnouncement.link,
        expiresAt: newAnnouncement.expiresAt ? new Date(newAnnouncement.expiresAt) : null,
        visibleToRoles: newAnnouncement.visibleToRoles,
        pinned: newAnnouncement.pinned
      };

      console.log('📤 Sending announcement data:', announcementData);

      // Double-check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found in localStorage');
        alert('Authentication required. Please login again.');
        return;
      }

      if (user?.role !== 'admin') {
        console.error('❌ User is not admin:', user?.role);
        alert('Admin access required.');
        return;
      }

      const response = await axios.post(`${API_URL}/announcements`, announcementData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Admin: Announcement created successfully');

      setAnnouncements([response.data, ...announcements]);
      setShowCreateAnnouncement(false);
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'general',
        priority: 'medium',
        tags: '',
        imageUrl: '',
        link: '',
        expiresAt: '',
        visibleToRoles: ['user'],
        pinned: false
      });
      showNotification('success', 'Announcement created successfully!');
    } catch (error: any) {
      console.error('❌ Admin: Error creating announcement:', error);
      console.error('📊 Error response:', error.response?.data);
      console.error('📊 Error status:', error.response?.status);
      console.error('📊 Error headers:', error.response?.headers);

      if (error.response?.status === 401) {
        console.error('🔒 Authentication failed - token may be invalid');
        showNotification('error', 'Authentication failed. Please logout and login again.');
      } else {
        showNotification('error', `Failed to create announcement: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement._id);
    setEditAnnouncementData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      // Add other fields as needed
    });
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncementId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/announcements/${editingAnnouncementId}`,
        editAnnouncementData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setAnnouncements(
        announcements.map(a =>
          a._id === editingAnnouncementId ? response.data : a
        )
      );
      setEditingAnnouncementId(null);
      setEditAnnouncementData(null);
      showNotification('success', 'Announcement updated!');
    } catch (error: any) {
      showNotification('error', 'Failed to update announcement.');
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    console.log('🗑️ Admin: Deleting problem:', problemId);
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      await axios.delete(`${API_URL}/problems/${problemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('✅ Problem deleted successfully');
      setProblems(problems.filter(p => p._id !== problemId));
      showNotification('success', 'Problem deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting problem:', error);
      showNotification('error', 'Failed to delete problem.');
    }
  };

  const handleEditProblem = (problem: Problem) => {
    setEditingProblemId(problem._id);
    setEditProblemData({ ...problem });
  };

  const handleUpdateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblemId || !editProblemData) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/problems/${editingProblemId}`, editProblemData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setProblems(problems.map(p => p._id === editingProblemId ? response.data : p));
      setEditingProblemId(null);
      setEditProblemData(null);
      showNotification('success', 'Problem updated successfully!');
    } catch (error: any) {
      showNotification('error', `Failed to update problem: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditContest = (contest: Contest) => {
    setEditingContestId(contest._id);
    setEditContestData({ ...contest });
  };

  const handleUpdateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContestId || !editContestData) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/contests/${editingContestId}`, editContestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setContests(contests.map(c => c._id === editingContestId ? response.data : c));
      setEditingContestId(null);
      setEditContestData(null);
      showNotification('success', 'Contest updated successfully!');
    } catch (error: any) {
      showNotification('error', `Failed to update contest: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteContest = async (contestId: string) => {
    console.log('🗑️ Admin: Deleting contest:', contestId);
    if (!confirm('Are you sure you want to delete this contest?')) return;

    try {
      await axios.delete(`${API_URL}/contests/${contestId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('✅ Contest deleted successfully');
      setContests(contests.filter(c => c._id !== contestId));
      showNotification('success', 'Contest deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting contest:', error);
      showNotification('error', 'Failed to delete contest.');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    console.log('🗑️ Admin: Deleting announcement:', announcementId);
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await axios.delete(`${API_URL}/announcements/${announcementId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('✅ Announcement deleted successfully');
      setAnnouncements(announcements.filter(a => a._id !== announcementId));
      showNotification('success', 'Announcement deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting announcement:', error);
      showNotification('error', 'Failed to delete announcement.');
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
  console.log('🗑️ Admin: Deleting discussion:', discussionId);
  if (!confirm('Are you sure you want to delete this discussion?')) return;

  try {
    await axios.delete(`${API_URL}/discussion/${discussionId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    console.log('✅ Discussion deleted successfully');
    setDiscussions(discussions.filter(d => d._id !== discussionId));
    showNotification('success', 'Discussion deleted successfully!');
  } catch (error) {
    console.error('❌ Error deleting discussion:', error);
    showNotification('error', 'Failed to delete discussion.');
  }
};

  const stats = [
    {
      title: 'Total Problems',
      value: problems.length,
      icon: <Code className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Active Contests',
      value: contests.filter(c => c.status === 'ongoing').length,
      icon: <Trophy className="h-8 w-8 text-yellow-600" />,
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    },
    {
      title: 'Discussions',
      value: discussions.length,
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    {
      title: 'Announcements',
      value: announcements.length,
      icon: <Megaphone className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Settings className="h-4 w-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { id: 'problems', label: 'Problems', icon: <Code className="h-4 w-4" /> },
    { id: 'contests', label: 'Contests', icon: <Trophy className="h-4 w-4" /> },
    { id: 'discussions', label: 'Discussions', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
    { id: 'mcq', label: 'MCQ Questions', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'chats', label: 'Chat Rooms', icon: <MessageSquare className="h-4 w-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${
      isDark
        ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
        : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
    }`}>

      <div className="relative z-10">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <p className="font-medium">{notification.message}</p>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your platform content and settings</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border ${stat.color} transition-transform duration-200 hover:scale-105 hover:shadow-lg`}
                // ↑ Added scaling and shadow on hover
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Problems */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recent Problems</h3>
                      <div className="space-y-3">
                        {problems.slice(0, 5).map((problem) => (
                          <div key={problem._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{problem.title}</p>
                              <p className="text-sm text-gray-600">{problem.difficulty} • {problem.acceptanceRate.toFixed(1)}% acceptance</p>
                            </div>
                            <span className="text-sm text-gray-500">{problem.submissions} submissions</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Contests */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recent Contests</h3>
                      <div className="space-y-3">
                        {contests.slice(0, 5).map((contest) => (
                          <div key={contest._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{contest.name}</p>
                              <p className="text-sm text-gray-600">{contest.status} • {contest.participants.length} participants</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(contest.startTime).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Manage Users</h3>
                    <button 
                      onClick={() => setShowCreateUser(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </button>
                  </div>

                  {showCreateUser && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-lg">
                      <h4 className="text-lg font-semibold mb-4">Create New User</h4>
                      <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Username *</label>
                          <input
                            type="text"
                            required
                            value={newUser.username}
                            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email *</label>
                          <input
                            type="email"
                            required
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Password *</label>
                          <input
                            type="password"
                            required
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Role</label>
                          <select
                            value={newUser.role}
                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Create User
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateUser(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {editingUserId && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-lg">
                      <h4 className="text-lg font-semibold mb-4">Edit User</h4>
                      <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Username *</label>
                          <input
                            type="text"
                            required
                            value={editUserData?.username || ''}
                            onChange={e => setEditUserData({ ...editUserData, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email *</label>
                          <input
                            type="email"
                            required
                            value={editUserData?.email || ''}
                            onChange={e => setEditUserData({ ...editUserData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Role</label>
                          <select
                            value={editUserData?.role || 'user'}
                            onChange={e => setEditUserData({ ...editUserData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Update User
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingUserId(null); setEditUserData(null); }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border border-gray-300 bg-white dark:bg-gray-900">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400">No users found.</td>
                          </tr>
                        ) : (
                          users.map((user) => {
                            // Safe display helpers
                            const displayName =
                              (typeof user.username === 'string' && user.username.trim()) ? user.username :
                              (user.profile && typeof user.profile.firstName === 'string' && user.profile.firstName.trim() ? user.profile.firstName : '') +
                              (user.profile && typeof user.profile.lastName === 'string' && user.profile.lastName.trim() ? ` ${user.profile.lastName}` : '') || 'N/A';
                            const displayEmail = (typeof user.email === 'string' && user.email.trim()) ? user.email : 'N/A';
                            const displayRole = (typeof user.role === 'string' && user.role.trim()) ? user.role : 'user';
                            let displayCreated = 'N/A';
                            if (user.createdAt) {
                              try {
                                displayCreated = new Date(user.createdAt).toLocaleDateString();
                              } catch {
                                displayCreated = 'N/A';
                              }
                            }
                            return (
                              <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{displayName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{displayEmail}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{displayRole}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{displayCreated}</td>
                                <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="p-2 rounded-md bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-700"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'problems' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Manage Problems</h3>
                    <button 
                      onClick={() => setShowCreateProblem(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Problem
                    </button>
                  </div>

                  {showCreateProblem && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-[80vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                          <Code className="mr-2 h-6 w-6 text-blue-600" />
                          Create New Problem
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowCreateProblem(false)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateProblem} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                          <h5 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">Basic Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title *</label>
                              <input
                                type="text"
                                required
                                value={newProblem.title}
                                onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                placeholder="e.g., Two Sum"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Difficulty *</label>
                              <select
                                value={newProblem.difficulty}
                                onChange={(e) => setNewProblem({...newProblem, difficulty: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                              </select>
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description *</label>
                            <textarea
                              required
                              rows={6}
                              value={newProblem.description}
                              onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              placeholder="Describe the problem in detail..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
                              <input
                                type="text"
                                value={newProblem.tags}
                                onChange={(e) => setNewProblem({...newProblem, tags: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                placeholder="Array, Hash Table, Two Pointers"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Companies (comma-separated)</label>
                              <input
                                type="text"
                                value={newProblem.companies}
                                onChange={(e) => setNewProblem({...newProblem, companies: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                placeholder="Google, Microsoft, Amazon"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Constraints *</label>
                            <textarea
                              required
                              rows={3}
                              value={newProblem.constraints}
                              onChange={(e) => setNewProblem({...newProblem, constraints: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              placeholder="1 <= n <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
                            />
                          </div>
                        </div>

                        {/* Examples Section */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                              <TestTube className="mr-2 h-5 w-5" />
                              Examples
                            </h5>
                            <button
                              type="button"
                              onClick={addExample}
                              className="flex items-center px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Example
                            </button>
                          </div>
                          {newProblem.examples.map((example, index) => (
                            <div key={index} className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Example {index + 1}</span>
                                {newProblem.examples.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeExample(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Input:</label>
                                  <textarea
                                    rows={2}
                                    value={example.input}
                                    onChange={(e) => updateExample(index, 'input', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                                    placeholder="nums = [2,7,11,15], target = 9"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Output:</label>
                                  <textarea
                                    rows={2}
                                    value={example.output}
                                    onChange={(e) => updateExample(index, 'output', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                                    placeholder="[0,1]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Explanation:</label>
                                  <textarea
                                    rows={2}
                                    value={example.explanation}
                                    onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Test Cases Section */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center">
                              <TestTube className="mr-2 h-5 w-5" />
                              Test Cases ({newProblem.testCases.length})
                            </h5>
                            <button
                              type="button"
                              onClick={addTestCase}
                              className="flex items-center px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Test Case
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            {newProblem.testCases.map((testCase, index) => (
                              <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Test Case {index + 1}</span>
                                    <label className="flex items-center text-sm">
                                      {testCase.isPublic ? (
                                        <Eye className="h-4 w-4 text-green-600 mr-1" />
                                      ) : (
                                        <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
                                      )}
                                      <input
                                        type="checkbox"
                                        checked={testCase.isPublic}
                                        onChange={(e) => updateTestCase(index, 'isPublic', e.target.checked)}
                                        className="sr-only"
                                      />
                                      <span 
                                        className={`cursor-pointer ${testCase.isPublic ? 'text-green-600' : 'text-gray-400'}`}
                                        onClick={() => updateTestCase(index, 'isPublic', !testCase.isPublic)}
                                      >
                                        {testCase.isPublic ? 'Public' : 'Hidden'}
                                      </span>
                                    </label>
                                  </div>
                                  {newProblem.testCases.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeTestCase(index)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Input:</label>
                                    <textarea
                                      rows={3}
                                      value={testCase.input}
                                      onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                                      placeholder="2&#10;7 11 15&#10;9"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Expected Output:</label>
                                    <textarea
                                      rows={3}
                                      value={testCase.output}
                                      onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                                      placeholder="0 1"
                                    />
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Explanation (optional):</label>
                                  <textarea
                                    rows={2}
                                    value={testCase.explanation || ''}
                                    onChange={(e) => updateTestCase(index, 'explanation', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Optional explanation for this test case..."
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Code Templates Section */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                          <h5 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400 flex items-center">
                            <Code className="mr-2 h-5 w-5" />
                            Code Templates & Function Signatures
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['python', 'cpp', 'java', 'c', 'javascript'].map((lang) => (
                              <div key={lang} className="space-y-3">
                                <h6 className="font-medium text-sm text-gray-700 dark:text-gray-300 capitalize">{lang}</h6>
                                <div>
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Function Signature:</label>
                                  <textarea
                                    rows={2}
                                    value={newProblem.functionSignature[lang as keyof typeof newProblem.functionSignature] || ''}
                                    onChange={(e) => updateFunctionSignature(lang, e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                                    placeholder={`${lang} function signature...`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Code Template:</label>
                                  <textarea
                                    rows={4}
                                    value={newProblem.codeTemplates[lang as keyof typeof newProblem.codeTemplates] || ''}
                                    onChange={(e) => updateCodeTemplate(lang, e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                                    placeholder={`${lang} starter code...`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Settings & Limits */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                          <h5 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400 flex items-center">
                            <Settings className="mr-2 h-5 w-5" />
                            Settings & Limits
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Time Limit (ms)</label>
                              <input
                                type="number"
                                value={newProblem.timeLimit}
                                onChange={(e) => setNewProblem({...newProblem, timeLimit: parseInt(e.target.value) || 2000})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Memory Limit (MB)</label>
                              <input
                                type="number"
                                value={newProblem.memoryLimit}
                                onChange={(e) => setNewProblem({...newProblem, memoryLimit: parseInt(e.target.value) || 256})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Visibility</label>
                              <select
                                value={newProblem.visibility}
                                onChange={(e) => setNewProblem({...newProblem, visibility: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="premium">Premium</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6 mt-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newProblem.isPublished}
                                onChange={(e) => setNewProblem({...newProblem, isPublished: e.target.checked})}
                                className="mr-2 rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newProblem.isFeatured}
                                onChange={(e) => setNewProblem({...newProblem, isFeatured: e.target.checked})}
                                className="mr-2 rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                            </label>
                          </div>
                        </div>

                        {/* Editorial Section */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                          <h5 className="text-lg font-semibold mb-4 text-teal-600 dark:text-teal-400">Editorial (Optional)</h5>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Written Editorial</label>
                              <textarea
                                rows={4}
                                value={newProblem.editorial.written}
                                onChange={(e) => setNewProblem({
                                  ...newProblem, 
                                  editorial: { ...newProblem.editorial, written: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                placeholder="Detailed solution explanation..."
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Video URL</label>
                                <input
                                  type="url"
                                  value={newProblem.editorial.videoUrl}
                                  onChange={(e) => setNewProblem({
                                    ...newProblem, 
                                    editorial: { ...newProblem.editorial, videoUrl: e.target.value }
                                  })}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                  placeholder="https://youtube.com/..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Duration (seconds)</label>
                                <input
                                  type="number"
                                  value={newProblem.editorial.duration}
                                  onChange={(e) => setNewProblem({
                                    ...newProblem, 
                                    editorial: { ...newProblem.editorial, duration: parseInt(e.target.value) || 0 }
                                  })}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reference Solutions */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                          <h5 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">Reference Solutions</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {newProblem.referenceSolution.map((solution, index) => (
                              <div key={index} className="space-y-2">
                                <div>
                                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Language</label>
                                  <select
                                    value={solution.language}
                                    onChange={(e) => updateReferenceSolution(index, 'language', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                  >
                                    <option value="python">Python</option>
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                    <option value="c">C</option>
                                    <option value="javascript">JavaScript</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Complete Solution Code</label>
                                  <textarea
                                    rows={8}
                                    value={solution.completeCode}
                                    onChange={(e) => updateReferenceSolution(index, 'completeCode', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                                    placeholder="Complete working solution..."
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="submit"
                            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                          >
                            <Save className="h-5 w-5 mr-2" />
                            Create Problem
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateProblem(false)}
                            className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                          >
                            <X className="h-5 w-5 mr-2" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Edit Problem Modal */}
                  {editingProblemId && editProblemData && (
                    <div className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 max-h-[80vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 flex items-center">
                          <Edit className="mr-2 h-6 w-6" />
                          Edit Problem: {editProblemData.title}
                        </h4>
                        <button
                          onClick={() => {setEditingProblemId(null); setEditProblemData(null);}}
                          className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded-full transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <form onSubmit={handleUpdateProblem} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                          <h5 className="text-lg font-semibold mb-4 text-yellow-600 dark:text-yellow-400">Basic Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title *</label>
                              <input
                                type="text"
                                required
                                value={editProblemData.title || ''}
                                onChange={(e) => setEditProblemData({...editProblemData, title: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Difficulty *</label>
                              <select
                                value={editProblemData.difficulty || 'Easy'}
                                onChange={(e) => setEditProblemData({...editProblemData, difficulty: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                              </select>
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description *</label>
                            <textarea
                              required
                              rows={4}
                              value={editProblemData.description || ''}
                              onChange={(e) => setEditProblemData({...editProblemData, description: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
                              <input
                                type="text"
                                value={Array.isArray(editProblemData.tags) ? editProblemData.tags.join(', ') : (editProblemData.tags || '')}
                                onChange={(e) => setEditProblemData({...editProblemData, tags: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Companies (comma-separated)</label>
                              <input
                                type="text"
                                value={Array.isArray(editProblemData.companies) ? editProblemData.companies.join(', ') : (editProblemData.companies || '')}
                                onChange={(e) => setEditProblemData({...editProblemData, companies: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
                          >
                            <Save className="h-5 w-5 mr-2" />
                            Update Problem
                          </button>
                          <button
                            type="button"
                            onClick={() => {setEditingProblemId(null); setEditProblemData(null);}}
                            className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                          >
                            <X className="h-5 w-5 mr-2" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acceptance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submissions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {problems.map((problem) => (
                          <tr key={problem._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="font-medium">{problem.title}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {problem.tags.slice(0, 2).map((tag, index) => (
                                    <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {problem.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {problem.acceptanceRate.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {problem.submissions}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleEditProblem(problem)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit Problem"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProblem(problem._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete Problem"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'contests' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Manage Contests</h3>
                    <button 
                      onClick={() => setShowCreateContest(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Contest
                    </button>
                  </div>

                  {showCreateContest && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="text-lg font-semibold mb-4">Create New Contest</h4>
                      <form onSubmit={handleCreateContest} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Contest Name *</label>
                            <input
                              type="text"
                              required
                              value={newContest.name}
                              onChange={(e) => setNewContest({...newContest, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                            <input
                              type="number"
                              required
                              value={newContest.duration}
                              onChange={(e) => setNewContest({...newContest, duration: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description *</label>
                          <textarea
                            required
                            rows={3}
                            value={newContest.description}
                            onChange={(e) => setNewContest({...newContest, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Contest description..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Banner Image URL</label>
                          <input
                            type="url"
                            value={newContest.bannerImage}
                            onChange={(e) => setNewContest({...newContest, bannerImage: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/banner.jpg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Contest Rules (Markdown)</label>
                          <textarea
                            rows={4}
                            value={newContest.rules}
                            onChange={(e) => setNewContest({...newContest, rules: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Contest rules and guidelines..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Editorial Content (Markdown)</label>
                          <textarea
                            rows={4}
                            value={newContest.editorial}
                            onChange={(e) => setNewContest({...newContest, editorial: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Contest editorial and explanations..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Start Time *</label>
                            <input
                              type="datetime-local"
                              required
                              value={newContest.startTime}
                              onChange={(e) => setNewContest({...newContest, startTime: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">End Time *</label>
                            <input
                              type="datetime-local"
                              required
                              value={newContest.endTime}
                              onChange={(e) => setNewContest({...newContest, endTime: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Freeze Time (minutes before end)</label>
                            <input
                              type="number"
                              value={newContest.freezeTime}
                              onChange={(e) => setNewContest({...newContest, freezeTime: parseInt(e.target.value) || 0})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Password (for private contest)</label>
                            <input
                              type="text"
                              value={newContest.password}
                              onChange={(e) => setNewContest({...newContest, password: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder="Leave empty for public contest"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Rules (Markdown supported)</label>
                          <textarea
                            rows={3}
                            value={newContest.rules}
                            onChange={(e) => setNewContest({...newContest, rules: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Contest rules and guidelines..."
                          />
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newContest.isPublic}
                              onChange={(e) => setNewContest({...newContest, isPublic: e.target.checked})}
                              className="mr-2"
                            />
                            Public Contest
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newContest.leaderboardVisible}
                              onChange={(e) => setNewContest({...newContest, leaderboardVisible: e.target.checked})}
                              className="mr-2"
                            />
                            Show Leaderboard
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Allowed Languages</label>
                          <div className="flex flex-wrap gap-3">
                            {['cpp', 'java', 'python', 'c', 'js'].map((lang) => (
                              <label key={lang} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={newContest.allowedLanguages.includes(lang)}
                                  onChange={(e) => {
                                    const languages = e.target.checked 
                                      ? [...newContest.allowedLanguages, lang]
                                      : newContest.allowedLanguages.filter(l => l !== lang);
                                    setNewContest({...newContest, allowedLanguages: languages});
                                  }}
                                  className="mr-1"
                                />
                                {lang.toUpperCase()}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Problem Selection */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Contest Problems</label>
                          <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                            <div className="text-sm text-gray-600 mb-3">
                              Select problems for this contest and set their scores:
                            </div>
                            <div className="space-y-2">
                              {problems.map((problem) => {
                                const isSelected = newContest.problems.some(p => p.problemId === problem._id);
                                const selectedProblem = newContest.problems.find(p => p.problemId === problem._id);
                                
                                return (
                                  <div key={problem._id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                                    <div className="flex items-center flex-1">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setNewContest({
                                              ...newContest,
                                              problems: [...newContest.problems, { problemId: problem._id, score: 100 }]
                                            });
                                          } else {
                                            setNewContest({
                                              ...newContest,
                                              problems: newContest.problems.filter(p => p.problemId !== problem._id)
                                            });
                                          }
                                        }}
                                        className="mr-3"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{problem.title}</div>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                          <span className={`px-2 py-0.5 rounded ${
                                            problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                          }`}>
                                            {problem.difficulty}
                                          </span>
                                          <span>{problem.tags.slice(0, 2).join(', ')}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="ml-4 flex items-center space-x-2">
                                        <label className="text-sm font-medium">Score:</label>
                                        <input
                                          type="number"
                                          min="1"
                                          max="1000"
                                          value={selectedProblem?.score || 100}
                                          onChange={(e) => {
                                            const score = parseInt(e.target.value) || 100;
                                            setNewContest({
                                              ...newContest,
                                              problems: newContest.problems.map(p => 
                                                p.problemId === problem._id ? { ...p, score } : p
                                              )
                                            });
                                          }}
                                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {problems.length === 0 && (
                              <div className="text-center text-gray-500 py-4">
                                No problems available. Create some problems first.
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            Selected: {newContest.problems.length} problem(s)
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Create Contest
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateContest(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Edit Contest Modal */}
                  {editingContestId && editContestData && (
                    <div className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Edit Contest: {editContestData.name}</h4>
                        <button
                          onClick={() => {setEditingContestId(null); setEditContestData(null);}}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <form onSubmit={handleUpdateContest} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Contest Name *</label>
                            <input
                              type="text"
                              required
                              value={editContestData.name || ''}
                              onChange={(e) => setEditContestData({...editContestData, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                            <input
                              type="number"
                              required
                              value={editContestData.duration || ''}
                              onChange={(e) => setEditContestData({...editContestData, duration: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            rows={3}
                            value={editContestData.description || ''}
                            onChange={(e) => setEditContestData({...editContestData, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Start Time *</label>
                            <input
                              type="datetime-local"
                              required
                              value={editContestData.startTime ? new Date(editContestData.startTime).toISOString().slice(0, 16) : ''}
                              onChange={(e) => setEditContestData({...editContestData, startTime: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">End Time *</label>
                            <input
                              type="datetime-local"
                              required
                              value={editContestData.endTime ? new Date(editContestData.endTime).toISOString().slice(0, 16) : ''}
                              onChange={(e) => setEditContestData({...editContestData, endTime: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500"
                            />
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                          >
                            Update Contest
                          </button>
                          <button
                            type="button"
                            onClick={() => {setEditingContestId(null); setEditContestData(null);}}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="space-y-4">
                    {contests.map((contest) => (
                      <div key={contest._id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{contest.name}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(contest.startTime).toLocaleString()} - {new Date(contest.endTime).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">{contest.participants.length} participants</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              contest.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                              contest.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {contest.status}
                            </span>
                            <button 
                              onClick={() => handleEditContest(contest)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Contest"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteContest(contest._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'discussions' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Manage Discussions</h3>
                  <div className="space-y-4">
                    {discussions.map((discussion) => (
                      <div key={discussion._id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{discussion.title}</h4>
                            <p className="text-sm text-gray-600">By {discussion.author.username}</p>
                            <p className="text-sm text-gray-500">{new Date(discussion.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {discussion.isPinned && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Pinned</span>
                            )}
                            {discussion.isLocked && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Locked</span>
                            )}
                            {/* <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button> */}
                            <button
                              onClick={() => handleDeleteDiscussion(discussion._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Manage Announcements</h3>
                    <button 
                      onClick={() => setShowCreateAnnouncement(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Announcement
                    </button>
                  </div>

                  {showCreateAnnouncement && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="text-lg font-semibold mb-4">Create New Announcement</h4>
                      <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Title *</label>
                          <input
                            type="text"
                            required
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Content *</label>
                          <textarea
                            required
                            rows={4}
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Announcement content (supports Markdown)"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select
                              value={newAnnouncement.type}
                              onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="general">General</option>
                              <option value="contest">Contest</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="feature">Feature</option>
                              <option value="update">Update</option>
                              <option value="alert">Alert</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Priority</label>
                            <select
                              value={newAnnouncement.priority}
                              onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                            <input
                              type="text"
                              value={newAnnouncement.tags}
                              onChange={(e) => setNewAnnouncement({...newAnnouncement, tags: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder="urgent, feature, contest"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Image URL</label>
                            <input
                              type="url"
                              value={newAnnouncement.imageUrl}
                              onChange={(e) => setNewAnnouncement({...newAnnouncement, imageUrl: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Link URL</label>
                            <input
                              type="url"
                              value={newAnnouncement.link}
                              onChange={(e) => setNewAnnouncement({...newAnnouncement, link: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder="https://example.com/more-info"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Expires At</label>
                            <input
                              type="datetime-local"
                              value={newAnnouncement.expiresAt}
                              onChange={(e) => setNewAnnouncement({...newAnnouncement, expiresAt: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newAnnouncement.pinned}
                              onChange={(e) => setNewAnnouncement({...newAnnouncement, pinned: e.target.checked})}
                              className="mr-2"
                            />
                            Pin to top
                          </label>
                          <div>
                            <label className="block text-sm font-medium mb-2">Visible to roles</label>
                            <div className="flex space-x-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={newAnnouncement.visibleToRoles.includes('user')}
                                  onChange={(e) => {
                                    const roles = e.target.checked 
                                      ? [...newAnnouncement.visibleToRoles, 'user'].filter((v, i, a) => a.indexOf(v) === i)
                                      : newAnnouncement.visibleToRoles.filter(r => r !== 'user');
                                    setNewAnnouncement({...newAnnouncement, visibleToRoles: roles});
                                  }}
                                  className="mr-1"
                                />
                                Users
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={newAnnouncement.visibleToRoles.includes('admin')}
                                  onChange={(e) => {
                                    const roles = e.target.checked 
                                      ? [...newAnnouncement.visibleToRoles, 'admin'].filter((v, i, a) => a.indexOf(v) === i)
                                      : newAnnouncement.visibleToRoles.filter(r => r !== 'admin');
                                    setNewAnnouncement({...newAnnouncement, visibleToRoles: roles});
                                  }}
                                  className="mr-1"
                                />
                                Admins
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Create Announcement
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateAnnouncement(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Edit Announcement Form */}
                  {editingAnnouncementId && editAnnouncementData && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="text-lg font-semibold mb-4">Edit Announcement</h4>
                      <form onSubmit={handleUpdateAnnouncement} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Title *</label>
                          <input
                            type="text"
                            required
                            value={editAnnouncementData.title}
                            onChange={e => setEditAnnouncementData({ ...editAnnouncementData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Content *</label>
                          <textarea
                            required
                            rows={4}
                            value={editAnnouncementData.content}
                            onChange={e => setEditAnnouncementData({ ...editAnnouncementData, content: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Announcement content (supports Markdown)"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select
                              value={editAnnouncementData.type}
                              onChange={e => setEditAnnouncementData({ ...editAnnouncementData, type: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="general">General</option>
                              <option value="contest">Contest</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="feature">Feature</option>
                              <option value="update">Update</option>
                              <option value="alert">Alert</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Priority</label>
                            <select
                              value={editAnnouncementData.priority}
                              onChange={e => setEditAnnouncementData({ ...editAnnouncementData, priority: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Update Announcement
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingAnnouncementId(null); setEditAnnouncementData(null); }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement._id}
                        className="group relative p-4 border border-gray-200 rounded-lg bg-white shadow-sm transition-all duration-200
                          hover:shadow-lg hover:scale-[1.03] hover:border-blue-400"
                        style={{ minHeight: 140, maxHeight: 180, overflow: "hidden" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-base truncate">{announcement.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                            announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {announcement.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                          {announcement.content.length > 120
                            ? `${announcement.content.substring(0, 120)}...`
                            : announcement.content}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                        <div className="absolute top-2 right-2 flex space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            className="text-blue-600 hover:text-blue-800 bg-white rounded-full p-1 shadow-sm border border-blue-100 hover:border-blue-400 transition-colors"
                            title="Edit"
                            onClick={() => handleEditAnnouncement(announcement)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAnnouncement(announcement._id)}
                            className="text-red-600 hover:text-red-800 bg-white rounded-full p-1 shadow-sm border border-red-100 hover:border-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MCQ Questions Tab */}
              {activeTab === 'mcq' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center">
                      <HelpCircle className="mr-2 h-6 w-6 text-blue-600" />
                      Manage MCQ Questions
                    </h3>
                    <button 
                      onClick={() => setShowCreateMCQ(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create MCQ Question
                    </button>
                  </div>

                  {showCreateMCQ && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">Create New MCQ Question</h4>
                        <button
                          onClick={() => setShowCreateMCQ(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <form onSubmit={handleCreateMCQ} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Question *</label>
                          <textarea
                            required
                            rows={3}
                            value={newMCQ.question}
                            onChange={(e) => setNewMCQ({...newMCQ, question: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your question..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {newMCQ.options.map((option, index) => (
                            <div key={index}>
                              <label className="block text-sm font-medium mb-2">
                                Option {index + 1} {option.isCorrect && <span className="text-green-600">(Correct)</span>}
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [...newMCQ.options];
                                    newOptions[index] = { ...newOptions[index], text: e.target.value };
                                    setNewMCQ({...newMCQ, options: newOptions});
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                                  placeholder={`Option ${index + 1} text...`}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOptions = newMCQ.options.map((opt, i) => ({
                                      ...opt,
                                      isCorrect: i === index
                                    }));
                                    setNewMCQ({...newMCQ, options: newOptions});
                                  }}
                                  className={`px-3 py-2 rounded-md ${
                                    option.isCorrect 
                                      ? 'bg-green-600 text-white' 
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                  title="Mark as correct answer"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Domain</label>
                            <select
                              value={newMCQ.domain}
                              onChange={(e) => setNewMCQ({...newMCQ, domain: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="dsa">Data Structures & Algorithms</option>
                              <option value="system-design">System Design</option>
                              <option value="aiml">AI/ML</option>
                              <option value="aptitude">Aptitude</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Difficulty</label>
                            <select
                              value={newMCQ.difficulty}
                              onChange={(e) => setNewMCQ({...newMCQ, difficulty: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                          <input
                            type="text"
                            value={newMCQ.tags.join(', ')}
                            onChange={(e) => setNewMCQ({...newMCQ, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="arrays, sorting, recursion"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Explanation (optional)</label>
                          <textarea
                            rows={2}
                            value={newMCQ.explanation}
                            onChange={(e) => setNewMCQ({...newMCQ, explanation: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Explain the correct answer..."
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newMCQ.isActive}
                            onChange={(e) => setNewMCQ({...newMCQ, isActive: e.target.checked})}
                            className="mr-2"
                          />
                          <label className="text-sm">Active</label>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Create MCQ
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateMCQ(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    {mcqQuestions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No MCQ questions found. Create your first question!
                      </div>
                    ) : (
                      mcqQuestions.map((mcq) => (
                        <div key={mcq._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-2">{mcq.question}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  mcq.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                  mcq.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {mcq.difficulty}
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                  {mcq.domain}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  mcq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {mcq.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 p-1">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMCQ(mcq._id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {mcq.options.map((option, index) => (
                              <div key={index} className={`p-2 rounded border ${
                                option.isCorrect 
                                  ? 'bg-green-50 border-green-200 dark:bg-violet-900 dark:border-violet-700' 
                                  : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                              }`}>
                                <span className="font-medium text-sm">
                                  {String.fromCharCode(65 + index)}. {option.text}
                                  {option.isCorrect && <Check className="inline h-4 w-4 ml-2 text-green-600 dark:text-violet-300" />}
                                </span>
                              </div>
                            ))}
                          </div>
                          {mcq.explanation && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm text-blue-800">
                                <strong>Explanation:</strong> {mcq.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Chat Rooms Tab */}
              {activeTab === 'chats' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center">
                      <MessageSquare className="mr-2 h-6 w-6 text-indigo-600" />
                      Manage Chat Rooms
                    </h3>
                    <button 
                      onClick={() => setShowCreateChatRoom(true)}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Chat Room
                    </button>
                  </div>

                  {showCreateChatRoom && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">Create New Chat Room</h4>
                        <button
                          onClick={() => setShowCreateChatRoom(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <form onSubmit={handleCreateChatRoom} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Room Name *</label>
                            <input
                              type="text"
                              required
                              value={newChatRoom.name}
                              onChange={(e) => setNewChatRoom({...newChatRoom, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., General Discussion"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select
                              value={newChatRoom.type}
                              onChange={(e) => setNewChatRoom({...newChatRoom, type: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="general">General</option>
                              <option value="contest">Contest</option>
                              <option value="study">Study Group</option>
                              <option value="announcement">Announcements</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            rows={3}
                            value={newChatRoom.description}
                            onChange={(e) => setNewChatRoom({...newChatRoom, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Room description..."
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newChatRoom.isActive}
                            onChange={(e) => setNewChatRoom({...newChatRoom, isActive: e.target.checked})}
                            className="mr-2"
                          />
                          <label className="text-sm">Active</label>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            Create Room
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateChatRoom(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chatRooms.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No chat rooms found. Create your first room!
                      </div>
                    ) : (
                      chatRooms.map((room) => (
                        <div key={room._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-lg">{room.name}</h4>
                            <div className="flex space-x-1">
                              <button className="text-blue-600 hover:text-blue-800 p-1">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteChatRoom(room._id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {room.description && (
                            <p className="text-gray-600 text-sm mb-3">{room.description}</p>
                          )}
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex space-x-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {room.type}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                room.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {room.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <span className="text-gray-500">
                              {room.participants.length} members
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard