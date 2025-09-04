"use client"
import { Instagram, Twitter, Linkedin, Mail, Phone, Heart, ArrowUp } from 'lucide-react'
import { useState } from 'react'

export default function Footer() {
  const [currentYear] = useState(new Date().getFullYear())

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="glass-card mt-16 py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10 bg-black/50 backdrop-blur-md relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
      
      {/* Branding with enhanced animations */}
      <div className="flex items-center space-x-6 group relative z-10 w-full max-w-2xl">
        <div className="w-16 h-16 bg-black border border-white/30 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow" style={{boxShadow: '0 0 24px 4px rgba(255,255,255,0.18)'}}>
          <span className="text-white font-extrabold text-3xl tracking-widest text-glow animate-pulse-slow">G</span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-4xl font-extrabold text-gradient-animated tracking-widest leading-tight">GIGSLY</span>
          <p className="text-lg text-white/60 font-medium mt-1">Connecting India's Talent</p>
        </div>
      </div>

      {/* Enhanced Contact Info */}
      <div className="flex flex-col items-start gap-3 bg-white/5 rounded-xl px-6 py-4 border border-white/10 shadow-sm backdrop-blur-md relative z-10 hover:bg-white/10 transition-all duration-300 group">
        <span className="text-white/90 font-semibold mb-1 group-hover:text-white transition-colors duration-300">Contact us:</span>
        <a href="mailto:help@giglsy.com" className="flex items-center gap-2 text-white/80 hover:text-blue-300 transition-all duration-300 hover:translate-x-1 group/link">
          <Mail className="w-5 h-5 group-hover/link:scale-110 transition-transform duration-300" />
          <span>help@giglsy.com</span>
        </a>
        <a href="tel:+911234567890" className="flex items-center gap-2 text-white/80 hover:text-blue-300 transition-all duration-300 hover:translate-x-1 group/link">
          <Phone className="w-5 h-5 group-hover/link:scale-110 transition-transform duration-300" />
          <span>+91 12345 67890</span>
        </a>
      </div>

      {/* Enhanced Copyright */}
      <div className="text-white/60 text-sm text-center relative z-10 flex items-center gap-2">
        <span>© {currentYear} Gigsly. Made with</span>
        <Heart className="w-4 h-4 text-red-400 animate-pulse" />
        <span>in India</span>
      </div>

      {/* Enhanced Social Links */}
      <div className="flex space-x-4 relative z-10">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-pink-400/20 transition-all duration-300 hover:scale-110 group">
          <Instagram className="w-6 h-6 text-white/60 group-hover:text-pink-400 transition-colors duration-300" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-blue-400/20 transition-all duration-300 hover:scale-110 group">
          <Twitter className="w-6 h-6 text-white/60 group-hover:text-blue-400 transition-colors duration-300" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-blue-300/20 transition-all duration-300 hover:scale-110 group">
          <Linkedin className="w-6 h-6 text-white/60 group-hover:text-blue-300 transition-colors duration-300" />
        </a>
      </div>

      {/* Scroll to top button */}
      <button 
        onClick={scrollToTop}
        className="absolute bottom-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
      >
        <ArrowUp className="w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-300" />
      </button>
    </footer>
  )
} 