"use client"

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Users, Award, LogOut, Settings, Wallet, List, Plus, Shield, HelpCircle, X, Eye, CheckCircle, Loader2 } from "lucide-react";
import TaskForm from '@/components/TaskForm'
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

// Remove mock user and tasks for our local development
// const mockUser = {...};
// const mockTasks = [...];

// Prepare for backend integration
const mockUser = null;
const mockTasks = [];

const taskTabs = [
  { key: "posted", label: "Posted" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posted");
  const [filter, setFilter] = useState("");
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(null); // task object or null
  const [showCompleteDialog, setShowCompleteDialog] = useState(null); // task object or null
  const [tabLoading, setTabLoading] = useState(false);
  // Add starOffset for parallax background
  const [starOffset, setStarOffset] = useState(0);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawOtp, setWithdrawOtp] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawStep, setWithdrawStep] = useState<'password' | 'otp' | 'method' | null>(null);
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [location, setLocation] = useState<string>('');
  const [withdrawOtpSent, setWithdrawOtpSent] = useState(false);
  const [withdrawOtpVerified, setWithdrawOtpVerified] = useState(false);
  const [withdrawOtpError, setWithdrawOtpError] = useState('');
  const [sendingWithdrawOtp, setSendingWithdrawOtp] = useState(false);
  const [verifyingWithdrawOtp, setVerifyingWithdrawOtp] = useState(false);
  const [applicationsByTask, setApplicationsByTask] = useState({});
  const [showApplicationsForTask, setShowApplicationsForTask] = useState(null);
  const [reviewsByTask, setReviewsByTask] = useState({});
  const [reviewInputs, setReviewInputs] = useState({});
  const [submittingReview, setSubmittingReview] = useState(false);
  // Replace with API call in backend integration
  // useEffect(() => { fetchUser().then(setUser); fetchTasks().then(setTasks); }, []);
  useEffect(() => {
    // Restore user from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    }
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
  }, []);

  useEffect(() => {
    if (activeTab === 'posted' && user) {
      // Fetch applications for all posted tasks
      const fetchApplications = async () => {
        const postedTaskIds = tasks.filter(t => t.status === 'posted' && t.postedById === user.id).map(t => t.id);
        const appsByTask = {};
        for (const taskId of postedTaskIds) {
          try {
            const res = await fetch(`/api/applications?taskId=${taskId}`);
            if (res.ok) {
              const data = await res.json();
              appsByTask[taskId] = data;
            } else {
              appsByTask[taskId] = [];
            }
          } catch {
            appsByTask[taskId] = [];
          }
        }
        setApplicationsByTask(appsByTask);
      };
      fetchApplications();
    }
  }, [activeTab, user, tasks]);

  useEffect(() => {
    if (activeTab === 'completed' && user) {
      // Fetch reviews for all completed tasks
      const fetchReviews = async () => {
        const completedTaskIds = tasks.filter(t => t.status === 'completed' && (t.postedById === user.id || t.acceptedById === user.id)).map(t => t.id);
        const revsByTask = {};
        for (const taskId of completedTaskIds) {
          try {
            const res = await fetch(`/api/reviews?taskId=${taskId}`);
            if (res.ok) {
              const data = await res.json();
              revsByTask[taskId] = data;
            } else {
              revsByTask[taskId] = [];
            }
          } catch {
            revsByTask[taskId] = [];
          }
        }
        setReviewsByTask(revsByTask);
      };
      fetchReviews();
    }
  }, [activeTab, user, tasks]);

  // Simulate loading when switching tabs
  const handleTabSwitch = (tab) => {
    setTabLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTabLoading(false);
    }, 600);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.status === activeTab &&
      (filter === "" || task.category.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleSendWithdrawOtp = async () => {
    if (user?.phone) {
      setSendingWithdrawOtp(true);
      setWithdrawOtpError('');
      try {
        const res = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: user.phone }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setWithdrawOtpSent(true);
          setWithdrawOtpError('');
        } else {
          setWithdrawOtpError(data.error || 'Failed to send OTP');
        }
      } catch (err) {
        setWithdrawOtpError('Failed to send OTP');
      }
      setSendingWithdrawOtp(false);
    }
  };

  const handleVerifyWithdrawOtp = async () => {
    if (withdrawOtp.length === 6 && user?.phone) {
      setVerifyingWithdrawOtp(true);
      setWithdrawOtpError('');
      try {
        const res = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: user.phone, otp: withdrawOtp }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setWithdrawOtpVerified(true);
          setWithdrawOtpError('');
        } else {
          setWithdrawOtpError(data.error || 'Invalid OTP');
        }
      } catch (err) {
        setWithdrawOtpError('Failed to verify OTP');
      }
      setVerifyingWithdrawOtp(false);
    }
  };

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ name: '', email: '', phone: '' });
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileError, setEditProfileError] = useState('');
  const [editProfileSuccess, setEditProfileSuccess] = useState('');

  function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
  }
  function validateEmail(email) {
    return !email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  const handleEditProfileSave = async () => {
    if (!editProfileData.name.trim()) {
      setEditProfileError('Name is required');
      return;
    }
    if (!validatePhone(editProfileData.phone)) {
      setEditProfileError('Enter a valid 10-digit phone number');
      return;
    }
    if (!validateEmail(editProfileData.email)) {
      setEditProfileError('Enter a valid email address');
      return;
    }
    setEditProfileError('');
    setEditProfileLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          ...editProfileData,
        }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        setShowEditProfile(false);
        setEditProfileSuccess('Profile updated successfully!');
      } else {
        const errorData = await res.json();
        setEditProfileError(errorData.error || 'Failed to update profile.');
      }
    } catch {
      setEditProfileError('Failed to update profile.');
    }
    setEditProfileLoading(false);
  };

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
        onPostTask={() => setShowTaskModal(true)}
        onAuth={() => router.push('/')}
        onSignup={() => router.push('/')}
        isAuthenticated={!!user}
        userName={user?.name}
        onAccount={() => router.push('/dashboard')}
        onLogoClick={() => router.push('/feed')}
        onSearch={(query) => router.push(`/feed?search=${encodeURIComponent(query)}`)}
      />
      {/* Enhanced Dashboard Sections */}
      <div className="section-padding">
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Profile Overview */}
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 border-4 border-white/20 mb-4 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/80">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user?.name || 'User'}</h2>
            <p className="text-white/60 text-sm mb-2">{user?.email || 'user@email.com'}</p>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-white/80 font-medium">{user?.rating || '4.8'}</span>
            </div>
            <p className="text-white/70 text-xs mb-4">"Delivering quality work, every time!"</p>
            <button className="btn-secondary w-full" onClick={() => {
              setEditProfileData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
              setShowEditProfile(true);
            }}>Edit Profile</button>
          </div>
          {/* Recent Activity */}
          <div className="glass-card p-6 col-span-2">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-400" /> Recent Activity</h3>
            <ul className="divide-y divide-white/10">
              <li className="py-3 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white/80">Completed task <b>"Cook me food"</b></span>
                <span className="ml-auto text-xs text-white/40">2 hours ago</span>
              </li>
              <li className="py-3 flex items-center gap-3">
                <Plus className="w-5 h-5 text-blue-400" />
                <span className="text-white/80">Posted new task <b>"Fix my leaking tap"</b></span>
                <span className="ml-auto text-xs text-white/40">Today</span>
              </li>
              <li className="py-3 flex items-center gap-3">
                <Wallet className="w-5 h-5 text-purple-400" />
                <span className="text-white/80">Withdrew <b>₹2,000</b> to bank</span>
                <span className="ml-auto text-xs text-white/40">Yesterday</span>
              </li>
              <li className="py-3 flex items-center gap-3">
                <Shield className="w-5 h-5 text-yellow-400" />
                <span className="text-white/80">Enabled 2FA for account security</span>
                <span className="ml-auto text-xs text-white/40">2 days ago</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Security/Account Status */}
          <div className="glass-card p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-yellow-400" /> Account Security</h3>
            <div className="flex items-center gap-2 text-white/80"><CheckCircle className="w-4 h-4 text-green-400" /> Email Verified</div>
            <div className="flex items-center gap-2 text-white/80"><CheckCircle className="w-4 h-4 text-green-400" /> 2FA Enabled</div>
            <div className="flex items-center gap-2 text-white/80"><Eye className="w-4 h-4 text-blue-400" /> Last login: 2 hours ago</div>
            <button className="btn-secondary mt-3">Manage Security</button>
          </div>
          {/* Help & Support */}
          <div className="glass-card p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-400" /> Need Help?</h3>
            <p className="text-white/70 text-sm">Check our <a href="#" className="text-blue-400 underline">FAQ</a> or <a href="#" className="text-blue-400 underline">contact support</a> for assistance.</p>
            <button className="btn-primary mt-3">Contact Support</button>
          </div>
        </div>
        {/* Main dashboard content */}
        <div className="container">
          {/* Welcome & Quick Stats */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gradient mb-2 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                Welcome, {user?.name || 'User'}!
              </h1>
              <p className="text-white/70 text-lg mb-2">Ready to get things done or earn by helping others?</p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="glass-card px-6 py-4 flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-float">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <span className="font-bold text-white text-lg text-gradient-animated">₹{user?.totalEarnings?.toLocaleString("en-IN") || '0'}</span>
                  <span className="text-white/60 text-sm">Earnings</span>
                </div>
                <div className="glass-card px-6 py-4 flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-float" style={{animationDelay: '0.3s'}}>
                  <Users className="w-6 h-6 text-blue-400" />
                  <span className="font-bold text-white text-lg text-gradient-animated">{user?.completedTasks || 0}</span>
                  <span className="text-white/60 text-sm">Completed</span>
                </div>
                <div className="glass-card px-6 py-4 flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-float" style={{animationDelay: '0.6s'}}>
                  <List className="w-6 h-6 text-purple-400" />
                  <span className="font-bold text-white text-lg text-gradient-animated">{user?.postedTasks || 0}</span>
                  <span className="text-white/60 text-sm">Posted</span>
                </div>
                <div className="glass-card px-6 py-4 flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-float" style={{animationDelay: '0.9s'}}>
                  <Award className="w-6 h-6 text-yellow-400" />
                  <span className="font-bold text-white text-lg text-gradient-animated">{user?.rating || 0}</span>
                  <span className="text-white/60 text-sm">Rating</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center md:items-end">
              <button className="btn-primary flex items-center gap-2 text-lg px-8 py-4 group hover:scale-105 transition-all duration-300" onClick={() => setShowTaskModal(true)}>
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Post a Task
              </button>
              <button className="btn-secondary flex items-center gap-2 text-lg px-8 py-4 group hover:scale-105 transition-all duration-300" onClick={() => { setShowWithdrawModal(true); setWithdrawStep('password'); }}>
                <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" /> Withdraw Earnings
              </button>
            </div>
          </div>

          {/* Post a Task Modal */}
          {showTaskModal && (
            <TaskForm 
              onSubmit={() => { setShowTaskModal(false); setShowSuccessDialog(true); }} 
              onClose={() => setShowTaskModal(false)} 
              defaultLocation={location || ''}
            />
          )}
          {/* Success Dialog for Task Post */}
          {showSuccessDialog && (
            <div className="modal-overlay" onClick={() => setShowSuccessDialog(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold text-gradient mb-2">Task Posted!</h2>
                  <p className="text-white/80 mb-4">Your task has been posted successfully.</p>
                  <button className="btn-primary px-8 py-3" onClick={() => setShowSuccessDialog(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
          {/* Withdraw Earnings Modal - Step 1: Password */}
          {showWithdrawModal && withdrawStep === 'password' && (
            <div className="modal-overlay" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); }}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex flex-col items-center">
                  <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); }}><X className="w-6 h-6" /></button>
                  <Wallet className="w-12 h-12 text-green-400 mb-4" />
                  <h2 className="text-2xl font-bold text-gradient mb-2">Withdraw Earnings</h2>
                  <p className="text-white/70 mb-4">Enter your password to continue.</p>
                  <input
                    className="input-field mb-3"
                    type="password"
                    placeholder="Enter your password"
                    value={withdrawPassword}
                    onChange={e => setWithdrawPassword(e.target.value)}
                  />
                  {withdrawError && <div className="text-red-400 text-sm mb-2">{withdrawError}</div>}
                  <button
                    className="btn-primary px-8 py-3 mt-2"
                    onClick={() => {
                      if (!withdrawPassword) {
                        setWithdrawError("Please enter your password.");
                        return;
                      }
                      setWithdrawError("");
                      setWithdrawStep('otp');
                    }}
                    disabled={!withdrawPassword}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Withdraw Earnings Modal - Step 2: OTP */}
          {showWithdrawModal && withdrawStep === 'otp' && (
            <div className="modal-overlay" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); setWithdrawAccount(''); setWithdrawUpi(''); }}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex flex-col items-center">
                  <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); setWithdrawAccount(''); setWithdrawUpi(''); }}><X className="w-6 h-6" /></button>
                  <Wallet className="w-12 h-12 text-green-400 mb-4" />
                  <h2 className="text-2xl font-bold text-gradient mb-2">Verify OTP</h2>
                  <p className="text-white/70 mb-4">Enter the OTP sent to your phone.</p>
                  <div className="flex gap-2 items-center w-full">
                    <input
                      className="input-field flex-1 border-2 border-blue-400 focus:border-blue-600 text-lg tracking-widest text-center"
                      type="text"
                      placeholder="Enter OTP"
                      value={withdrawOtp}
                      onChange={e => setWithdrawOtp(e.target.value)}
                      maxLength={6}
                      disabled={withdrawOtpVerified}
                    />
                    <button
                      className={`btn-primary px-4 py-2 ${verifyingWithdrawOtp ? 'opacity-60 cursor-wait' : ''}`}
                      onClick={handleVerifyWithdrawOtp}
                      disabled={withdrawOtp.length !== 6 || verifyingWithdrawOtp || withdrawOtpVerified}
                    >
                      {withdrawOtpVerified ? 'Verified' : verifyingWithdrawOtp ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                  {withdrawOtpSent && !withdrawOtpVerified && (
                    <div className="text-blue-400 text-xs mt-2">OTP sent to your phone</div>
                  )}
                  {withdrawOtpVerified && (
                    <div className="text-green-400 text-xs mt-2 flex items-center gap-1">OTP verified <CheckCircle className="inline w-4 h-4" /></div>
                  )}
                  {withdrawOtpError && (
                    <div className="text-red-400 text-xs mt-2 flex items-center gap-1">{withdrawOtpError} <X className="inline w-4 h-4" /></div>
                  )}
                  <button
                    className="btn-secondary mt-4"
                    onClick={handleSendWithdrawOtp}
                    disabled={sendingWithdrawOtp || withdrawOtpSent}
                  >
                    {sendingWithdrawOtp ? 'Sending...' : withdrawOtpSent ? 'OTP Sent' : 'Send OTP'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Withdraw Earnings Modal - Step 3: Choose Method */}
          {showWithdrawModal && withdrawStep === 'method' && (
            <div className="modal-overlay" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); setWithdrawAccount(''); setWithdrawUpi(''); }}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex flex-col items-center">
                  <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); setWithdrawAccount(''); setWithdrawUpi(''); }}><X className="w-6 h-6" /></button>
                  <Wallet className="w-12 h-12 text-green-400 mb-4" />
                  <h2 className="text-2xl font-bold text-gradient mb-2">Withdrawal Method</h2>
                  <p className="text-white/70 mb-4">Choose how you want to receive your funds.</p>
                  <input
                    className="input-field mb-3"
                    type="text"
                    placeholder="Enter Account Number"
                    value={withdrawAccount}
                    onChange={e => setWithdrawAccount(e.target.value)}
                  />
                  <div className="text-white/60 mb-2">or</div>
                  <input
                    className="input-field mb-3"
                    type="text"
                    placeholder="Enter UPI ID"
                    value={withdrawUpi}
                    onChange={e => setWithdrawUpi(e.target.value)}
                  />
                  {withdrawError && <div className="text-red-400 text-sm mb-2">{withdrawError}</div>}
                  <button
                    className="btn-primary px-8 py-3 mt-2"
                    onClick={() => {
                      if (!withdrawAccount && !withdrawUpi) {
                        setWithdrawError("Please enter either Account Number or UPI ID.");
                        return;
                      }
                      setWithdrawError("");
                      setShowWithdrawModal(false);
                      setShowWithdrawSuccess(true);
                      setWithdrawPassword("");
                      setWithdrawOtp("");
                      setWithdrawAccount("");
                      setWithdrawUpi("");
                      setWithdrawStep(null);
                    }}
                    disabled={!withdrawAccount && !withdrawUpi}
                  >
                    Withdraw Now
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Withdraw Success Dialog */}
          {showWithdrawSuccess && (
            <div className="modal-overlay" onClick={() => setShowWithdrawSuccess(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold text-gradient mb-2">Withdrawal Successful!</h2>
                  <p className="text-white/80 mb-4">Your earnings have been withdrawn.</p>
                  <button className="btn-primary px-8 py-3" onClick={() => setShowWithdrawSuccess(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
          {/* Settings Modal */}
          {showSettings && (
            <div className="modal-overlay" onClick={() => setShowSettings(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex flex-col gap-4">
                  <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => setShowSettings(false)}><X className="w-6 h-6" /></button>
                  <h2 className="text-2xl font-bold text-gradient mb-2">Account Settings</h2>
                  <input className="input-field" placeholder="Name" defaultValue={user?.name} />
                  <input className="input-field" placeholder="Email" defaultValue={user?.email} />
                  <input className="input-field" placeholder="Phone" defaultValue={user?.phone} />
                  <button className="btn-primary mt-4">Save Changes</button>
                </div>
              </div>
            </div>
          )}
          {/* Logout Confirmation Dialog */}
          {showLogout && (
            <div className="modal-overlay" onClick={() => setShowLogout(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex flex-col items-center">
                  <LogOut className="w-12 h-12 text-red-400 mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold text-gradient mb-2">Confirm Logout</h2>
                  <p className="text-white/80 mb-4">Are you sure you want to logout?</p>
                  <div className="flex gap-4">
                    <button className="btn-secondary px-8 py-3" onClick={() => setShowLogout(false)}>Cancel</button>
                    <button className="btn-primary px-8 py-3" onClick={() => {
                      setShowLogout(false);
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('user');
                      }
                      setUser(null);
                      router.push('/');
                    }}>Logout</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Task Details Dialog */}
          {showTaskDetails && (
            <div className="modal-overlay" onClick={() => setShowTaskDetails(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex flex-col gap-4">
                  <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => setShowTaskDetails(null)}><X className="w-6 h-6" /></button>
                  <h2 className="text-2xl font-bold text-gradient mb-2">Task Details</h2>
                  <div className="text-white/80"><b>Title:</b> {showTaskDetails.title}</div>
                  <div className="text-white/80"><b>Description:</b> {showTaskDetails.description}</div>
                  <div className="text-white/80"><b>Category:</b> {showTaskDetails.category}</div>
                  <div className="text-white/80"><b>Location:</b> {showTaskDetails.location}</div>
                  <div className="text-white/80"><b>Budget:</b> ₹{showTaskDetails.price}</div>
                  <button className="btn-secondary mt-4" onClick={() => setShowTaskDetails(null)}>Close</button>
                </div>
              </div>
            </div>
          )}
          {/* Complete/Accept Task Dialog */}
          {showCompleteDialog && (
            <div className="modal-overlay" onClick={() => setShowCompleteDialog(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-blue-400 mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold text-gradient mb-2">{activeTab === 'posted' ? 'Mark as Completed' : 'Accept Task'}</h2>
                  <p className="text-white/80 mb-4">Are you sure you want to {activeTab === 'posted' ? 'mark this task as completed' : 'accept this task'}?</p>
                  <div className="flex gap-4">
                    <button className="btn-secondary px-8 py-3" onClick={() => setShowCompleteDialog(null)}>Cancel</button>
                    <button className="btn-primary px-8 py-3" onClick={() => setShowCompleteDialog(null)}>{activeTab === 'posted' ? 'Mark Completed' : 'Accept'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task Feed & My Tasks */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div className="flex gap-2">
                {taskTabs.map((tab) => (
                  <button
                    key={tab.key}
                    className={`px-6 py-2 rounded-full font-bold text-lg transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" : "glass-card text-white/70"}`}
                    onClick={() => handleTabSwitch(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Filter by category (e.g. Cooking, Tutoring...)"
                className="input-field max-w-xs"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            {tabLoading ? (
              <div className="w-full flex justify-center items-center py-16">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTasks.length === 0 ? (
                  <div className="col-span-full text-center text-white/60 py-12 text-xl animate-float">No tasks found in this category.</div>
                ) : (
                  filteredTasks.map((task, index) => (
                    <div key={task.id} className="glass-card p-6 flex flex-col gap-2 hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg text-gradient-animated">{task.title}</span>
                        <span className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-glow">{task.category}</span>
                      </div>
                      <p className="text-white/80 mb-2">{task.description}</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <span className="text-green-400 font-bold text-lg text-gradient-animated">₹{task.price}</span>
                        <span className="text-white/60 text-sm">{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="btn-secondary flex items-center gap-2 px-4 py-2" onClick={() => setShowTaskDetails(task)}><Eye className="w-4 h-4" /> View Details</button>
                        <button className="btn-primary flex items-center gap-2 px-4 py-2" onClick={() => setShowCompleteDialog(task)}><CheckCircle className="w-4 h-4" />{activeTab === 'posted' ? 'Mark as Completed' : 'Accept Task'}</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Posted Tasks with Applications */}
          {activeTab === 'posted' && filteredTasks.length > 0 && (
            <div className="space-y-6">
              {filteredTasks.map(task => (
                <div key={task.id} className="glass-card p-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-bold text-lg text-white">{task.title}</div>
                      <div className="text-white/60 text-sm">{task.category} • {task.location} • ₹{task.budget}</div>
                    </div>
                    <button className="btn-secondary" onClick={() => setShowApplicationsForTask(showApplicationsForTask === task.id ? null : task.id)}>
                      {showApplicationsForTask === task.id ? 'Hide Applications' : 'View Applications'}
                    </button>
                  </div>
                  {showApplicationsForTask === task.id && (
                    <div className="mt-4">
                      <div className="font-semibold text-white mb-2">Applications:</div>
                      {applicationsByTask[task.id] && applicationsByTask[task.id].length > 0 ? (
                        <ul className="divide-y divide-white/10">
                          {applicationsByTask[task.id].map(app => (
                            <li key={app.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <div className="text-white font-medium">{app.userName || app.user?.name || 'Applicant'}</div>
                                <div className="text-white/70 text-sm">{app.message}</div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-green-400 font-bold">₹{app.bid}</div>
                                <div className="text-white/60 text-xs">{app.status || 'Pending'}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-white/60">No applications yet.</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Completed Tasks with Reviews */}
          {activeTab === 'completed' && filteredTasks.length > 0 && (
            <div className="space-y-6">
              {filteredTasks.map(task => (
                <div key={task.id} className="glass-card p-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-bold text-lg text-white">{task.title}</div>
                      <div className="text-white/60 text-sm">{task.category} • {task.location} • ₹{task.budget}</div>
                    </div>
                  </div>
                  {/* Reviews Section */}
                  <div className="mt-4">
                    <div className="font-semibold text-white mb-2">Reviews:</div>
                    {reviewsByTask[task.id] && reviewsByTask[task.id].length > 0 ? (
                      <ul className="divide-y divide-white/10 mb-4">
                        {reviewsByTask[task.id].map(review => (
                          <li key={review.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <div className="text-white font-medium">{review.reviewerName || review.reviewer?.name || 'User'}</div>
                              <div className="flex items-center text-yellow-400 text-xs mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                ))}
                              </div>
                              <div className="text-white/70 text-sm">{review.comment}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-white/60 mb-4">No reviews yet.</div>
                    )}
                    {/* Review Submission Form */}
                    {!reviewsByTask[task.id] || !reviewsByTask[task.id].some(r => r.reviewerId === user.id) ? (
                      <form className="space-y-3" onSubmit={async e => {
                        e.preventDefault();
                        setSubmittingReview(true);
                        const { rating = 5, comment = '' } = reviewInputs[task.id] || {};
                        try {
                          const res = await fetch('/api/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              rating: Number(rating),
                              comment,
                              reviewerId: user.id,
                              taskId: task.id,
                            }),
                          });
                          if (res.ok) {
                            // Refresh reviews
                            const reviewsRes = await fetch(`/api/reviews?taskId=${task.id}`);
                            const reviews = await reviewsRes.json();
                            setReviewsByTask(prev => ({ ...prev, [task.id]: reviews }));
                            setReviewInputs(prev => ({ ...prev, [task.id]: { rating: 5, comment: '' } }));
                          } else {
                            alert('Failed to submit review.');
                          }
                        } catch {
                          alert('Failed to submit review.');
                        }
                        setSubmittingReview(false);
                      }}>
                        <div className="flex items-center gap-2">
                          <label className="text-white/80">Your Rating:</label>
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className={`text-2xl ${((reviewInputs[task.id]?.rating || 5) >= star) ? 'text-yellow-400' : 'text-white/30'}`}
                              onClick={e => {
                                e.preventDefault();
                                setReviewInputs(prev => ({ ...prev, [task.id]: { ...prev[task.id], rating: star } }));
                              }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="input-field w-full"
                          placeholder="Write a review..."
                          value={reviewInputs[task.id]?.comment || ''}
                          onChange={e => setReviewInputs(prev => ({ ...prev, [task.id]: { ...prev[task.id], comment: e.target.value } }))}
                          rows={2}
                          required
                        />
                        <button type="submit" className="btn-primary px-6 py-2" disabled={submittingReview}>
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    ) : (
                      <div className="text-green-400">You have reviewed this task.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trust & Safety, Community */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="glass-card p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-7 h-7 text-blue-400" />
                <span className="font-bold text-xl text-white">Trust & Safety</span>
              </div>
              <ul className="text-white/70 text-base list-disc list-inside ml-2">
                <li>All users are verified for a safer experience.</li>
                <li>Report suspicious or inappropriate tasks easily.</li>
                <li>Ratings and reviews help you choose the right person.</li>
                <li>Secure payments and dispute resolution.</li>
              </ul>
            </div>
            <div className="glass-card p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="w-7 h-7 text-yellow-400" />
                <span className="font-bold text-xl text-white">Community & Support</span>
              </div>
              <ul className="text-white/70 text-base list-disc list-inside ml-2">
                <li>24/7 help center and live chat support.</li>
                <li>FAQs and guides for new users.</li>
                <li>Join our community forum to connect and share tips.</li>
                <li>Contact us for any assistance or feedback.</li>
              </ul>
            </div>
          </div>

          {/* Settings & Logout */}
          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <button className="btn-secondary flex items-center gap-2 px-6 py-3" onClick={() => setShowSettings(true)}>
              <Settings className="w-5 h-5" /> Account Settings
            </button>
            <button className="btn-secondary flex items-center gap-2 px-6 py-3" onClick={() => setShowLogout(true)}>
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </div>
      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col gap-4">
              <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => setShowEditProfile(false)}><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold text-gradient mb-2">Edit Profile</h2>
              <input
                className="input-field"
                placeholder="Name"
                value={editProfileData.name}
                onChange={e => setEditProfileData(d => ({ ...d, name: e.target.value }))}
              />
              <input
                className="input-field"
                placeholder="Email"
                value={editProfileData.email}
                onChange={e => setEditProfileData(d => ({ ...d, email: e.target.value }))}
              />
              <input
                className="input-field"
                placeholder="Phone"
                value={editProfileData.phone}
                onChange={e => setEditProfileData(d => ({ ...d, phone: e.target.value }))}
              />
              <button
                className="btn-primary mt-4"
                disabled={editProfileLoading}
                onClick={handleEditProfileSave}
              >{editProfileLoading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Error/Success Feedback for Edit Profile */}
      {editProfileError && (
        <div className="mb-4 px-4 py-2 rounded text-sm font-medium bg-red-500/20 text-red-300" aria-live="polite">{editProfileError}</div>
      )}
      {editProfileSuccess && (
        <div className="mb-4 px-4 py-2 rounded text-sm font-medium bg-green-500/20 text-green-300" aria-live="polite">{editProfileSuccess}</div>
      )}
      {/* Withdraw Earnings Modal - Step 1: Password */}
      {showWithdrawModal && withdrawStep === 'password' && (
        <div className="modal-overlay" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col items-center">
              <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); }}><X className="w-6 h-6" /></button>
              <Wallet className="w-12 h-12 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold text-gradient mb-2">Withdraw Earnings</h2>
              <p className="text-white/70 mb-4">Enter your password to continue.</p>
              <input
                className="input-field mb-3"
                type="password"
                placeholder="Enter your password"
                value={withdrawPassword}
                onChange={e => setWithdrawPassword(e.target.value)}
              />
              {withdrawError && <div className="text-red-400 text-sm mb-2">{withdrawError}</div>}
              <button
                className="btn-primary px-8 py-3 mt-2"
                onClick={() => {
                  if (!withdrawPassword) {
                    setWithdrawError("Please enter your password.");
                    return;
                  }
                  setWithdrawError("");
                  setWithdrawStep('otp');
                }}
                disabled={!withdrawPassword}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Withdraw Earnings Modal - Step 2: OTP */}
      {showWithdrawModal && withdrawStep === 'otp' && (
        <div className="modal-overlay" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); setWithdrawAccount(''); setWithdrawUpi(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col items-center">
              <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); setWithdrawAccount(''); setWithdrawUpi(''); }}><X className="w-6 h-6" /></button>
              <Wallet className="w-12 h-12 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold text-gradient mb-2">Verify OTP</h2>
              <p className="text-white/70 mb-4">Enter the OTP sent to your phone.</p>
              <div className="flex gap-2 items-center w-full">
                <input
                  className="input-field flex-1 border-2 border-blue-400 focus:border-blue-600 text-lg tracking-widest text-center"
                  type="text"
                  placeholder="Enter OTP"
                  value={withdrawOtp}
                  onChange={e => setWithdrawOtp(e.target.value)}
                  maxLength={6}
                  disabled={withdrawOtpVerified}
                />
                <button
                  className={`btn-primary px-4 py-2 ${verifyingWithdrawOtp ? 'opacity-60 cursor-wait' : ''}`}
                  onClick={handleVerifyWithdrawOtp}
                  disabled={withdrawOtp.length !== 6 || verifyingWithdrawOtp || withdrawOtpVerified}
                >
                  {withdrawOtpVerified ? 'Verified' : verifyingWithdrawOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
              {withdrawOtpSent && !withdrawOtpVerified && (
                <div className="text-blue-400 text-xs mt-2">OTP sent to your phone</div>
              )}
              {withdrawOtpVerified && (
                <div className="text-green-400 text-xs mt-2 flex items-center gap-1">OTP verified <CheckCircle className="inline w-4 h-4" /></div>
              )}
              {withdrawOtpError && (
                <div className="text-red-400 text-xs mt-2 flex items-center gap-1">{withdrawOtpError} <X className="inline w-4 h-4" /></div>
              )}
              <button
                className="btn-secondary mt-4"
                onClick={handleSendWithdrawOtp}
                disabled={sendingWithdrawOtp || withdrawOtpSent}
              >
                {sendingWithdrawOtp ? 'Sending...' : withdrawOtpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Withdraw Earnings Modal - Step 3: Choose Method */}
      {showWithdrawModal && withdrawStep === 'method' && (
        <div className="modal-overlay" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); setWithdrawAccount(''); setWithdrawUpi(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col items-center">
              <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => { setShowWithdrawModal(false); setWithdrawStep(null); setWithdrawPassword(''); setWithdrawOtp(''); setWithdrawError(''); setWithdrawAccount(''); setWithdrawUpi(''); }}><X className="w-6 h-6" /></button>
              <Wallet className="w-12 h-12 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold text-gradient mb-2">Withdrawal Method</h2>
              <p className="text-white/70 mb-4">Choose how you want to receive your funds.</p>
              <input
                className="input-field mb-3"
                type="text"
                placeholder="Enter Account Number"
                value={withdrawAccount}
                onChange={e => setWithdrawAccount(e.target.value)}
              />
              <div className="text-white/60 mb-2">or</div>
              <input
                className="input-field mb-3"
                type="text"
                placeholder="Enter UPI ID"
                value={withdrawUpi}
                onChange={e => setWithdrawUpi(e.target.value)}
              />
              {withdrawError && <div className="text-red-400 text-sm mb-2">{withdrawError}</div>}
              <button
                className="btn-primary px-8 py-3 mt-2"
                onClick={() => {
                  if (!withdrawAccount && !withdrawUpi) {
                    setWithdrawError("Please enter either Account Number or UPI ID.");
                    return;
                  }
                  setWithdrawError("");
                  setShowWithdrawModal(false);
                  setShowWithdrawSuccess(true);
                  setWithdrawPassword("");
                  setWithdrawOtp("");
                  setWithdrawAccount("");
                  setWithdrawUpi("");
                  setWithdrawStep(null);
                }}
                disabled={!withdrawAccount && !withdrawUpi}
              >
                Withdraw Now
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Withdraw Success Dialog */}
      {showWithdrawSuccess && (
        <div className="modal-overlay" onClick={() => setShowWithdrawSuccess(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-400 mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-gradient mb-2">Withdrawal Successful!</h2>
              <p className="text-white/80 mb-4">Your earnings have been withdrawn.</p>
              <button className="btn-primary px-8 py-3" onClick={() => setShowWithdrawSuccess(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Error/Success Feedback for Withdrawals */}
      {withdrawError && (
        <div className="mb-4 px-4 py-2 rounded text-sm font-medium bg-red-500/20 text-red-300" aria-live="polite">{withdrawError}</div>
      )}
      {withdrawSuccess && (
        <div className="mb-4 px-4 py-2 rounded text-sm font-medium bg-green-500/20 text-green-300" aria-live="polite">{withdrawSuccess}</div>
      )}
      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col gap-4">
              <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => setShowSettings(false)}><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold text-gradient mb-2">Account Settings</h2>
              <input className="input-field" placeholder="Name" defaultValue={user?.name} />
              <input className="input-field" placeholder="Email" defaultValue={user?.email} />
              <input className="input-field" placeholder="Phone" defaultValue={user?.phone} />
              <button className="btn-primary mt-4">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {/* Logout Confirmation Dialog */}
      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col items-center">
              <LogOut className="w-12 h-12 text-red-400 mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-gradient mb-2">Confirm Logout</h2>
              <p className="text-white/80 mb-4">Are you sure you want to logout?</p>
              <div className="flex gap-4">
                <button className="btn-secondary px-8 py-3" onClick={() => setShowLogout(false)}>Cancel</button>
                <button className="btn-primary px-8 py-3" onClick={() => {
                  setShowLogout(false);
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('user');
                  }
                  setUser(null);
                  router.push('/');
                }}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Task Details Dialog */}
      {showTaskDetails && (
        <div className="modal-overlay" onClick={() => setShowTaskDetails(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col gap-4">
              <button className="self-end mb-4 text-white/60 hover:text-white" onClick={() => setShowTaskDetails(null)}><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold text-gradient mb-2">Task Details</h2>
              <div className="text-white/80"><b>Title:</b> {showTaskDetails.title}</div>
              <div className="text-white/80"><b>Description:</b> {showTaskDetails.description}</div>
              <div className="text-white/80"><b>Category:</b> {showTaskDetails.category}</div>
              <div className="text-white/80"><b>Location:</b> {showTaskDetails.location}</div>
              <div className="text-white/80"><b>Budget:</b> ₹{showTaskDetails.price}</div>
              <button className="btn-secondary mt-4" onClick={() => setShowTaskDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Complete/Accept Task Dialog */}
      {showCompleteDialog && (
        <div className="modal-overlay" onClick={() => setShowCompleteDialog(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-blue-400 mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-gradient mb-2">{activeTab === 'posted' ? 'Mark as Completed' : 'Accept Task'}</h2>
              <p className="text-white/80 mb-4">Are you sure you want to {activeTab === 'posted' ? 'mark this task as completed' : 'accept this task'}?</p>
              <div className="flex gap-4">
                <button className="btn-secondary px-8 py-3" onClick={() => setShowCompleteDialog(null)}>Cancel</button>
                <button className="btn-primary px-8 py-3" onClick={() => setShowCompleteDialog(null)}>{activeTab === 'posted' ? 'Mark Completed' : 'Accept'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Feed & My Tasks */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex gap-2">
            {taskTabs.map((tab) => (
              <button
                key={tab.key}
                className={`px-6 py-2 rounded-full font-bold text-lg transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" : "glass-card text-white/70"}`}
                onClick={() => handleTabSwitch(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Filter by category (e.g. Cooking, Tutoring...)"
            className="input-field max-w-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        {tabLoading ? (
          <div className="w-full flex justify-center items-center py-16">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full text-center text-white/60 py-12 text-xl animate-float">No tasks found in this category.</div>
            ) : (
              filteredTasks.map((task, index) => (
                <div key={task.id} className="glass-card p-6 flex flex-col gap-2 hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gradient-animated">{task.title}</span>
                    <span className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-glow">{task.category}</span>
                  </div>
                  <p className="text-white/80 mb-2">{task.description}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <span className="text-green-400 font-bold text-lg text-gradient-animated">₹{task.price}</span>
                    <span className="text-white/60 text-sm">{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="btn-secondary flex items-center gap-2 px-4 py-2" onClick={() => setShowTaskDetails(task)}><Eye className="w-4 h-4" /> View Details</button>
                    <button className="btn-primary flex items-center gap-2 px-4 py-2" onClick={() => setShowCompleteDialog(task)}><CheckCircle className="w-4 h-4" />{activeTab === 'posted' ? 'Mark as Completed' : 'Accept Task'}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Posted Tasks with Applications */}
      {activeTab === 'posted' && filteredTasks.length > 0 && (
        <div className="space-y-6">
          {filteredTasks.map(task => (
            <div key={task.id} className="glass-card p-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-lg text-white">{task.title}</div>
                  <div className="text-white/60 text-sm">{task.category} • {task.location} • ₹{task.budget}</div>
                </div>
                <button className="btn-secondary" onClick={() => setShowApplicationsForTask(showApplicationsForTask === task.id ? null : task.id)}>
                  {showApplicationsForTask === task.id ? 'Hide Applications' : 'View Applications'}
                </button>
              </div>
              {showApplicationsForTask === task.id && (
                <div className="mt-4">
                  <div className="font-semibold text-white mb-2">Applications:</div>
                  {applicationsByTask[task.id] && applicationsByTask[task.id].length > 0 ? (
                    <ul className="divide-y divide-white/10">
                      {applicationsByTask[task.id].map(app => (
                        <li key={app.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div className="text-white font-medium">{app.userName || app.user?.name || 'Applicant'}</div>
                            <div className="text-white/70 text-sm">{app.message}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-green-400 font-bold">₹{app.bid}</div>
                            <div className="text-white/60 text-xs">{app.status || 'Pending'}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-white/60">No applications yet.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completed Tasks with Reviews */}
      {activeTab === 'completed' && filteredTasks.length > 0 && (
        <div className="space-y-6">
          {filteredTasks.map(task => (
            <div key={task.id} className="glass-card p-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-lg text-white">{task.title}</div>
                  <div className="text-white/60 text-sm">{task.category} • {task.location} • ₹{task.budget}</div>
                </div>
              </div>
              {/* Reviews Section */}
              <div className="mt-4">
                <div className="font-semibold text-white mb-2">Reviews:</div>
                {reviewsByTask[task.id] && reviewsByTask[task.id].length > 0 ? (
                  <ul className="divide-y divide-white/10 mb-4">
                    {reviewsByTask[task.id].map(review => (
                      <li key={review.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="text-white font-medium">{review.reviewerName || review.reviewer?.name || 'User'}</div>
                          <div className="flex items-center text-yellow-400 text-xs mb-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                          <div className="text-white/70 text-sm">{review.comment}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-white/60 mb-4">No reviews yet.</div>
                )}
                {/* Review Submission Form */}
                {!reviewsByTask[task.id] || !reviewsByTask[task.id].some(r => r.reviewerId === user.id) ? (
                  <form className="space-y-3" onSubmit={async e => {
                    e.preventDefault();
                    setSubmittingReview(true);
                    const { rating = 5, comment = '' } = reviewInputs[task.id] || {};
                    try {
                      const res = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          rating: Number(rating),
                          comment,
                          reviewerId: user.id,
                          taskId: task.id,
                        }),
                      });
                      if (res.ok) {
                        // Refresh reviews
                        const reviewsRes = await fetch(`/api/reviews?taskId=${task.id}`);
                        const reviews = await reviewsRes.json();
                        setReviewsByTask(prev => ({ ...prev, [task.id]: reviews }));
                        setReviewInputs(prev => ({ ...prev, [task.id]: { rating: 5, comment: '' } }));
                      } else {
                        alert('Failed to submit review.');
                      }
                    } catch {
                      alert('Failed to submit review.');
                    }
                    setSubmittingReview(false);
                  }}>
                    <div className="flex items-center gap-2">
                      <label className="text-white/80">Your Rating:</label>
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`text-2xl ${((reviewInputs[task.id]?.rating || 5) >= star) ? 'text-yellow-400' : 'text-white/30'}`}
                          onClick={e => {
                            e.preventDefault();
                            setReviewInputs(prev => ({ ...prev, [task.id]: { ...prev[task.id], rating: star } }));
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="input-field w-full"
                      placeholder="Write a review..."
                      value={reviewInputs[task.id]?.comment || ''}
                      onChange={e => setReviewInputs(prev => ({ ...prev, [task.id]: { ...prev[task.id], comment: e.target.value } }))}
                      rows={2}
                      required
                    />
                    <button type="submit" className="btn-primary px-6 py-2" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="text-green-400">You have reviewed this task.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trust & Safety, Community */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="glass-card p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-7 h-7 text-blue-400" />
            <span className="font-bold text-xl text-white">Trust & Safety</span>
          </div>
          <ul className="text-white/70 text-base list-disc list-inside ml-2">
            <li>All users are verified for a safer experience.</li>
            <li>Report suspicious or inappropriate tasks easily.</li>
            <li>Ratings and reviews help you choose the right person.</li>
            <li>Secure payments and dispute resolution.</li>
          </ul>
        </div>
        <div className="glass-card p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-7 h-7 text-yellow-400" />
            <span className="font-bold text-xl text-white">Community & Support</span>
          </div>
          <ul className="text-white/70 text-base list-disc list-inside ml-2">
            <li>24/7 help center and live chat support.</li>
            <li>FAQs and guides for new users.</li>
            <li>Join our community forum to connect and share tips.</li>
            <li>Contact us for any assistance or feedback.</li>
          </ul>
        </div>
      </div>

      {/* Settings & Logout */}
      <div className="flex flex-col md:flex-row gap-4 justify-end">
        <button className="btn-secondary flex items-center gap-2 px-6 py-3" onClick={() => setShowSettings(true)}>
          <Settings className="w-5 h-5" /> Account Settings
        </button>
        <button className="btn-secondary flex items-center gap-2 px-6 py-3" onClick={() => setShowLogout(true)}>
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  </div>