import { Plus, Search, User, Menu, Bell } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onPostTask: () => void
  onAuth: () => void
  isAuthenticated: boolean
  userName?: string
  onSignup?: () => void
  onAccount?: () => void
  onLogoClick?: () => void
  onSearch?: (query: string) => void
}

export default function Header({ onPostTask, onAuth, isAuthenticated, userName, onSignup, onAccount, onLogoClick, onSearch }: HeaderProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        setNotificationsError('Failed to fetch notifications');
      }
    } catch {
      setNotificationsError('Failed to fetch notifications');
    }
    setNotificationsLoading(false);
  };

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const services = [
    'Web Development',
    'App Development',
    'IT Support',
    'Graphic Design',
    'Video Editing',
    'Photography',
    'Videography',
    'Content Writing',
    'Writing & Editing',
    'SEO',
    'Social Media Management',
    'Marketing',
    'Business',
    'HR & Recruitment',
    'Finance',
    'Accounting',
    'Data Entry',
    'Virtual Assistance',
    'Legal',
    'Education',
    'Tutoring',
    'Teaching',
    'Consulting',
    'Translation',
    'Event Planning',
    'Real Estate',
    'Travel Planning',
    'Fitness & Wellness',
    'Beauty & Personal Care',
    'Pet Care',
    'Gardening',
    'Household Chores',
    'Home Repair',
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Appliance Repair',
    'Cleaning',
    'Cooking & Catering',
    'Childcare',
    'Elderly Care',
    'Moving Services',
    'Car Wash & Detailing',
    'Transportation',
    'Delivery',
    'Errands',
    'Other'
  ]
  const filteredServices = useMemo(() => {
    if (!searchInput) return services
    return services.filter(service => service.toLowerCase().includes(searchInput.toLowerCase()))
  }, [searchInput])

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Don't close if clicking on the bell button or inside notifications container
      if (!target.closest('.notifications-container') && !target.closest('.bell-button')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch {}
  };

  return (
    <header className="glass sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo with Animation */}
          <button 
            onClick={onLogoClick}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-black border border-white/30 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow" style={{boxShadow: '0 0 16px 4px rgba(255,255,255,0.25)'}}>
                <span className="text-white font-extrabold text-xl tracking-widest text-glow animate-pulse-slow">G</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gradient-animated tracking-widest">GIGSLY</h1>
              <p className="text-xs text-white/60 font-medium">Professional Services</p>
            </div>
          </button>

          {/* Enhanced Search Combobox */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (searchInput.trim() && onSearch) {
                  onSearch(searchInput.trim());
                  setSearchInput('');
                }
              }}>
                <input
                  type="text"
                  placeholder="Search for professional services..."
                  className={`input-field pr-12 transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-blue-400/50 shadow-glow' : ''}`}
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 hover:text-blue-400"
                >
                  <Search className={`w-5 h-5 transition-all duration-300 ${isSearchFocused ? 'text-blue-400' : 'text-white/40'}`} />
                </button>
              </form>
              {searchInput !== '' && (
                <div className="absolute left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-10 max-h-60 overflow-y-auto animate-fade-in-up">
                  {filteredServices.length === 0 ? (
                    <div className="px-4 py-3 text-white/60 text-center">No results found</div>
                  ) : (
                    filteredServices.slice(0, 8).map((service, index) => (
                      <div
                        key={service}
                        className="px-4 py-3 cursor-pointer hover:bg-white/10 text-white transition-all duration-200 hover:translate-x-1 flex items-center space-x-2"
                        onMouseDown={() => {
                          if (onSearch) {
                            onSearch(service);
                            setSearchInput('');
                          }
                        }}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Search className="w-4 h-4 text-white/40" />
                        <span>{service}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Home Tab for authenticated users */}
                <button 
                  onClick={onLogoClick}
                  className="btn-secondary flex items-center space-x-2 group"
                >
                  <span>Home</span>
                </button>
                {/* Enhanced Authenticated user buttons */}
                <button 
                  onClick={onPostTask}
                  className="btn-primary flex items-center space-x-2 group"
                >
                  <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                  <span>Post Service</span>
                </button>
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNotifications(!showNotifications);
                    }}
                    className="bell-button relative p-2 text-white/60 hover:text-white transition-all duration-300 hover-glow rounded-full group"
                  >
                    <Bell className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="notifications-container absolute right-0 mt-2 w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 animate-fade-in-up">
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold">Notifications</h3>
                          <button 
                            onClick={markAllRead}
                            className="text-blue-400 text-sm hover:text-blue-300"
                          >
                            Mark all read
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notificationsLoading ? (
                          <div className="p-4 text-center text-white/60">Loading...</div>
                        ) : notificationsError ? (
                          <div className="p-4 text-center text-red-400">{notificationsError}</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-white/60">No notifications</div>
                        ) : (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-500/10' : ''}`}
                              onClick={async () => {
                                if (!notification.read) {
                                  try {
                                    await fetch(`/api/notifications/${notification.id}/mark-read`, { method: 'POST' });
                                    setNotifications(notifications.map(n => n.id === notification.id ? { ...n, read: true } : n));
                                  } catch {}
                                }
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-400' : 'bg-white/20'}`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                                    <span className="text-white/40 text-xs">{notification.time}</span>
                                  </div>
                                  <p className="text-white/70 text-sm">{notification.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="p-4 border-t border-white/10">
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="w-full text-center text-blue-400 text-sm hover:text-blue-300"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={onAccount}
                  className="flex items-center space-x-2 glass px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-8 h-8 bg-black border border-white/30 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{boxShadow: '0 0 8px 2px rgba(255,255,255,0.18)'}}>
                    <span className="text-white font-semibold text-sm text-glow">
                      {userName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-white font-medium text-sm hidden md:block">
                    {userName || 'User'}
                  </span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => router.push('/about')} className="btn-secondary flex items-center space-x-2 group">About Us</button>
                <button
                  onClick={() => {
                    onSignup();
                    // Assuming setShowAuthModal and setAuthMode are available in the parent component
                    // This part of the code was not provided in the original file,
                    // so I'm adding a placeholder for context.
                    // In a real scenario, these would be props or state managed by the parent.
                    // For now, I'll just call onSignup as per the new_code.
                  }}
                  className="btn-secondary flex items-center space-x-2 mr-2 group"
                >
                  <span>Sign Up</span>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                </button>
                <button
                  onClick={onAuth}
                  className="btn-secondary flex items-center space-x-2 group"
                >
                  <User className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <span>Sign In</span>
                </button>
              </>
            )}
            <button className="p-2 text-white/60 hover:text-white transition-all duration-300 hover-glow rounded-full md:hidden group">
              <Menu className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 