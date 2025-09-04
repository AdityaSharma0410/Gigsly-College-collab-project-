'use client'

import { useState, useMemo, useEffect } from 'react'
import Header from '@/components/Header'
import TaskFeed from '@/components/TaskFeed'
import TaskForm from '@/components/TaskForm'
import AuthModal from '@/components/AuthModal'
import { Task } from '@/types/task'
import { User, LoginFormData, SignupFormData } from '@/types/auth'
import { Sparkles, TrendingUp, Users, Award, X, Star, Briefcase, Search, User as UserIcon, MessageCircle, IndianRupee, Shield, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

// Remove all commented mock data, reviews, and unused variables

export default function Home() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [user, setUser] = useState<User | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [showContactModal, setShowContactModal] = useState(false)
  const [howItWorksMode, setHowItWorksMode] = useState<'hiring' | 'finding'>('hiring')
  // For horizontally moving star background
  const [starOffset, setStarOffset] = useState(0)
  const [location, setLocation] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    // Restore user from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            let locationName = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.county || data.address?.state || 'Your Area';
            setLocation(locationName);
          } else {
            setLocation('Your Area');
          }
        } catch {
          setLocation('Your Area');
        }
      },
      () => setLocation('Your Area')
    );
    // Fetch tasks from backend
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        setTasks([]);
      }
    };
    fetchTasks();
    // Fetch reviews for homepage
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        setReviews(data);
      } catch {
        setReviews([]);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Move background left/right as user scrolls (sideways parallax)
      const scrollY = window.scrollY
      setStarOffset(scrollY * 0.5) // Adjust multiplier for speed
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mock data for How it works section
  const howItWorksHiring = [
    {
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
      title: 'Post a Task',
      description: 'Describe what you need done. Set your budget and deadline.',
      button: {
        label: (
          <span className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Post a Task
          </span>
        ),
        onClick: () => { setShowAuthModal(true); setAuthMode('signup'); },
        className: 'btn-primary flex items-center gap-2 text-lg px-8 py-4 group hover:scale-105 transition-all duration-300'
      }
    },
    {
      image: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=600&q=80', // Group of professionals
      title: 'Browse Professionals',
      description: 'Find the perfect professional for your task. View ratings, reviews, and portfolios.',
      button: {
        label: <span className="flex items-center justify-center w-full">Browse Professionals</span>,
        onClick: () => { setShowAuthModal(true); setAuthMode('signup'); },
        className: 'btn-primary flex items-center justify-center text-lg px-8 py-4 group hover:scale-105 transition-all duration-300'
      }
    },
    {
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80', // Person reviewing documents
      title: 'Get Proposals',
      description: 'Receive bids from professionals. Compare proposals and choose the best one.',
      button: {
        label: <span className="flex items-center justify-center w-full">Get Proposals</span>,
        onClick: () => { setShowAuthModal(true); setAuthMode('signup'); },
        className: 'btn-primary flex items-center justify-center text-lg px-8 py-4 group hover:scale-105 transition-all duration-300'
      }
    }
  ]

  const howItWorksFinding = [
    {
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
      title: 'Create Your Profile',
      description: 'Build your professional profile, showcase your skills, and create a portfolio.',
      button: {
        label: <span className="flex items-center justify-center w-full">Create Profile</span>,
        onClick: () => { setShowAuthModal(true); setAuthMode('signup'); },
        className: 'btn-primary flex items-center justify-center text-lg px-8 py-4 group hover:scale-105 transition-all duration-300'
      }
    },
    {
      image: '/tasks.jpeg',
      title: 'Browse Tasks',
      description: 'Find tasks that match your skills and expertise. Apply for tasks that interest you.',
      button: {
        label: <span className="flex items-center justify-center w-full">Browse Tasks</span>,
        onClick: () => { setShowAuthModal(true); setAuthMode('signup'); },
        className: 'btn-primary flex items-center justify-center text-lg px-8 py-4 group hover:scale-105 transition-all duration-300'
      }
    },
    {
      image: '/hired.avif',
      title: 'Get Hired',
      description: 'Receive job offers and negotiate rates. Work on tasks that align with your schedule.',
      button: {
        label: <span className="flex items-center justify-center w-full">Get Hired</span>,
        onClick: () => { setShowAuthModal(true); setAuthMode('signup'); },
        className: 'btn-primary flex items-center justify-center text-lg px-8 py-4 group hover:scale-105 transition-all duration-300'
      }
    }
  ]

  // Restore categories array for filtering
  const categories = [
    'Technology',
    'Business',
    'Legal',
    'Content Writing',
    'Design',
    'Marketing',
    'Education',
    'Consulting',
    'Finance',
    'Healthcare',
    'Teaching',
    'Household Chores',
    'Home Repair',
    'Event Planning',
    'Photography',
    'Videography',
    'Fitness & Wellness',
    'Beauty & Personal Care',
    'Pet Care',
    'Gardening',
    'Transportation',
    'Delivery',
    'Tutoring',
    'Translation',
    'Writing & Editing',
    'Accounting',
    'Data Entry',
    'Virtual Assistance',
    'Cleaning',
    'Cooking & Catering',
    'Childcare',
    'Elderly Care',
    'Moving Services',
    'Car Wash & Detailing',
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Appliance Repair',
    'IT Support',
    'Web Development',
    'App Development',
    'Graphic Design',
    'Social Media Management',
    'SEO',
    'HR & Recruitment',
    'Real Estate',
    'Travel Planning',
    'Other'
  ];

  // Filtered categories for dropdown
  const filteredCategories = useMemo(() => {
    if (!categoryInput) return ['Show All', ...categories]
    return ['Show All', ...categories.filter(cat => cat.toLowerCase().includes(categoryInput.toLowerCase()))]
  }, [categoryInput])

  // Filtered tasks for display
  const filteredTasks = useMemo(() => {
    if (!categoryFilter || categoryFilter === 'Show All') return tasks
    return tasks.filter(task => task.category === categoryFilter)
  }, [tasks, categoryFilter])

  const addTask = async (newTask: Omit<Task, 'id' | 'postedAt' | 'status' | 'applications'>) => {
    if (!user) {
      alert('You must be logged in to post a task.');
      return;
    }
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, postedById: user.id }),
      });
      if (res.ok) {
        const createdTask = await res.json();
        setTasks(prev => [createdTask, ...prev]);
        setShowTaskForm(false);
      } else {
        alert('Failed to post task.');
      }
    } catch (err) {
      alert('Failed to post task.');
    }
  }

  const handleLogin = (data: LoginFormData) => {
    // Mock authentication
    const mockUser: User = {
      id: '1',
      phone: data.phone,
      name: 'John Doe',
      email: 'john@example.com',
      rating: 4.8,
      completedTasks: 25,
      totalEarnings: 250000,
      joinedAt: new Date('2023-06-01')
    }
    setUser(mockUser)
    setShowAuthModal(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(mockUser))
    }
    router.push('/feed')
  }

  const handleSignup = (data: SignupFormData) => {
    // Mock registration
    const mockUser: User = {
      id: '1',
      phone: data.phone,
      name: data.name,
      email: data.email,
      rating: 0,
      completedTasks: 0,
      totalEarnings: 0,
      joinedAt: new Date()
    }
    setUser(mockUser)
    setShowAuthModal(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(mockUser))
    }
    router.push('/feed')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Horizontally moving night sky stars background */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-[-10]"
        style={{
          backgroundImage: "url('/wood.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: `${-starOffset}px center`,
          opacity: 0.28,
          filter: 'blur(0.5px) brightness(1.3)'
        }}
      />
      {/* Removed all colored background blobs as requested */}
      <Header 
        onPostTask={() => setShowTaskForm(true)}
        onAuth={() => { setShowAuthModal(true); setAuthMode('login'); }}
        onSignup={() => { setShowAuthModal(true); setAuthMode('signup'); }}
        isAuthenticated={!!user}
        userName={user?.name}
        onAccount={() => router.push('/dashboard')}
        onLogoClick={() => user ? router.push('/feed') : router.push('/')}
        onSearch={(query) => {
          if (user) {
            router.push(`/feed?search=${encodeURIComponent(query)}`);
          } else {
            setShowAuthModal(true);
            setAuthMode('signup');
          }
        }}
      />
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
          initialMode={authMode}
        />
      )}
      
      {/* (Removed navigation tabs for Home/About Us) */}
      <div className="flex-1 flex flex-col">
        <main className="section-padding">
          <div className="container">
            {/* Hero Section with Video Background, Opaque Center, and Glowing Fading Sides */}
            <div className="relative rounded-3xl overflow-hidden mb-28 shadow-[0_0_120px_40px_rgba(30,30,30,0.85)]">
              {/* Video background */}
              <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/pic1.png"
                  className="w-full h-full object-cover object-center"
                  style={{ filter: 'blur(0.5px)' }}
                  aria-label="Hero video background"
                >
                  <source src="/vid1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              {/* Hero Content */}
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 px-8 py-16">
                {/* Left: Text */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center space-x-2 glass px-6 py-3 rounded-full mb-6">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-white/80 text-sm font-medium">Professional Services Marketplace</span>
                  </div>
                  <h1 className="text-6xl font-bold text-gradient mb-6 leading-tight">
                    Connect with
                    <br />
                    <span className="text-glow">Top Professionals</span>
                  </h1>
                  <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto md:mx-0">
                    Discover skilled professionals or showcase your expertise. 
                    Build meaningful connections and grow your business with our premium marketplace.
                  </p>
                  <div className="flex justify-center md:justify-start space-x-4 mb-12">
                    <button 
                      onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
                      className="btn-primary text-lg px-8 py-4"
                      aria-label="Get Started button"
                    >
                      Get Started
                    </button>
                    <button 
                      onClick={() => setShowContactModal(true)}
                      className="btn-secondary text-lg px-8 py-4"
                      aria-label="Contact Us button"
                    >
                      Contact Us
                    </button>
                  </div>
                  {/* Enhanced Stats with floating animations */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto md:mx-0">
                    <div className="rounded-2xl p-8 text-center shadow-2xl border border-white/10 bg-white/10 backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(80,80,120,0.18)] hover:border-white/20 animate-float">
                      <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2 text-gradient-animated">₹25 Cr+</h3>
                      <p className="text-white/60">Total Earnings</p>
                    </div>
                    <div className="rounded-2xl p-8 text-center shadow-2xl border border-white/10 bg-white/10 backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(80,80,120,0.18)] hover:border-white/20 animate-float" style={{animationDelay: '0.5s'}}>
                      <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2 text-gradient-animated">10K+</h3>
                      <p className="text-white/60">Active Professionals</p>
                    </div>
                    <div className="rounded-2xl p-8 text-center shadow-2xl border border-white/10 bg-white/10 backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(80,80,120,0.18)] hover:border-white/20 animate-float" style={{animationDelay: '1s'}}>
                      <Award className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2 text-gradient-animated">500+</h3>
                      <p className="text-white/60">Completed Projects</p>
                    </div>
                  </div>
                </div>
                {/* Right: Enhanced Illustration/Image with Glow and Fade */}
                <div className="flex-1 flex justify-center items-center">
                  <div className="w-full max-w-md text-center flex flex-col items-center justify-center animate-float">
                    <span className="block text-4xl md:text-6xl font-extrabold text-gradient-animated text-glow mb-4 mt-8 md:mt-0">
                      TRUSTED BY 25 LAKH+ CUSTOMERS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Move What We Do & How It Works Section here, above Popular Services */}
            <section className="relative mb-12 section-padding">
              {/* Multiple animated background blobs for extra glow (smaller and slower) */}
              <div className="absolute -top-16 -left-16 w-52 h-52 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 opacity-30 rounded-full blur-3xl animate-[pulse_16s_ease-in-out_infinite] z-0" />
              <div className="absolute -bottom-12 right-0 w-44 h-44 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 opacity-20 rounded-full blur-2xl animate-[pulse_18s_ease-in-out_infinite] z-0" />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-tr from-green-400 via-blue-400 to-purple-400 opacity-20 rounded-full blur-2xl animate-[pulse_20s_ease-in-out_infinite] z-0" style={{transform: 'translate(-50%, -50%)'}} />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-left drop-shadow-lg">Connecting India’s Talent with Opportunity</h2>
                <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl text-left">GIGSLY helps you find trusted professionals for any job, or earn by offering your skills. From tech to household chores, we make work easy, secure, and accessible for everyone.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center shadow-xl transition-transform hover:scale-105 hover:shadow-2xl group animate-fade-in-up">
                    <Briefcase className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="text-xl font-bold text-white mb-2">Post or Find Work</h3>
                    <p className="text-white/80">Post your task or browse hundreds of opportunities.</p>
                  </div>
                  {/* Card 2 */}
                  <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center shadow-xl transition-transform hover:scale-105 hover:shadow-2xl group animate-fade-in-up [animation-delay:0.1s]">
                    <UserIcon className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="text-xl font-bold text-white mb-2">Connect & Collaborate</h3>
                    <p className="text-white/80">Chat, compare proposals, and hire the best fit.</p>
                  </div>
                  {/* Card 3 */}
                  <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center shadow-xl transition-transform hover:scale-105 hover:shadow-2xl group animate-fade-in-up [animation-delay:0.2s]">
                    <IndianRupee className="w-12 h-12 text-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="text-xl font-bold text-white mb-2">Pay Securely</h3>
                    <p className="text-white/80">Payments are safe, fast, and in Indian Rupees (₹).</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Popular Services Section */}
            <section className="mb-12 section-padding">
              <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-14 text-left">Popular Services</h2>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Ensure each card fills half the width and has a fixed height for a perfect 2x2 grid */}
                <style jsx>{`
                  @media (min-width: 768px) {
                    .popular-service-card {
                      min-height: 260px;
                      height: 100%;
                      width: 100%;
                      display: flex;
                      flex-direction: row;
                    }
                  }
                `}</style>
                {/* Web Development */}
                <div className="glass-card popular-service-card flex flex-col md:flex-row items-center md:items-start p-8 md:p-10 hover:scale-[1.03] transition-transform text-white shadow-2xl h-[320px] md:h-[340px]">
                  <div className="relative flex-shrink-0 mb-6 md:mb-0 md:mr-10">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-60" style={{background: 'radial-gradient(circle at 60% 40%, #00fff7 0%, transparent 70%)'}} />
                    <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=80" alt="Web Development" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-4 border-white/20 shadow-[0_0_64px_8px_rgba(0,255,255,0.18)] relative z-10" aria-label="Web Development service" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="font-bold text-3xl md:text-4xl mb-2 block">Web Development</span>
                    <p className="text-white/80 text-lg md:text-xl mb-2">Build modern, responsive websites and web apps for businesses and individuals.</p>
                    <p className="text-white/60 text-base md:text-lg">E-commerce, portfolios, dashboards, and more—our developers deliver scalable, secure, and visually stunning solutions tailored to your needs.</p>
                  </div>
                </div>
                {/* Video Editing */}
                <div className="glass-card popular-service-card flex flex-col md:flex-row items-center md:items-start p-8 md:p-10 hover:scale-[1.03] transition-transform text-white shadow-2xl h-[320px] md:h-[340px]">
                  <div className="relative flex-shrink-0 mb-6 md:mb-0 md:mr-10">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-60" style={{background: 'radial-gradient(circle at 60% 40%, #c084fc 0%, transparent 70%)'}} />
                    <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80" alt="Video Editing" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-4 border-white/20 shadow-[0_0_64px_8px_rgba(192,132,252,0.18)] relative z-10" aria-label="Video Editing service" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="font-bold text-3xl md:text-4xl mb-2 block">Video Editing</span>
                    <p className="text-white/80 text-lg md:text-xl mb-2">Edit, enhance, and produce professional videos for all your creative needs.</p>
                    <p className="text-white/60 text-base md:text-lg">From YouTube content to cinematic ads, our editors use the latest tools for color grading, effects, and storytelling that captivates your audience.</p>
                  </div>
                </div>
                {/* Tutoring */}
                <div className="glass-card popular-service-card flex flex-col md:flex-row items-center md:items-start p-8 md:p-10 hover:scale-[1.03] transition-transform text-white shadow-2xl h-[320px] md:h-[340px]">
                  <div className="relative flex-shrink-0 mb-6 md:mb-0 md:mr-10">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-60" style={{background: 'radial-gradient(circle at 60% 40%, #22d3ee 0%, transparent 70%)'}} />
                    <img src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=500&q=80" alt="Tutoring" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-4 border-white/20 shadow-[0_0_64px_8px_rgba(34,211,238,0.18)] relative z-10" aria-label="Tutoring service" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="font-bold text-3xl md:text-4xl mb-2 block">Tutoring</span>
                    <p className="text-white/80 text-lg md:text-xl mb-2">Get expert help and personalized lessons in a variety of subjects and skills.</p>
                    <p className="text-white/60 text-base md:text-lg">School, college, coding, music, and more—find top-rated tutors for 1-on-1 or group sessions, online or in-person, at your convenience.</p>
                  </div>
                </div>
                {/* Content Writing */}
                <div className="glass-card popular-service-card flex flex-col md:flex-row items-center md:items-start p-8 md:p-10 hover:scale-[1.03] transition-transform text-white shadow-2xl h-[320px] md:h-[340px]">
                  <div className="relative flex-shrink-0 mb-6 md:mb-0 md:mr-10">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-60" style={{background: 'radial-gradient(circle at 60% 40%, #fde68a 0%, transparent 70%)'}} />
                    <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=500&q=80" alt="Content Writing" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-4 border-white/20 shadow-[0_0_64px_8px_rgba(253,230,138,0.18)] relative z-10" aria-label="Content Writing service" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="font-bold text-3xl md:text-4xl mb-2 block">Content Writing</span>
                    <p className="text-white/80 text-lg md:text-xl mb-2">Engage your audience with high-quality articles, blogs, and marketing copy.</p>
                    <p className="text-white/60 text-base md:text-lg">SEO blogs, website content, ad copy, and technical writing—crafted by experienced writers who understand your brand and goals.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* How it works Section */}
            <section className="mb-12 mt-8 section-padding">
              <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">How it works</h2>
                <div className="inline-flex bg-black rounded-full p-1 border border-white/20 shadow-glow">
                  <button
                    className={`px-6 py-2 rounded-full font-semibold text-base transition-all duration-200 focus:outline-none ${howItWorksMode === 'hiring' ? 'bg-white text-black shadow-[0_0_16px_2px_rgba(255,255,255,0.7)]' : 'text-white/70 hover:bg-white/10'}`}
                    onClick={() => setHowItWorksMode('hiring')}
                    aria-label="For Hiring button"
                  >
                    For Hiring
                  </button>
                  <button
                    className={`px-6 py-2 rounded-full font-semibold text-base transition-all duration-200 focus:outline-none ${howItWorksMode === 'finding' ? 'bg-white text-black shadow-[0_0_16px_2px_rgba(255,255,255,0.7)]' : 'text-white/70 hover:bg-white/10'}`}
                    onClick={() => setHowItWorksMode('finding')}
                    aria-label="For Finding Work button"
                  >
                    For Finding Work
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(howItWorksMode === 'hiring' ? howItWorksHiring : howItWorksFinding).map((step, idx) => (
                  <div key={idx} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full shadow-lg hover:scale-105 transition-transform bg-white/5 border border-white/10">
                    <div className='w-full h-56 bg-gray-800 flex items-center justify-center'>
                      <img src={step.image} alt={step.title} className="w-full h-56 object-cover object-center" onError={e => e.currentTarget.style.display='none'} aria-label={`How it works step ${idx + 1} image`} />
                    </div>
                    <div className="flex-1 flex flex-col p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-white/70 mb-4 flex-1">{step.description}</p>
                      {step.button && (
                        <button
                          className={step.button.className}
                          onClick={step.button.onClick}
                          aria-label={typeof step.button.label === 'string' ? step.button.label : undefined}
                        >
                          {step.button.label}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="mb-10 mt-8 section-padding">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-left">What our customers say</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                {reviews.length > 0 ? reviews.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="rounded-2xl p-7 flex flex-col gap-4 shadow-xl border border-white/10 bg-white/10 backdrop-blur-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                        {r.reviewerName ? r.reviewerName.split(' ').map((n: string) => n[0]).join('') : 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{r.reviewerName || 'User'}</div>
                        <div className="text-white/60 text-sm">{r.city || r.reviewerCity || ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-500'}>★</span>
                      ))}
                      <span className="ml-2 text-white/70 text-sm font-medium">{r.rating?.toFixed ? r.rating.toFixed(1) : r.rating}</span>
                    </div>
                    <div className="text-white/80 text-base">{r.comment || r.review}</div>
                  </div>
                )) : (
                  <div className="text-white/60 col-span-3">No reviews yet.</div>
                )}
              </div>
              <button className="btn-primary px-8 py-3 text-lg" onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }} aria-label="Add a Review button">Add a Review</button>
            </section>
          </div>
        </main>
        <Footer />
        {/* Modals */}
        {showTaskForm && (
          <TaskForm 
            onSubmit={addTask}
            onClose={() => setShowTaskForm(false)}
            defaultLocation={location || ''}
          />
        )}

        {showContactModal && (
          <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="p-8 flex flex-col items-center">
                <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => setShowContactModal(false)}><X className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold text-gradient mb-2">Contact Us</h2>
                <p className="text-white/80 mb-4">For any queries or support, reach out to us:</p>
                <div className="text-white/70 text-lg mb-2">Email: <a href="mailto:help@giglsy.com" className="underline">help@giglsy.com</a></div>
                <div className="text-white/70 text-lg mb-2">Phone 1: <a href="tel:+911234567890" className="underline">+91 12345 67890</a></div>
                <div className="text-white/70 text-lg mb-2">Phone 2: <a href="tel:+919876543210" className="underline">+91 98765 43210</a></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 