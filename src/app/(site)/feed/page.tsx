"use client"

import { useEffect, useState, useRef } from 'react';
import TaskFeed from '@/components/TaskFeed';
import TaskForm from '@/components/TaskForm';
import { Task, TaskFormData } from '@/types/task';
import { ArrowRight, CheckCircle, MapPin, Search, Filter, SlidersHorizontal, TrendingUp, Users, Award, Sparkles, X, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Listbox } from '@headlessui/react';


// Prepare for backend integration
const mockTasks: Task[] = [];

export default function FeedPage() {
  const router = useRouter();
  const [location, setLocation] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [locationError, setLocationError] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [starOffset, setStarOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [applyTask, setApplyTask] = useState<Task | null>(null);
  const [applyName, setApplyName] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [applyBid, setApplyBid] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applying, setApplying] = useState(false);
  const [applicationError, setApplicationError] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState('');

  // Available categories
  const categories = ['All', 'Technology', 'Design', 'Marketing', 'Content Writing', 'Legal', 'Tutoring', 'Home Repair', 'Cleaning', 'Photography', 'Web Development', 'Fitness & Wellness', 'Data Entry', 'Translation', 'Interior Design', 'Video Editing', 'Pet Care', 'Cooking & Catering'];

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
      setLoading(true);
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        setTasks([]);
      }
      setLoading(false);
    };
    fetchTasks();
    // Check for search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
    // Parallax scroll effect for background
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setStarOffset(scrollY * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Try to get geolocation on mount
    if (typeof window !== 'undefined' && !location) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            // Use free reverse geocoding service (Nominatim)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.address) {
                // Try to get the most specific location name available
                let locationName = data.address.city || 
                                 data.address.town || 
                                 data.address.village || 
                                 data.address.suburb ||
                                 data.address.county ||
                                 data.address.state ||
                                 'Your Area';
                
                setLocation(locationName);
              } else {
                setLocation('Your Area');
              }
            } else {
              // Fallback to manual location input if geocoding fails
              setLocationError('Could not detect location name. Please enter your location manually.');
            }
          } catch (error) {
            // Fallback to manual location input if geocoding fails
            setLocationError('Could not detect location name. Please enter your location manually.');
          }
          setLoading(false);
        },
        (err) => {
          setLocationError('Location permission denied. Please enter your location manually.');
          setLoading(false);
        }
      );
    }
  }, []);

  // Fetch location suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (manualLocation.length < 1) {
        setLocationSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&addressdetails=1&limit=5`);
        const data = await res.json();
        const suggestions = data.map((item: any) => item.display_name);
        setLocationSuggestions(suggestions);
      } catch {
        setLocationSuggestions([]);
      }
    };
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [manualLocation]);

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const locationMatch = !location || 
        task.location.toLowerCase().includes(location.toLowerCase()) || 
        task.location === 'Remote' || 
        task.location === 'Sonipat';
      
      const searchMatch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const categoryMatch = selectedCategory === 'All' || task.category === selectedCategory;
      
      const priceMatch = task.budget >= priceRange[0] && task.budget <= priceRange[1];
      
      return locationMatch && searchMatch && categoryMatch && priceMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        case 'oldest':
          return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
        case 'budget-high':
          return b.budget - a.budget;
        case 'budget-low':
          return a.budget - b.budget;
        case 'applications':
          return b.applications - a.applications;
        default:
          return 0;
      }
    });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('newest');
    setPriceRange([0, 100000]);
  };

  const handlePostTask = () => {
    setShowTaskForm(true);
  };

  const handleTaskSubmit = async (taskData: TaskFormData) => {
    if (!user) {
      alert('You must be logged in to post a task.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          postedBy: user.name,
          postedById: user.id,
        }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prevTasks => [newTask, ...prevTasks]);
        setShowTaskForm(false);
        setApplicationSuccess('Task posted successfully!');
      } else {
        alert('Failed to post task.');
      }
    } catch (err) {
      alert('Failed to post task.');
    }
    setLoading(false);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || sortBy !== 'newest' || priceRange[0] !== 0 || priceRange[1] !== 100000;

  // Fetch applications when a task is viewed
  useEffect(() => {
    if (viewTask) {
      fetch(`/api/applications?taskId=${viewTask.id}`)
        .then(res => res.json())
        .then(data => setApplications(data || []));
    }
  }, [viewTask]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to apply.');
      return;
    }
    if (!applyName.trim()) {
      setApplicationError('Name is required');
      return;
    }
    if (!applyMessage.trim()) {
      setApplicationError('Message is required');
      return;
    }
    if (!applyBid || isNaN(Number(applyBid)) || Number(applyBid) <= 0) {
      setApplicationError('Bid must be a positive number');
      return;
    }
    setApplicationError('');
    setApplying(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bid: Number(applyBid),
          message: applyMessage,
          userId: user.id,
          taskId: viewTask.id,
        }),
      });
      if (res.ok) {
        setApplySuccess(true);
        setApplyBid('');
        setApplyMessage('');
        // Refresh applications
        fetch(`/api/applications?taskId=${viewTask.id}`)
          .then(res => res.json())
          .then(data => setApplications(data || []));
      } else {
        alert('Failed to apply.');
      }
    } catch {
      alert('Failed to apply.');
    }
    setApplying(false);
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
        onPostTask={handlePostTask}
        onAuth={() => router.push('/')}
        onSignup={() => router.push('/')}
        isAuthenticated={!!user}
        userName={user?.name}
        onAccount={() => router.push('/dashboard')}
        onLogoClick={() => router.push('/feed')}
        onSearch={handleSearch}
      />

      <div className="section-padding">
        <div className="container">
          {/* Enhanced Filters and Search Section (moved to top) */}
          <div className="mb-8">
            {/* Active Filters Display */}
            {(location || searchQuery || hasActiveFilters) && (
              <div className="glass-card p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  {location && (
                    <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">Near {location}</span>
                      <button 
                        className="text-blue-400 hover:text-blue-300 ml-2"
                        onClick={() => { setLocation(null); setManualLocation(''); }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {searchQuery && (
                    <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2">
                      <Search className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">"{searchQuery}"</span>
                      <button 
                        className="text-purple-400 hover:text-purple-300 ml-2"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {selectedCategory !== 'All' && (
                    <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
                      <span className="text-white text-sm">{selectedCategory}</span>
                      <button 
                        className="text-green-400 hover:text-green-300 ml-2"
                        onClick={() => setSelectedCategory('All')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {hasActiveFilters && (
                    <button 
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-white text-sm transition-all duration-300"
                      onClick={clearAllFilters}
                    >
                      <X className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Enhanced Filter Controls */}
            <div className="glass-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Category Filter */}
                <div className="flex-1">
                  <label className="block text-white/80 text-sm font-medium mb-3">Category</label>
                  <Listbox value={selectedCategory} onChange={setSelectedCategory}>
                    <div className="relative">
                      <Listbox.Button className="input-field w-full flex justify-between items-center cursor-pointer">
                        <span>{selectedCategory}</span>
                        <svg className="w-5 h-5 text-white/60 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-30 mt-2 w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                        {categories.map((category) => (
                          <Listbox.Option
                            key={category}
                            value={category}
                            className={({ active, selected }) =>
                              `px-4 py-3 cursor-pointer text-white transition-all duration-200 ${active ? 'bg-white/10' : ''} ${selected ? 'font-bold bg-blue-500/20' : ''}`
                            }
                          >
                            {category}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                {/* Sort Filter */}
                <div className="flex-1">
                  <label className="block text-white/80 text-sm font-medium mb-3">Sort By</label>
                  <Listbox value={sortBy} onChange={setSortBy}>
                    <div className="relative">
                      <Listbox.Button className="input-field w-full flex justify-between items-center cursor-pointer">
                        <span>{
                          sortBy === 'newest' ? 'Newest First' :
                          sortBy === 'oldest' ? 'Oldest First' :
                          sortBy === 'budget-high' ? 'Highest Budget' :
                          sortBy === 'budget-low' ? 'Lowest Budget' :
                          sortBy === 'applications' ? 'Most Applications' : sortBy
                        }</span>
                        <svg className="w-5 h-5 text-white/60 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-30 mt-2 w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                        <Listbox.Option value="newest" className={({ active, selected }) => `px-4 py-3 cursor-pointer text-white transition-all duration-200 ${active ? 'bg-white/10' : ''} ${selected ? 'font-bold bg-blue-500/20' : ''}`}>Newest First</Listbox.Option>
                        <Listbox.Option value="oldest" className={({ active, selected }) => `px-4 py-3 cursor-pointer text-white transition-all duration-200 ${active ? 'bg-white/10' : ''} ${selected ? 'font-bold bg-blue-500/20' : ''}`}>Oldest First</Listbox.Option>
                        <Listbox.Option value="budget-high" className={({ active, selected }) => `px-4 py-3 cursor-pointer text-white transition-all duration-200 ${active ? 'bg-white/10' : ''} ${selected ? 'font-bold bg-blue-500/20' : ''}`}>Highest Budget</Listbox.Option>
                        <Listbox.Option value="budget-low" className={({ active, selected }) => `px-4 py-3 cursor-pointer text-white transition-all duration-200 ${active ? 'bg-white/10' : ''} ${selected ? 'font-bold bg-blue-500/20' : ''}`}>Lowest Budget</Listbox.Option>
                        <Listbox.Option value="applications" className={({ active, selected }) => `px-4 py-3 cursor-pointer text-white transition-all duration-200 ${active ? 'bg-white/10' : ''} ${selected ? 'font-bold bg-blue-500/20' : ''}`}>Most Applications</Listbox.Option>
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                {/* Price Range Filter */}
                <div className="flex-1">
                  <label className="block text-white/80 text-sm font-medium mb-3">Budget Range</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      className="input-field flex-1"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    />
                    <span className="text-white/60">to</span>
                    <input
                      type="number"
                      className="input-field flex-1"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                    />
                  </div>
                </div>
                {/* (Removed Advanced Filters Toggle for cleaner UI) */}
              </div>
            </div>
          </div>

          {/* Enhanced Header Section (moved below filters) */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4 flex items-center gap-3">
                  <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse-slow" />
                  Task Feed
                </h1>
                <p className="text-white/70 text-lg max-w-2xl">
                  Discover amazing opportunities and connect with skilled professionals. 
                  Find the perfect task that matches your expertise or post your own.
                </p>
              </div>
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="glass-card px-6 py-4 flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-float">
                  <TrendingUp className="w-6 h-6 text-green-400 animate-pulse-slow" />
                  <div>
                    <div className="font-bold text-white text-lg text-gradient-animated">{filteredAndSortedTasks.length}</div>
                    <div className="text-white/60 text-sm">Available Tasks</div>
                  </div>
                </div>
                <div className="glass-card px-6 py-4 flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-float" style={{animationDelay: '0.2s'}}>
                  <Users className="w-6 h-6 text-blue-400 animate-pulse-slow" />
                  <div>
                    <div className="font-bold text-white text-lg text-gradient-animated">10K+</div>
                    <div className="text-white/60 text-sm">Active Users</div>
                  </div>
                </div>
                <div className="glass-card px-6 py-4 flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-float" style={{animationDelay: '0.4s'}}>
                  <Award className="w-6 h-6 text-purple-400 animate-pulse-slow" />
                  <div>
                    <div className="font-bold text-white text-lg text-gradient-animated">₹25Cr+</div>
                    <div className="text-white/60 text-sm">Total Earnings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Location Section */}
          {loading && (
            <div className="glass-card p-6 mb-8 flex items-center gap-3 text-white/70 animate-pulse">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Detecting your location...</span>
            </div>
          )}
          
          {!location && !loading && (
            <div className="glass-card p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Set Your Location</h3>
              </div>
              <p className="text-white/80 mb-4">We need your location to show relevant tasks. Please enter your city or area:</p>
              <div className="flex gap-3 items-center relative">
                <input
                  ref={locationInputRef}
                  className="input-field flex-1"
                  placeholder="Enter your city, area, or country"
                  value={manualLocation}
                  onChange={e => {
                    setManualLocation(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={() => {
                    if (!manualLocation) return;
                    setLocation(manualLocation);
                    setLocationError('');
                  }}
                  disabled={!manualLocation}
                >
                  <Search className="w-5 h-5" />
                  Set Location
                </button>
                {/* Suggestions Dropdown */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-24 top-full mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto animate-fade-in-up">
                    {locationSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 cursor-pointer hover:bg-white/10 text-white transition-all duration-200"
                        onMouseDown={() => {
                          setManualLocation(suggestion);
                          setLocation(suggestion);
                          setShowSuggestions(false);
                          setLocationError('');
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {locationError && <div className="text-red-400 mt-3 flex items-center gap-2"><X className="w-4 h-4" />{locationError}</div>}
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-white/70">
              Showing <span className="text-white font-semibold">{filteredAndSortedTasks.length}</span> of <span className="text-white font-semibold">{tasks.length}</span> tasks
            </div>
            {filteredAndSortedTasks.length > 0 && (
              <div className="text-white/60 text-sm">
                Sorted by {sortBy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            )}
          </div>

          {/* Task Feed */}
          <TaskFeed
            tasks={filteredAndSortedTasks}
            onViewTask={setViewTask}
            onApplyTask={setApplyTask}
          />
          
          {/* No Results State */}
          {filteredAndSortedTasks.length === 0 && (
            <div className="glass-card p-16 text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No tasks found</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                {hasActiveFilters 
                  ? "Try adjusting your filters or search terms to find more tasks."
                  : "No tasks are currently available for your location. Check back later or try a different area."
                }
              </p>
              {hasActiveFilters && (
                <button 
                  className="btn-primary"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleTaskSubmit}
          onClose={() => setShowTaskForm(false)}
          defaultLocation={location || ''}
        />
      )}

      {/* View Task Modal */}
      {viewTask && (
        <div className="modal-overlay z-50" onClick={() => setViewTask(null)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gradient">{viewTask.title}</h2>
                <button className="text-white/60 hover:text-white p-2 hover-glow rounded-full" onClick={() => setViewTask(null)}><X className="w-6 h-6" /></button>
              </div>
              <div className="mb-4 text-white/80 text-lg">{viewTask.description}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="glass-card p-4 flex flex-col gap-2">
                  <span className="text-white/60 text-xs">Budget</span>
                  <span className="text-green-400 font-bold text-xl">₹{viewTask.budget.toLocaleString('en-IN')}</span>
                </div>
                <div className="glass-card p-4 flex flex-col gap-2">
                  <span className="text-white/60 text-xs">Location</span>
                  <span className="text-blue-400 font-bold text-lg">{viewTask.location}</span>
                </div>
                <div className="glass-card p-4 flex flex-col gap-2">
                  <span className="text-white/60 text-xs">Category</span>
                  <span className="text-white font-semibold">{viewTask.category}</span>
                </div>
                <div className="glass-card p-4 flex flex-col gap-2">
                  <span className="text-white/60 text-xs">Posted By</span>
                  <span className="text-white font-semibold">{viewTask.postedBy}</span>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button className="btn-secondary px-6 py-3" onClick={() => setViewTask(null)}>Close</button>
                <button className="btn-primary px-6 py-3 flex items-center gap-2" onClick={() => { setApplyTask(viewTask); setViewTask(null); }}>
                  <ArrowRight className="w-5 h-5" /> Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Task Modal */}
      {applyTask && (
        <div className="modal-overlay z-50" onClick={() => { setApplyTask(null); setApplySuccess(false); }}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gradient">Apply for: {applyTask.title}</h2>
                <button className="text-white/60 hover:text-white p-2 hover-glow rounded-full" onClick={() => { setApplyTask(null); setApplySuccess(false); }}><X className="w-6 h-6" /></button>
              </div>
              {applySuccess ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mb-4 animate-pulse" />
                  <div className="text-2xl font-bold text-white mb-2">Application Submitted!</div>
                  <div className="text-white/70 mb-6">You will be contacted if shortlisted.</div>
                  <button className="btn-primary px-8 py-3" onClick={() => { setApplyTask(null); setApplySuccess(false); }}>Close</button>
                </div>
              ) : (
                <form
                  className="space-y-6"
                  onSubmit={handleApply}
                >
                  <div>
                    <label className="block text-white/80 mb-2">Your Name</label>
                    <input
                      className="input-field w-full"
                      value={applyName}
                      onChange={e => setApplyName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Message</label>
                    <textarea
                      className="input-field w-full"
                      value={applyMessage}
                      onChange={e => setApplyMessage(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Your Bid (₹)</label>
                    <input
                      className="input-field w-full"
                      type="number"
                      min="1"
                      value={applyBid}
                      onChange={e => setApplyBid(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <button type="button" className="btn-secondary px-6 py-3" onClick={() => setApplyTask(null)}>Cancel</button>
                    <button type="submit" className="btn-primary px-6 py-3 flex items-center gap-2" disabled={applying}>
                      {applying ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <ArrowRight className="w-5 h-5" />
                      )}
                      {applying ? 'Applying...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Error/Success Feedback for Application */}
      {applicationError && (
        <div className="mb-4 px-4 py-2 rounded text-sm font-medium bg-red-500/20 text-red-300" aria-live="polite">{applicationError}</div>
      )}
      {applicationSuccess && (
        <div className="mb-4 px-4 py-2 rounded text-sm font-medium bg-green-500/20 text-green-300" aria-live="polite">{applicationSuccess}</div>
      )}
    </div>
  );
} 