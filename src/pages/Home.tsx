"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import MarqueeLogos from "../pages/MarqueeLogos"
import StarsBackground from "../components/StarsBackground"
import { showError } from '../utils/toast';
// Utility to detect mobile device
function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}
import axios from "axios"
import {
  Code,
  Trophy,
  Users,
  TrendingUp,
  ArrowRight,
  Play,
  BookOpen,
  Calendar,
  Star,
  Zap,
  Target,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Brain,
  Building2,
  Gift,
  Award,
} from "lucide-react"
import { GoMail } from "react-icons/go"
import { API_URL, SOCKET_URL } from "../config/api"

interface Announcement {
  _id: string
  title: string
  content: string
  type: string
  priority: string
  createdAt: string
  createdBy: {
    username: string
  }
}

interface Contest {
  _id: string
  name: string
  description: string
  startTime: string
  endTime: string
  duration: number
  participants: any[]
  status: string
}

// interface ExploreCard {
//   title: string
//   description: string
//   problems: number
//   difficulty: string
//   color: string
//   icon: React.ReactNode
//   filter: string
// }

interface CompanyStats {
  company: string
  count: number
  avgAcceptanceRate: number
  totalSubmissions: number
  easyCount: number
  mediumCount: number
  hardCount: number
}

// interface TopicStats {
//   topic: string
//   count: number
//   avgAcceptanceRate: number
//   easyCount: number
//   mediumCount: number
//   hardCount: number
// }

export interface TopicStats {
  topic: string;
  count: number;
  avgAcceptanceRate: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface ExploreCard {
  title: string;
  description: string;
  problems: number;
  difficulty: string;
  color: string;
  icon: React.ReactNode;
  filter: string;
}

interface PlatformStats {
  totalUsers: number
  totalProblems: number
  totalSubmissions: number
  activeGames: number
  averageRating: number
  topRatedUser?: {
    username: string
    rating: number
  }
}

interface RecentActivity {
  type: "submission" | "game" | "achievement"
  user: string
  description: string
  timestamp: string
}

interface LeaderboardEntry {
  username: string
  rating: number
  gamesPlayed: number
  winRate: number
}

interface UserCoins {
  coins: number
  totalEarned: number
}

const tips = [
  "Tip 1: Solve problems daily to build consistency.",
  "Tip 2: Write clean and readable code.",
  "Tip 3: Debug systematically, not randomly.",
  "Tip 4: Learn by explaining your solution.",
  "Tip 5: Focus on time and space optimization."
];

function LoadingCard() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

const Home: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const { isDark } = useTheme()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [topicStats, setTopicStats] = useState<TopicStats[]>([])
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [userCoins, setUserCoins] = useState<UserCoins>({ coins: 0, totalEarned: 0 })
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    activeGames: 0,
    averageRating: 1200,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dynamicText, setDynamicText] = useState("P");
   const [tipIndex, setTipIndex] = useState(0);
  // console.log("🏠 Home component rendered")

  const carouselItems = [
    {
      title: "Practice & Master",
      description: "Solve 2000+ coding problems from easy to expert level with detailed explanations",
      image: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800",
      features: ["2000+ Problems", "Multiple Languages", "Real-time Testing"],
      gradient: isDark
      ? "from-transparent via-transparent to-transparent"
      : "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
    },
    {
      title: "Compete Globally",
      description: "Join weekly contests and compete with programmers worldwide",
      image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
      features: ["Weekly Contests", "Global Rankings", "ELO Rating System"],
      gradient: isDark
  ? "from-transparent via-transparent to-transparent"
  : "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
    },
    {
      title: "Play Games Like chess.com",
      description: "Challenge others in live coding battles with anti-cheat protection",
      image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
      features: ["Live Battles", "Anti-cheat", "Rating System"],
      gradient: isDark
  ? "from-transparent via-transparent to-transparent"
  : "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
    },
    {
      title: "AI Interview Practice",
      description: "Practice technical interviews with AI-powered questions and feedback",
      image: "https://www.theladders.com/wp-content/uploads/interview-190927.jpg",
      features: ["AI Questions", "Voice Interaction", "Real-time Feedback"],
      gradient: isDark
  ? "from-transparent via-transparent to-transparent"
  : "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
    },
  ]

  useEffect(() => {
    // Fetch data when component mounts, regardless of auth state
    // The data fetching functions should handle auth internally
    // console.log("🔄 Home useEffect triggered")
    fetchData()
    fetchTopicStats()
    fetchCompanyStats()
    fetchPlatformData()
    if (user) {
      fetchUserCoins()
    }
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 2000); // Change tip every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // ...existing code...
  useEffect(() => {
    const fullText = "Programming";
    let i = 1;
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    const startTyping = () => {
      interval = setInterval(() => {
        setDynamicText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) {
          clearInterval(interval);
          timeout = setTimeout(() => {
            i = 1;
            startTyping();
          }, 5000); // 5 seconds pause after full word
        }
      }, 120); // fast motion
    };

    startTyping();

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [carouselItems.length])

  const fetchUserCoins = async () => {
    try {
      // Use coins directly from AuthContext user object (same as Navbar)
      if (user) {
        setUserCoins({
          coins: user.coins || 0,
          totalEarned: user.coins || 0 // Using coins as totalEarned since no separate field exists
        })
        console.log('💰 Updated userCoins from AuthContext:', { coins: user.coins || 0, totalEarned: user.coins || 0 })
      } else {
        setUserCoins({ coins: 0, totalEarned: 0 })
        console.log('💰 No user found, setting coins to 0')
      }
    } catch (error) {
      console.error('Failed to set user coins:', error)
      setUserCoins({ coins: 0, totalEarned: 0 })
    }
  }

  const fetchPlatformData = async () => {
    try {
      console.log("📊 Fetching platform statistics...")
      setError(null)

      // FALLBACK: Use realistic values since we don't have these endpoints yet
      console.log("⚠️ Using realistic fallback data")

      setStats({
        totalUsers: 12847,
        totalProblems: 2156,
        totalSubmissions: 1847392,
        activeGames: 23,
        averageRating: 1342,
        topRatedUser: {
          username: "CodeMaster",
          rating: 2847,
        },
      })

      setRecentActivity([
        {
          type: "submission",
          user: "Alice_Dev",
          description: 'solved "Two Sum" problem',
          timestamp: new Date(Date.now() - 180000).toISOString(),
        },
        {
          type: "game",
          user: "Bob_Coder",
          description: "won a game against Charlie_Pro",
          timestamp: new Date(Date.now() - 420000).toISOString(),
        },
        {
          type: "achievement",
          user: "Diana_Tech",
          description: "earned 'Problem Solver' badge",
          timestamp: new Date(Date.now() - 720000).toISOString(),
        },
      ])

      setLeaderboard([
        { username: "CodeMaster", rating: 2847, gamesPlayed: 156, winRate: 84 },
        { username: "AlgoExpert", rating: 2634, gamesPlayed: 143, winRate: 79 },
        { username: "DevNinja", rating: 2521, gamesPlayed: 198, winRate: 73 },
        { username: "TechGuru", rating: 2387, gamesPlayed: 167, winRate: 71 },
        { username: "CodeWarrior", rating: 2298, gamesPlayed: 134, winRate: 68 },
      ])
    } catch (error) {
      console.error("❌ Error fetching platform data:", error)
      setError("Unable to load latest statistics.")
    }
  }

  const fetchData = async () => {
    console.log("📡 Fetching home page data...")
    try {
      const [announcementsRes, contestsRes] = await Promise.all([
        axios.get(`${API_URL}/announcements`),
        axios.get(`${API_URL}/contests`),
      ])
      console.log("✅ Home data fetched successfully")

      const ann = Array.isArray(announcementsRes.data)
        ? announcementsRes.data
        : announcementsRes.data.announcements || []
      setAnnouncements(ann)
      setContests(contestsRes.data.filter((c: Contest) => c.status === "upcoming").slice(0, 3))
    } catch (error) {
      console.error("❌ Error fetching home data:", error)
      setAnnouncements([])
      setContests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTopicStats = async () => {
    console.log("📊 Fetching topic statistics...")
    try {
      const response = await axios.get(`${API_URL}/problems/topic-stats`)
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // console.log("📊 Raw topic stats:", response.data);
    // setTopicStats(response.data);
    // console.log("✅ Topic stats fetched:", response.data.length, "topics")
    // Map the raw topics to their display names
    const mappedStats = response.data.map((stat: TopicStats) => ({
      ...stat,
      count: Number(stat.count),
      avgAcceptanceRate: Number(stat.avgAcceptanceRate),
      easyCount: Number(stat.easyCount),
      mediumCount: Number(stat.mediumCount),
      hardCount: Number(stat.hardCount)
    }));

    console.log("📊 Mapped topic stats:", mappedStats);
    setTopicStats(mappedStats);
    } catch (error) {
      console.error("❌ Error fetching topic stats:", error)
      // Fallback data
      if (typeof window !== 'undefined') {
      setTopicStats([
        { topic: "Array", count: 245, avgAcceptanceRate: 52.3, easyCount: 89, mediumCount: 124, hardCount: 32 },
        {
          topic: "Dynamic Programming",
          count: 187,
          avgAcceptanceRate: 34.7,
          easyCount: 23,
          mediumCount: 98,
          hardCount: 66,
        },
        { topic: "Tree", count: 156, avgAcceptanceRate: 41.2, easyCount: 45, mediumCount: 78, hardCount: 33 },
        { topic: "Graph", count: 134, avgAcceptanceRate: 38.9, easyCount: 34, mediumCount: 67, hardCount: 33 },
        { topic: "String", count: 198, avgAcceptanceRate: 48.6, easyCount: 78, mediumCount: 89, hardCount: 31 },
        { topic: "Hash Table", count: 167, avgAcceptanceRate: 55.1, easyCount: 67, mediumCount: 78, hardCount: 22 },
        { topic: "Two Pointers", count: 89, avgAcceptanceRate: 58.3, easyCount: 34, mediumCount: 45, hardCount: 10 },
        { topic: "Binary Search", count: 76, avgAcceptanceRate: 42.7, easyCount: 23, mediumCount: 34, hardCount: 19 },
      ])
    }
    else{
      setTopicStats([]) // Empty array in production
    }
    }
  }

  const fetchCompanyStats = async () => {
    console.log("🏢 Fetching company statistics...")
    try {
      const response = await axios.get(`${API_URL}/problems/company`)
      setCompanyStats(response.data)
      console.log("✅ Company stats fetched:", response.data.length, "companies")
    } catch (error) {
      console.error("❌ Error fetching company stats:", error)
      // Fallback data
      setCompanyStats([
        {
          company: "Netflix",
          count: 89,
          avgAcceptanceRate: 38.4,
          totalSubmissions: 234567,
          easyCount: 23,
          mediumCount: 45,
          hardCount: 21,
        },
        {
          company: "Google",
          count: 234,
          avgAcceptanceRate: 42.3,
          totalSubmissions: 1234567,
          easyCount: 67,
          mediumCount: 123,
          hardCount: 44,
        },
        {
          company: "Amazon",
          count: 198,
          avgAcceptanceRate: 45.7,
          totalSubmissions: 987654,
          easyCount: 78,
          mediumCount: 89,
          hardCount: 31,
        },
        {
          company: "Microsoft",
          count: 176,
          avgAcceptanceRate: 48.2,
          totalSubmissions: 876543,
          easyCount: 56,
          mediumCount: 87,
          hardCount: 33,
        },
        {
          company: "Apple",
          count: 145,
          avgAcceptanceRate: 44.8,
          totalSubmissions: 654321,
          easyCount: 45,
          mediumCount: 67,
          hardCount: 33,
        },
        {
          company: "Meta",
          count: 134,
          avgAcceptanceRate: 41.9,
          totalSubmissions: 543210,
          easyCount: 43,
          mediumCount: 56,
          hardCount: 35,
        },
        {
          company: "Tesla",
          count: 67,
          avgAcceptanceRate: 35.7,
          totalSubmissions: 123456,
          easyCount: 12,
          mediumCount: 34,
          hardCount: 21,
        },
        {
          company: "Uber",
          count: 78,
          avgAcceptanceRate: 43.2,
          totalSubmissions: 345678,
          easyCount: 23,
          mediumCount: 34,
          hardCount: 21,
        },
      ])
    } finally {
      setStatsLoading(false)
    }
  }

  const getTimeUntilContest = (startTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const diff = start.getTime() - now.getTime()

    if (diff <= 0) return "Starting soon"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const getExploreCards = (): ExploreCard[] => {
    const topicMap = topicStats.reduce((acc, topic) => {
    acc[topic.topic.toLowerCase()] = topic;
    return acc;
  }, {} as Record<string, TopicStats>);

  const cards = [
      {
        title: "Array",
        description: "Master array manipulation and algorithms",
        problems: topicMap["array"]?.count || 0,
        difficulty: "Easy to Hard",
        color: "from-blue-500 via-blue-600 to-indigo-600",
        icon: <Target className="h-6 w-6" />,
        filter: "Array",
      },
      {
        title: "Dynamic Programming",
        description: "Solve complex optimization problems",
        problems: topicMap["dynamic programming"]?.count || 0,
        difficulty: "Medium to Hard",
        color: "from-purple-500 via-violet-600 to-purple-700",
        icon: <Zap className="h-6 w-6" />,
        filter: "Dynamic Programming",
      },
      {
        title: "Trees & Graphs",
        description: "Navigate through data structures",
        problems: (topicMap["tree"]?.count || 0) + (topicMap["graph"]?.count || 0),
        difficulty: "Easy to Hard",
        color: "from-emerald-500 via-green-600 to-teal-600",
        icon: <BookOpen className="h-6 w-6" />,
        filter: "Tree,Graph",
      },
      {
        title: "String",
        description: "String manipulation and pattern matching",
        problems: topicMap["string"]?.count || 0,
        difficulty: "Easy to Medium",
        color: "from-orange-500 via-amber-600 to-yellow-600",
        icon: <Code className="h-6 w-6" />,
        filter: "String",
      },
      {
        title: "Hash Table",
        description: "Efficient data lookup and storage",
        problems: topicMap["hash table"]?.count || 0,
        difficulty: "Easy to Hard",
        color: "from-teal-500 via-cyan-600 to-blue-600",
        icon: <Trophy className="h-6 w-6" />,
        filter: "Hash Table",
      },
      {
        title: "Two Pointers",
        description: "Optimize array and string problems",
        problems: topicMap["two pointers"]?.count || 0,
        difficulty: "Easy to Medium",
        color: "from-pink-500 via-rose-600 to-red-600",
        icon: <TrendingUp className="h-6 w-6" />,
        filter: "Two Pointers",
      },
      {
        title: "Binary Search",
        description: "Efficient searching algorithms",
        problems: topicMap["binary search"]?.count || 0,
        difficulty: "Medium to Hard",
        color: "from-indigo-500 via-purple-600 to-violet-600",
        icon: <Star className="h-6 w-6" />,
        filter: "Binary Search",
      },
    ]

    console.log('🗺️ Topic Map:', topicMap);
  console.log('🎴 Explore Cards:', cards);

  return cards;
  }

  const getCompanies = () => {
    const companyMap = companyStats.reduce(
      (acc, company) => {
        acc[company.company] = company
        return acc
      },
      {} as Record<string, CompanyStats>,
    )

    const companyConfigs = [
      {
        name: "Netflix",
        logo: "https://images.pexels.com/photos/265685/pexels-photo-265685.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
        color: "from-red-600 via-red-700 to-red-800",
        bgGradient: "from-red-50 to-red-100",
        darkBgGradient: "from-red-900/20 to-red-800/20",
        borderColor: "border-red-200",
        darkBorderColor: "border-red-700/30",
        textColor: "text-red-700",
        darkTextColor: "text-red-300",
      },
      {
        name: "Google",
        logo: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
        color: "from-blue-500 via-red-500 to-yellow-500",
        bgGradient: "from-blue-50 to-red-50",
        darkBgGradient: "from-blue-900/20 to-red-900/20",
        borderColor: "border-blue-200",
        darkBorderColor: "border-blue-700/30",
        textColor: "text-blue-700",
        darkTextColor: "text-blue-300",
      },
      {
        name: "Amazon",
        logo: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
        color: "from-orange-500 via-amber-500 to-yellow-500",
        bgGradient: "from-orange-50 to-amber-50",
        darkBgGradient: "from-orange-900/20 to-amber-900/20",
        borderColor: "border-orange-200",
        darkBorderColor: "border-orange-700/30",
        textColor: "text-orange-700",
        darkTextColor: "text-orange-300",
      },
      {
        name: "Microsoft",
        logo: "https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
        color: "from-blue-600 via-cyan-500 to-teal-500",
        bgGradient: "from-blue-50 to-cyan-50",
        darkBgGradient: "from-blue-900/20 to-cyan-900/20",
        borderColor: "border-blue-200",
        darkBorderColor: "border-blue-700/30",
        textColor: "text-blue-700",
        darkTextColor: "text-blue-300",
      },
      {
        name: "Apple",
        logo: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400&h=300",
        color: "from-gray-600 via-slate-600 to-gray-700",
        bgGradient: "from-gray-50 to-slate-50",
        darkBgGradient: "from-gray-800/20 to-slate-800/20",
        borderColor: "border-gray-200",
        darkBorderColor: "border-gray-700/30",
        textColor: "text-gray-700",
        darkTextColor: "text-gray-300",
      },
      {
        name: "Meta",
        logo: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
        color: "from-blue-600 via-indigo-600 to-purple-600",
        bgGradient: "from-blue-50 to-purple-50",
        darkBgGradient: "from-blue-900/20 to-purple-900/20",
        borderColor: "border-blue-200",
        darkBorderColor: "border-blue-700/30",
        textColor: "text-blue-700",
        darkTextColor: "text-blue-300",
      },
      {
        name: "Tesla",
        logo: "https://images.pexels.com/photos/35967/mini-cooper-auto-model-vehicle.jpg?auto=compress&cs=tinysrgb&w=400&h=300",
        color: "from-red-500 via-pink-500 to-rose-500",
        bgGradient: "from-red-50 to-pink-50",
        darkBgGradient: "from-red-900/20 to-pink-900/20",
        borderColor: "border-red-200",
        darkBorderColor: "border-red-700/30",
        textColor: "text-red-700",
        darkTextColor: "text-red-300",
      },
      {
        name: "Uber",
        logo: "https://images.pexels.com/photos/97075/pexels-photo-97075.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
        color: "from-gray-900 via-gray-800 to-black",
        bgGradient: "from-gray-50 to-gray-100",
        darkBgGradient: "from-gray-800/20 to-gray-900/20",
        borderColor: "border-gray-200",
        darkBorderColor: "border-gray-700/30",
        textColor: "text-gray-700",
        darkTextColor: "text-gray-300",
      },
    ]

    return companyConfigs.map((config) => ({
      ...config,
      stats: companyMap[config.name] || {
        company: config.name,
        count: 0,
        avgAcceptanceRate: 0,
        totalSubmissions: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
      },
    }))
  }

  const getTopCompanies = () => {
    const companyMap = companyStats.reduce((acc, company) => {
      acc[company.company] = company
      return acc
    }, {} as Record<string, CompanyStats>)

    const topCompanyConfigs = [
      { name: "Google", icon: "🏢", color: "from-blue-600 to-red-500" },
      { name: "Microsoft", icon: "💻", color: "from-blue-600 to-cyan-500" },
      { name: "Amazon", icon: "📦", color: "from-orange-500 to-yellow-500" },
      { name: "Apple", icon: "🍎", color: "from-gray-800 to-gray-600" },
      { name: "Meta", icon: "👥", color: "from-blue-600 to-purple-600" },
      { name: "Netflix", icon: "🎬", color: "from-red-600 to-black" }
    ]

    return topCompanyConfigs.map((config) => ({
      ...config,
      count: companyMap[config.name]?.count || 0,
    }))
  }

  const quickStats = [
    {
      label: "Problems Solved",
      value: user ? `${user.stats?.problemsSolved?.total || 0} problems` : "Sign In to Check",
      icon: <Code className="h-5 w-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Total Submissions",
      value: user ? `${user.stats?.totalSubmissions + user.stats?.correctSubmissions || 0} submissions` : "Start Now",
      icon: <Star className="h-5 w-5" />,
      color: "from-purple-500 to-pink-500",
    },
  ]

  const exploreCards = getExploreCards()
  const companies = getCompanies()
  const topCompanies = getTopCompanies()

  // Show loading spinner only if we're in the initial loading state and don't know auth status yet
  const isInitialLoading = authLoading && user === null && !localStorage.getItem('token');
  
  if (isInitialLoading) {
  return(
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

  // Responsive logic for gap and text
  const getResponsiveSettings = () => {
    if (typeof window === 'undefined') return { gapClass: '', dynamicText: dynamicText, buttonGap: '' };
    const width = window.innerWidth;
    if (width >= 768 && width <= 1023) {
      return { gapClass: 'mt-8', dynamicText: dynamicText, buttonGap: 'mt-8' };
    }
    if (width >= 1024 && width <= 1460) {
      return { gapClass: '', dynamicText: 'Coding', buttonGap: '' };
    }
    return { gapClass: '', dynamicText: dynamicText, buttonGap: '' };
  }

  return (
    <div
      className={`h-screen overflow-y-auto transition-colors duration-300 relative ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
          : "bg-white"
      }`}
    >
      {/* Beautiful Falling White Balls Animation for Dark Mode */}


      {/* Beautiful Light Mode Animations */}

      
      {/* Hero Section with Enhanced Carousel */}
      {/* Hero Section with Enhanced Carousel */}
      <div className="relative overflow-hidden min-h-screen">
        {isDark && !isMobile() ? (
          <StarsBackground />
        ) : (
          <>
            {/* Fixed Background for Light Mode - White with floating elements */}
            <div className={isDark ? "absolute inset-0 bg-black" : "absolute inset-0 bg-white"}></div>
          </>
        )}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
        {/* Enhanced floating elements for both modes */}
        

        {/* Subtle overlay for better text readability - only for dark mode */}
        {isDark && <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 subtle-wave"></div>}

        {/* Enhanced Animated background elements */}
        

  <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 pb-0 pt-0 sm:pt-6 md:pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-screen">
            {/* Left Content */}
            <div className="z-10 space-y-8 card-animate-in">
              <div className="space-y-3">
                <h1 className={`text-5xl md:text-8xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} leading-[1.2] relative elegant-float ${getResponsiveSettings().gapClass}`}>
                  <span className="relative inline-block premium-text-wave">
                    Master
                  </span>
                  <span className="block pb-3 relative overflow-hidden leading-[1.25]">
                    <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent gradient-text-shift font-extrabold relative">
                      {getResponsiveSettings().dynamicText}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent text-shimmer"></div>
                    </span>
                  </span>
                  <span className="block text-4xl md:text-5xl mt-2 relative">
                    <span className="premium-text-wave">Like Never Before</span>
                  </span>
                </h1>

                <p className={`text-xl md:text-2xl ${isDark ? 'text-white/90' : 'text-gray-700'} leading-relaxed max-w-2xl card-animate-in`} style={{ animationDelay: '0.2s' }}>
                  Join thousands of developers mastering coding skills through our comprehensive platform featuring
                  <span className={`font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-600'} animate-pulse`}> interactive problems</span>,
                  <span className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-600'} animate-pulse`} style={{ animationDelay: '0.5s' }}> live contests</span>, and
                  <span className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'} animate-pulse`} style={{ animationDelay: '1s' }}> real-time battles</span>.
                </p>
              </div>

              {!user ? (
                <div className={`flex flex-col sm:flex-row gap-4 card-animate-in ${getResponsiveSettings().buttonGap}`} style={{ animationDelay: '0.4s' }}>
                  <Link
                    to="/register"
                    className={`group relative overflow-hidden ${isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'} px-8 py-4 rounded-2xl font-bold transition-all duration-300 inline-flex items-center justify-center shadow-2xl ${isDark ? 'hover:shadow-white/25' : 'hover:shadow-blue-500/25'} hover:scale-105 magnetic-hover`}
                  >
                    <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10' : 'bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100'} transition-opacity duration-300 gradient-animate`}></div>
                    <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    
                    {/* Button glow effect */}
                    <div className={`absolute inset-0 rounded-2xl ${isDark ? 'bg-gradient-to-r from-blue-400/50 to-purple-400/50' : 'bg-gradient-to-r from-blue-300/30 to-purple-300/30'} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`}></div>
                  </Link>
                  <Link
                    to="/problems"
                    className={`group ${isDark ? 'border-2 border-white/50 text-white hover:bg-white hover:text-gray-900' : 'border-2 border-gray-900/50 text-gray-900 hover:bg-gray-900 hover:text-white'} px-8 py-4 rounded-2xl font-bold transition-all duration-300 inline-flex items-center justify-center backdrop-blur-sm hover:scale-105 magnetic-hover`}
                  >
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Explore Problems
                    
                    {/* Border glow effect */}
                    <div className={`absolute inset-0 rounded-2xl ${isDark ? 'border-2 border-white/70' : 'border-2 border-gray-900/70'} opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300`}></div>
                  </Link>
                </div>
              ) : (
                <div className={`flex flex-col sm:flex-row gap-4 card-animate-in ${getResponsiveSettings().buttonGap}`} style={{ animationDelay: '0.4s' }}>
                  <Link
                    to="/problems"
                    className={`group relative overflow-hidden ${isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'} px-8 py-4 rounded-2xl font-bold transition-all duration-300 inline-flex items-center justify-center shadow-2xl ${isDark ? 'hover:shadow-white/25' : 'hover:shadow-blue-500/25'} hover:scale-105 magnetic-hover`}
                  >
                    <Brain className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    Continue Learning
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    
                    {/* Button glow effect */}
                    <div className={`absolute inset-0 rounded-2xl ${isDark ? 'bg-gradient-to-r from-blue-400/50 to-purple-400/50' : 'bg-gradient-to-r from-blue-300/30 to-purple-300/30'} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`}></div>
                  </Link>
                  <Link
                    to="/contest"
                    className={`group ${isDark ? 'border-2 border-white/50 text-white hover:bg-white hover:text-gray-900' : 'border-2 border-gray-900/50 text-gray-900 hover:bg-gray-900 hover:text-white'} px-8 py-4 rounded-2xl font-bold transition-all duration-300 inline-flex items-center justify-center backdrop-blur-sm hover:scale-105 magnetic-hover`}
                  >
                    <Trophy className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    Join Contest
                    
                    {/* Border glow effect */}
                    <div className={`absolute inset-0 rounded-2xl ${isDark ? 'border-2 border-white/70' : 'border-2 border-gray-900/70'} opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300`}></div>
                  </Link>
                </div>
              )}
            </div>

            {/* Right Carousel */}
              {/* Right Carousel: Only show on devices >= 768px */}
              <div className="relative card-animate-in hidden md:block" style={{ animationDelay: '0.6s' }}>
                <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm border border-white/20">
                  {carouselItems.map((item, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-95"
                      }`}
                    >
                      <div className="relative h-full">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent gradient-animate"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                          <h3 className="text-3xl font-bold mb-3 text-red-180 text-glow-effect">
                            {item.title}
                          </h3>
                          <p className="text-white/90 mb-4 text-lg leading-relaxed">{item.description}</p>
                          <div className="flex flex-wrap gap-3">
                            {item.features.map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30 hover:scale-105 transition-transform duration-300"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Carousel Indicators */}
                <div className="flex justify-center mt-6 space-x-3">
                  {carouselItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentSlide ? "w-8 h-3 bg-white shadow-lg" : "w-3 h-3 bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>

                {/* Enhanced Quick Stats */}
                <div className="mt-8">
                  <div className="grid grid-cols-2 gap-4">
                    {quickStats.map((stat, index) => (
                      <div
                        key={index}
                        className={`group relative overflow-hidden ${
                          isDark 
                            ? "bg-white/10 hover:bg-white/20" 
                            : "bg-white/80 hover:bg-white shadow-lg hover:shadow-xl border border-gray-200/50 hover:border-gray-300"
                        } backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:scale-105`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                        ></div>
                        <div className="relative">
                          <div className={`flex items-center mb-3 ${isDark ? "text-white" : "text-gray-800"}`}>
                            <div className={`p-2 ${
                              isDark ? "bg-white/20" : "bg-white/80"
                            } rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300`}>
                              {stat.icon}
                            </div>
                            <span className={`text-sm font-medium ${isDark ? "text-white/90" : "text-gray-700"}`}>{stat.label}</span>
                          </div>
                          <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} group-hover:scale-105 transition-transform duration-300`}>
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Enhanced Explore Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Master Every
                <span className={`bg-gradient-to-r ${
                  isDark 
                    ? "from-blue-600 via-purple-600 to-pink-600" 
                    : "from-blue-500 via-purple-500 to-pink-500"
                } bg-clip-text text-transparent`}>
                  {" "}
                  Algorithm
                </span>
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Discover curated problem sets and learning paths designed to take you from beginner to expert
              </p>
            </div>          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 pb-4" style={{ width: "max-content" }}>
              {exploreCards.map((card, index) => (
                <Link
                  key={index}
                  to={`/problems?tags=${encodeURIComponent(card.filter)}`}
                  className={`group relative overflow-hidden rounded-3xl transition-all duration-500 flex-shrink-0 w-80 h-72 md:h-80 hover:scale-105 hover:shadow-2xl ${
                    isDark
                      ? "bg-gray-800/50 border-2 border-white/30 hover:bg-gray-800/80 hover:border-white/50"
                      : "bg-white/90 border-2 border-gray-200/60 hover:bg-white hover:border-gray-300/80 shadow-lg hover:shadow-xl"
                  } backdrop-blur-sm`}
                >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 ${
                    isDark ? "group-hover:opacity-20" : "group-hover:opacity-15"
                  } transition-all duration-500`}
                ></div>                  <div className="relative p-8 h-full flex flex-col justify-between">
                    <div>
                      <div
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                      >
                        {card.icon}
                      </div>
                      <h3
                        className={`text-xl font-bold mb-3 transition-all duration-300 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {card.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        {card.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {statsLoading ? "..." : card.problems.toLocaleString()}
                        </div>
                        <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>problems</div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${card.color} text-white shadow-lg`}
                      >
                        {card.difficulty}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>



        {/* Enhanced Announcements & Contests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Announcements */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Latest Announcements
              </h2>
              <Link
                to="/announcements"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm hover:underline"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p>Loading announcements...</p>
                </div>
              ) : announcements.length > 0 ? (
                announcements.slice(0, 3).map((announcement) => (
                  <Link
                    key={announcement._id}
                    to={`/announcements/${announcement._id}`}
                    className={`group relative overflow-hidden p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] block ${
                      isDark
                        ? "bg-gradient-to-r from-orange-900/20 to-red-900/20 border-2 border-white/20 hover:bg-orange-900/30 hover:border-white/40"
                        : "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-black/20 hover:bg-orange-100 hover:border-black/40"
                    } border-l-4 border-l-orange-500 hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${
                              announcement.priority === "high"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : announcement.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-green-500/20 text-green-400 border border-green-500/30"
                            }`}
                          >
                            {announcement.type}
                          </span>
                          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4
                          className={`font-bold mb-2 group-hover:text-orange-600 transition-colors line-clamp-1 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {announcement.title}
                        </h4>

                        <p
                          className={`text-sm mb-2 leading-relaxed line-clamp-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {announcement.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            By {announcement.createdBy?.username || "Admin"}
                          </span>
                          <span className="text-orange-600 text-sm font-medium group-hover:underline">Read more →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      isDark ? "bg-gray-700" : "bg-white border border-gray-200"
                    }`}
                  >
                    <BookOpen className={`h-8 w-8 ${isDark ? "text-gray-400" : "text-gray-400"}`} />
                  </div>
                  <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>No announcements yet</p>
                </div>
              )}

              {announcements.length > 3 && (
                <div className="text-center pt-4">
                  <Link
                    to="/announcements"
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm hover:underline"
                  >
                    View all announcements
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Contests */}
          <div
            className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-300 ${
              isDark ? "bg-gray-800/50 border-2 border-white/30 hover:border-white/50" : "bg-white border-2 border-black/30 hover:border-black/50"
            } backdrop-blur-sm hover:shadow-2xl`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Upcoming Contests
                  </h3>
                  <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Compete with developers worldwide</p>
                </div>
                <Link to="/contest" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                  View all
                </Link>
              </div>

              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p>Loading contests...</p>
                  </div>
                ) : contests.length > 0 ? (
                  contests.map((contest) => (
                    <Link
                      key={contest._id}
                      to="/contest"
                      className={`group relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                        isDark
                          ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-2 border-white/20 hover:border-white/40"
                          : "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-black/20 hover:bg-blue-100 hover:border-black/40"
                      } hover:shadow-lg block`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4
                            className={`font-bold mb-2 group-hover:text-blue-600 transition-colors ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {contest.name}
                          </h4>
                          <p className={`text-sm mb-4 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {contest.description}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-blue-600 mb-1">
                            {getTimeUntilContest(contest.startTime)}
                          </div>
                          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>remaining</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className={`flex items-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className={`flex items-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          <Users className="h-4 w-4 mr-2" />
                          <span>{contest.participants.length} registered</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        isDark ? "bg-gray-700" : "bg-white border border-gray-200"
                      }`}
                    >
                      <Trophy className={`h-10 w-10 ${isDark ? "text-gray-400" : "text-gray-400"}`} />
                    </div>
                    <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>No upcoming contests</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

          <MarqueeLogos />
          

        {/* Enhanced Company Interview Practice */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-12 mb-20 ${
            isDark ? "bg-gray-800/50 border-2 border-white/30" : "bg-white border-2 border-black/30"
          } backdrop-blur-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-cyan-500/5"></div>
          <div className="relative">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                Practice by
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {" "}
                  Company
                </span>
              </h2>
              <p className={`text-lg sm:text-xl max-w-3xl mx-auto px-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Prepare for interviews at top tech companies with curated problem sets and real interview questions
              </p>
            </div>

            {/* Responsive slider - smaller cards on mobile */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 sm:gap-8 pb-4" style={{ width: "max-content" }}>
                {companies.map((company, index) => (
                  <Link
                    key={index}
                    to={`/company/${encodeURIComponent(company.name)}`}
                    className={`group relative overflow-hidden rounded-3xl transition-all duration-500 flex-shrink-0 w-64 sm:w-80 h-96 sm:h-[480px] hover:scale-105 hover:shadow-2xl ${
                      isDark
                        ? `bg-gradient-to-br ${company.darkBgGradient} border-2 border-white/30 hover:bg-gray-800/80 hover:border-white/50`
                        : `bg-gradient-to-br ${company.bgGradient} border-2 border-black/30 hover:bg-gray-50 hover:border-black/50`
                    } backdrop-blur-sm`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${company.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    ></div>

                    <div className="relative h-full flex flex-col">
                      {/* Company Logo Section */}
                      <div className="h-32 sm:h-48 overflow-hidden rounded-t-3xl relative">
                        <img
                          src={company.logo || "/placeholder.svg"}
                          alt={company.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                        {/* Company Badge */}
                        <div className="absolute top-4 left-4">
                          <div
                            className={`flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${company.textColor}`}
                          >
                            <Building2 className="h-3 w-3 mr-1" />
                            {company.name}
                          </div>
                        </div>

                        {/* Stats Badge */}
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {Number(company.stats.avgAcceptanceRate).toFixed(2)}% avg
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <h3
                            className={`text-2xl font-bold mb-3 transition-all duration-300 ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {company.name}
                          </h3>
                          <p className={`text-sm mb-6 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            Master {company.name} interview questions with our curated problem collection and real
                            interview experiences.
                          </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="space-y-4">
                          {/* Problem Count */}
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              Total Problems
                            </span>
                            <span
                              className={`text-2xl font-bold ${company.textColor} ${isDark ? company.darkTextColor : ""}`}
                            >
                              {statsLoading ? "..." : company.stats.count.toLocaleString()}
                            </span>
                          </div>

                          {/* Difficulty Breakdown */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span className={isDark ? "text-gray-300" : "text-gray-600"}>Easy</span>
                              </div>
                              <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                {company.stats.easyCount}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                <span className={isDark ? "text-gray-300" : "text-gray-600"}>Medium</span>
                              </div>
                              <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                {company.stats.mediumCount}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                <span className={isDark ? "text-gray-300" : "text-gray-600"}>Hard</span>
                              </div>
                              <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                {company.stats.hardCount}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className={`w-full rounded-full h-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                              <div
                                className={`bg-gradient-to-r ${company.color} h-2 rounded-full transition-all duration-1000 group-hover:w-full`}
                                style={{ width: `${Math.min(company.stats.avgAcceptanceRate, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={isDark ? "text-gray-400" : "text-gray-500"}>Success Rate</span>
                              <span
                                className={`font-medium ${company.textColor} ${isDark ? company.darkTextColor : ""}`}
                              >
                                {company.stats.avgAcceptanceRate}%
                              </span>
                            </div>
                          </div>

                          {/* Submissions Count */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              Total Submissions
                            </span>
                            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                              {company.stats.totalSubmissions.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div
          className={`relative overflow-hidden rounded-3xl p-12 mb-20 ${
            isDark ? "bg-gray-800/50 border-2 border-white/30" : "bg-white border-2 border-black/30"
          } backdrop-blur-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="relative">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                Everything You Need to
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {" "}
                  Excel
                </span>
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Our comprehensive platform provides all the tools and resources you need to become an exceptional
                programmer
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Code className="h-8 w-8" />,
                  title: "Practice Problems",
                  description: "2000+ coding problems from easy to expert level with detailed solutions",
                  link: "/problems",
                  color: "from-orange-500 to-red-500",
                  bgColor: "from-orange-500/10 to-red-500/10",
                },
                {
                  icon: <Trophy className="h-8 w-8" />,
                  title: "Global Contests",
                  description: "Weekly contests to compete with programmers worldwide and climb rankings",
                  link: "/contest",
                  color: "from-yellow-500 to-orange-500",
                  bgColor: "from-yellow-500/10 to-orange-500/10",
                },
                {
                  icon: <Play className="h-8 w-8" />,
                  title: "Real-time Battles",
                  description: "Challenge others in live coding battles with anti-cheat protection",
                  link: "/game",
                  color: "from-green-500 to-teal-500",
                  bgColor: "from-green-500/10 to-teal-500/10",
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "Community",
                  description: "Connect with developers, share solutions, and learn together",
                  link: "/top",
                  color: "from-blue-500 to-purple-500",
                  bgColor: "from-blue-500/10 to-purple-500/10",
                },
              ].map((feature, index) => (
                <Link
                  key={index}
                  to={feature.link}
                  className={`group relative overflow-hidden p-8 rounded-3xl transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                    isDark
                      ? "bg-gray-800/50 border-2 border-white/30 hover:bg-gray-800/80 hover:border-white/50"
                      : "bg-white border-2 border-black/30 hover:bg-gray-50 hover:border-black/50"
                  } backdrop-blur-sm`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  ></div>
                  <div className="relative text-center">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                    <h3
                      className={`text-xl font-bold mb-4 transition-all duration-300 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p className={`leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      {feature.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AlgoClash
                </span>
              </div>
              <p className="text-gray-300 mb-8 max-w-md text-lg leading-relaxed">
                Master coding skills with our comprehensive platform featuring problems, contests, and real-time
                battles. Join thousands of developers improving their skills every day.
              </p>
              <div className="flex space-x-4">
                {[
                  {
                    icon: <Github className="h-6 w-6" />,
                    href: "https://github.com",
                    color: "hover:text-gray-300",
                  },
                  {
                    icon: <GoMail className="h-6 w-6" />,
                    href: "https://google.com/",
                    color: "hover:text-blue-400",
                  },
                  {
                    icon: <Linkedin className="h-6 w-6" />,
                    href: "https://www.linkedin.com",
                    color: "hover:text-blue-500",
                  },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`p-3 bg-gray-800 rounded-xl text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-gray-700`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-4">
                {[
                  { name: "Problems", href: "/problems" },
                  { name: "Contests", href: "/contest" },
                  { name: "Game Mode", href: "/game" },
                  { name: "Discussions", href: "/top" },
                  { name: "Interview Practice", href: "/interview" },
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Contact</h3>
              <ul className="space-y-4">
                {[
                  { icon: <Mail className="h-5 w-5" />, text: "group23@iiita.ac.in" },
                  { icon: <Phone className="h-5 w-5" />, text: "+91 9236518179" },
                  { icon: <MapPin className="h-5 w-5" />, text: "Prayagraj, India" },
                ].map((contact, index) => (
                  <li key={index} className="flex items-center text-gray-300 group">
                    <div className="p-2 bg-gray-800 rounded-lg mr-3 group-hover:bg-gray-700 transition-colors duration-300">
                      {contact.icon}
                    </div>
                    <span className="group-hover:text-white transition-colors duration-300">{contact.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 AlgoClash. All rights reserved. Built with ❤️ for developers.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:underline"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home;