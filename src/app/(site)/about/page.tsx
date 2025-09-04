"use client"

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Award, 
  Shield, 
  Heart, 
  Target, 
  TrendingUp, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Lightbulb,
  Clock,
  DollarSign
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';


export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [starOffset, setStarOffset] = useState(0);
  const [activeSection, setActiveSection] = useState('mission');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [myReviews, setMyReviews] = useState([]);
  const [myAvg, setMyAvg] = useState(0);

  useEffect(() => {
    // Restore user from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setUser(u);
        // Fetch reviews for this user
        fetch(`/api/reviews?userId=${encodeURIComponent(u.id || u.name)}`)
          .then(res => res.json())
          .then(data => {
            setMyReviews(data);
            setMyAvg(data.length ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0);
          });
      } else {
        setUser(null);
      }
    }
    // Parallax scroll effect for background
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setStarOffset(scrollY * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { icon: Users, value: '25 Lakh+', label: 'Happy Customers', color: 'text-blue-400' },
    { icon: Award, value: '500+', label: 'Completed Projects', color: 'text-purple-400' },
    { icon: TrendingUp, value: '₹25 Cr+', label: 'Total Earnings', color: 'text-green-400' },
    { icon: Star, value: '4.8', label: 'Average Rating', color: 'text-yellow-400' }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Every user is verified and every transaction is secure. Your safety is our top priority.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'We believe in building strong communities where everyone can thrive and grow together.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Target,
      title: 'Quality Service',
      description: 'We connect you with the best professionals who deliver exceptional results every time.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Fast & Efficient',
      description: 'Quick connections, fast payments, and efficient service delivery across India.',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const milestones = [
    { year: '2020', title: 'Founded', description: 'Started with a vision to connect India\'s talent' },
    { year: '2021', title: '10K Users', description: 'Reached our first major milestone' },
    { year: '2022', title: '₹5 Cr+', description: 'Total earnings crossed ₹5 crores' },
    { year: '2023', title: '25 Lakh+', description: 'Happy customers across India' },
    { year: '2024', title: 'Future', description: 'Expanding to every corner of India' }
  ];

  const team = [
    {
      name: 'Bhavdeep',
      role: 'CEO & Founder',
      image: '/bhv.jpg',
      description: 'Former tech executive with 15+ years experience in building scalable platforms.'
    },
    {
      name: 'Shlaisha',
      role: 'CTO',
      image: '/shl.jpg',
      description: 'Tech enthusiast with expertise in AI, ML, and building robust systems.'
    },
    {
      name: 'Aditya',
      role: 'Head of Operations',
      image: '/adi2.png',
      description: 'Operations expert ensuring smooth service delivery across all touchpoints.'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Horizontally moving wood background */}
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
      
      <Header 
        onPostTask={() => router.push('/dashboard')}
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
            setShowAuthModal(true); setAuthMode('signup');
          }
        }}
      />

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={() => setShowAuthModal(false)}
          onSignup={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      )}

      {/* (Removed navigation tabs; About Us is now in the header) */}

      <main className="section-padding">
        <div className="container">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 glass px-6 py-3 rounded-full mb-6 animate-fade-in-up">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white/80 text-sm font-medium">About GIGSLY</span>
            </div>
            <h1 className="text-6xl font-bold text-gradient mb-6 leading-tight animate-fade-in-up">
              Connecting India's
              <br />
              <span className="text-glow">Talent & Opportunity</span>
            </h1>
            <p className="text-xl text-white/70 mb-12 max-w-3xl mx-auto animate-fade-in-up">
              We're on a mission to democratize work opportunities across India, 
              making professional services accessible to everyone while empowering 
              skilled individuals to earn a living doing what they love.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="rounded-2xl p-8 text-center shadow-2xl border border-white/10 bg-white/10 backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(80,80,120,0.18)] hover:border-white/20 animate-float"
                  style={{animationDelay: `${index * 0.2}s`}}
                >
                  <stat.icon className={`w-12 h-12 ${stat.color} mx-auto mb-4`} />
                  <h3 className="text-2xl font-bold text-white mb-2 text-gradient-animated">{stat.value}</h3>
                  <p className="text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in-left">
                <h2 className="text-4xl font-bold text-gradient mb-6">Our Mission</h2>
                <p className="text-lg text-white/80 mb-6">
                  To create India's most trusted platform where anyone can find reliable 
                  professionals for any task, and skilled individuals can build successful 
                  careers by offering their expertise.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-white/80">Empower skilled professionals</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-white/80">Connect communities</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-white/80">Build trust through transparency</span>
                  </div>
                </div>
              </div>
              <div className="animate-fade-in-right">
                <div className="glass-card rounded-3xl p-8 text-center">
                  <Lightbulb className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                  <p className="text-white/80 text-lg">
                    To become the go-to platform for professional services in India, 
                    where every skill is valued and every need is met with quality and care.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gradient text-center mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div 
                  key={value.title}
                  className="glass-card rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 animate-fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-white/70">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Journey Timeline */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gradient text-center mb-12">Our Journey</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div 
                    key={milestone.year}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} animate-fade-in-up`}
                    style={{animationDelay: `${index * 0.2}s`}}
                  >
                    <div className="w-1/2 px-8">
                      <div className="glass-card rounded-2xl p-6 text-center">
                        <div className="text-3xl font-bold text-gradient mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                        <p className="text-white/70">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Timeline Dot */}
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                    
                    <div className="w-1/2 px-8"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-gradient text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div 
                  key={member.name}
                  className="glass-card rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 animate-fade-in-up"
                  style={{animationDelay: `${index * 0.2}s`}}
                >
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-white/20 shadow-lg"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-blue-400 font-medium mb-4">{member.role}</p>
                  <p className="text-white/70">{member.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-20">
            <div className="glass-card rounded-3xl p-12 text-center">
              <h2 className="text-4xl font-bold text-gradient mb-8">Get In Touch</h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                Have questions or suggestions? We'd love to hear from you. 
                Our team is here to help and support you every step of the way.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Email</h3>
                    <p className="text-white/70">hello@gigsly.com</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Phone</h3>
                    <p className="text-white/70">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Location</h3>
                    <p className="text-white/70">Mumbai, India</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => router.push('/')}
                className="btn-primary mt-8 flex items-center space-x-2 mx-auto group"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>

          {/* User Reviews Section */}
          {user && (
            <div className="glass-card p-6 mb-8">
              <h2 className="text-2xl font-bold text-gradient mb-2">Your Reviews</h2>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(myAvg) ? 'text-yellow-400 text-2xl' : 'text-white/30 text-2xl'}>★</span>
                ))}
                <span className="text-white/70 ml-2">{myReviews.length} review{myReviews.length !== 1 ? 's' : ''}</span>
              </div>
              {myReviews.length > 0 ? (
                <ul className="divide-y divide-white/10">
                  {myReviews.map(r => (
                    <li key={r.id} className="py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{r.reviewerName || r.reviewer?.name || 'User'}</span>
                        <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>
                      <div className="text-white/70 text-sm">{r.comment}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-white/60">No reviews yet.</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 