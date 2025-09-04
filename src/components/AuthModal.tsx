'use client'

import React from 'react'
import { useState, useRef } from 'react'
import { X, Phone, User, Mail, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { LoginFormData, SignupFormData } from '@/types/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (data: LoginFormData) => void
  onSignup: (data: SignupFormData) => void
  initialMode?: 'login' | 'signup'
}

// Notification component for bottom-left toasts
function OTPToast({ message, onClose }: { message: string, onClose: () => void }) {
  // Auto-dismiss after 4 seconds
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', left: 24, bottom: 24, zIndex: 9999 }} className="bg-black/90 text-white px-6 py-3 rounded-xl shadow-lg border border-blue-400 animate-fade-in-up">
      <span className="font-bold">OTP:</span> {message}
    </div>
  );
}

export default function AuthModal({ isOpen, onClose, onLogin, onSignup, initialMode }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup')
  const [showOtp, setShowOtp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [signupStep, setSignupStep] = useState(1); // 1: phone, 2: otp, 3: details
  const [otpToast, setOtpToast] = useState<string | null>(null);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string | null>(null);

  // Validation helpers
  function validatePhone(phone: string) {
    return /^\d{10}$/.test(phone);
  }
  function validateEmail(email: string) {
    return !email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  // Replace OTP generation for frontend demo
  function generateFrontendOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      setOtpError('Enter a valid 10-digit phone number');
      return;
    }
    setSendingOtp(true);
    setOtpError('');
    try {
      // Generate 4-digit OTP on frontend for demo
      const demoOtp = generateFrontendOTP();
      setOtpToast(demoOtp);
      setLastGeneratedOtp(demoOtp);
      setShowOtp(true);
      setOtpSent(true);
      setOtpError('');
      if (!isLogin) setSignupStep(2); // Advance to OTP step in signup
    } catch (err) {
      setOtpError('Failed to generate OTP');
    }
    setSendingOtp(false);
  }

  const handleVerifyOtp = async () => {
    if (!validatePhone(phone)) {
      setOtpError('Enter a valid 10-digit phone number');
      return;
    }
    if (otp.length !== 4) {
      setOtpError('Enter the 4-digit OTP');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    // Frontend-only OTP check
    if (otp === lastGeneratedOtp) {
      setOtpVerified(true);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP');
    }
    setVerifyingOtp(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (!validatePhone(phone)) {
        setOtpError('Enter a valid 10-digit phone number');
        return;
      }
      if (!otpVerified) {
        setOtpError('Please verify OTP first');
        return;
      }
      onLogin({ phone, otp });
    } else {
      if (!name.trim()) {
        setOtpError('Name is required');
        return;
      }
      if (!validateEmail(email)) {
        setOtpError('Enter a valid email address');
        return;
      }
      if (!otpVerified) {
        setOtpError('Please verify OTP first');
        return;
      }
      onSignup({ phone, name, email });
    }
  }

  const resetForm = () => {
    setPhone('')
    setOtp('')
    setName('')
    setEmail('')
    setShowOtp(false)
  }

  if (!isOpen) {
    // Render OTPToast outside modal if needed
    return otpToast ? <OTPToast message={otpToast} onClose={() => setOtpToast(null)} /> : null;
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gradient mb-2">
                  {isLogin ? 'Welcome Back' : 'Join GIGSLY'}
                </h2>
                <p className="text-white/60">
                  {isLogin ? 'Sign in to continue' : 'Create your account'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors p-2 hover-glow rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* LOGIN FLOW */}
              {isLogin && (
                <>
                  {/* Phone Number */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="input-field pr-12"
                        maxLength={10}
                        required
                      />
                      <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    </div>
                    {phone.length > 0 && !validatePhone(phone) && (
                      <p className="text-red-400 text-xs mt-1">Enter a valid 10-digit phone number</p>
                    )}
                    {otpError && otpError.includes('Enter a valid 10-digit phone number') && (
                      <p className="text-red-400 text-xs mt-1">{otpError}</p>
                    )}
                  </div>
                  {/* OTP for Login */}
                  {showOtp && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        OTP *
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="input-field flex-1 border-2 border-blue-400 focus:border-blue-600 text-lg tracking-widest text-center"
                          maxLength={6}
                          required
                          disabled={otpVerified}
                          placeholder="Enter OTP"
                        />
                        <button
                          type="button"
                          className={`btn-primary px-4 py-2 ${verifyingOtp ? 'opacity-60 cursor-wait' : ''}`}
                          onClick={handleVerifyOtp}
                          disabled={otp.length !== 4 || verifyingOtp || otpVerified}
                        >
                          {otpVerified ? 'Verified' : verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                      {otpSent && !otpVerified && (
                        <div className="text-blue-400 text-xs mt-2">OTP sent to {phone}</div>
                      )}
                      {otpVerified && (
                        <div className="text-green-400 text-xs mt-2 flex items-center gap-1">OTP verified <CheckCircle className="inline w-4 h-4" /></div>
                      )}
                      {otpError && (
                        <div className="text-red-400 text-xs mt-2 flex items-center gap-1">{otpError} <X className="inline w-4 h-4" /></div>
                      )}
                    </div>
                  )}
                  {/* Login Action Buttons */}
                  <div className="space-y-4">
                    {!showOtp ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={phone.length !== 10 || sendingOtp}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingOtp ? 'Sending...' : 'Send OTP'}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn-primary w-full"
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* SIGNUP FLOW */}
              {!isLogin && (
                <>
                  {signupStep === 1 && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-white/80 mb-2">Phone Number *</label>
                      <div className="relative">
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="input-field pr-12" maxLength={10} required />
                        <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      </div>
                      {phone.length > 0 && !validatePhone(phone) && <p className="text-red-400 text-xs mt-1">Enter a valid 10-digit phone number</p>}
                      <button type="button" className="btn-primary w-full mt-4" onClick={handleSendOtp} disabled={sendingOtp || phone.length !== 10}>{sendingOtp ? 'Sending...' : 'Send OTP'}</button>
                      {otpError && <div className="text-red-400 text-xs mt-2">{otpError}</div>}
                    </div>
                  )}
                  {signupStep === 2 && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-white/80 mb-2">OTP *</label>
                      <div className="flex gap-2 items-center">
                        <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="input-field flex-1 border-2 border-blue-400 focus:border-blue-600 text-lg tracking-widest text-center" maxLength={6} required disabled={otpVerified} placeholder="Enter OTP" />
                        <button type="button" className={`btn-primary px-4 py-2 ${verifyingOtp ? 'opacity-60 cursor-wait' : ''}`} onClick={handleVerifyOtp} disabled={otp.length !== 4 || verifyingOtp || otpVerified}>{otpVerified ? 'Verified' : verifyingOtp ? 'Verifying...' : 'Verify OTP'}</button>
                      </div>
                      {otpError && <div className="text-red-400 text-xs mt-2">{otpError}</div>}
                      <button type="button" className="text-white/60 hover:text-white text-xs mt-2" onClick={() => setSignupStep(1)}>Back</button>
                      {otpVerified && (
                        <button type="button" className="btn-primary w-full mt-4" onClick={() => setSignupStep(3)}>Continue</button>
                      )}
                    </div>
                  )}
                  {signupStep === 3 && (
                    <>
                      <div className="relative">
                        <label className="block text-sm font-medium text-white/80 mb-2">Full Name *</label>
                        <div className="relative">
                          <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field pr-12" required />
                          <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-white/80 mb-2">Email (Optional)</label>
                        <div className="relative">
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pr-12" />
                          <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                        </div>
                      </div>
                      {/* Remove password and confirm password fields from the UI in both login and signup flows */}
                      <button type="submit" className="btn-primary w-full mt-4">Create Account</button>
                      <button type="button" className="text-white/60 hover:text-white text-xs mt-2" onClick={() => setSignupStep(2)}>Back</button>
                    </>
                  )}
                  {/* Signup Toggle */}
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true)
                        resetForm()
                      }}
                      className="text-white/60 hover:text-white transition-colors text-sm"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </>
              )}

              {/* Error/Success Feedback */}
              {otpError && (
                <div className={`mb-4 px-4 py-2 rounded text-sm font-medium ${otpError ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`} aria-live="polite">
                  {otpError}
                </div>
              )}
            </form>

            {/* Demo Info */}
          </div>
        </div>
      </div>
      {/* Render OTPToast outside the modal, at the bottom left of the page */}
      {otpToast && <OTPToast message={otpToast} onClose={() => setOtpToast(null)} />}
    </>
  )
} 