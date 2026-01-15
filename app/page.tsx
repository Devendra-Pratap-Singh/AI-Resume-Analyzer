'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Briefcase, 
  Mail, 
  Phone, 
  ArrowRight,
  Upload,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signUp, signIn, signOut, resetPassword } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'dashboard' | 'forgot-password'>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setView('dashboard')
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setView('dashboard')
      } else {
        setUser(null)
        setView('landing')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)

    const formData = new FormData()
    formData.append('email', email)
    
    if (view === 'forgot-password') {
      const result = await resetPassword(formData)
      if (result?.error) {
        setAuthError(result.error)
      } else {
        setAuthError("Password reset link sent to your email!")
      }
      setIsLoading(false)
      return
    }

    formData.append('password', password)
    if (view === 'signup') formData.append('fullName', fullName)

    const result = view === 'signup' ? await signUp(formData) : await signIn(formData)

    if (result?.error) {
      setAuthError(result.error) // This will now show the detailed error
      setIsLoading(false)
    } else if (result?.message) {
      setAuthError(result.message) // Show the "Check Email" or "Success" message
      setIsLoading(false)
      if (view === 'signup') setView('login')
    }
  }

  const handleLogout = async () => {
    await signOut()
    setView('landing')
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
    { label: 'Contains a special character', test: (p: string) => /[!@#$%^&*]/.test(p) },
    { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  ]

  if (view === 'login' || view === 'signup' || view === 'forgot-password') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
                  <FileText className="text-white w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-3xl text-center font-bold tracking-tight">
                {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
              </CardTitle>
              <p className="text-center text-slate-500">
                {view === 'login' ? 'Access your AI-powered career tools' : view === 'signup' ? 'Start your journey to a better career' : 'Enter your email to receive a reset link'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                {authError && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${authError.includes('sent') || authError.includes('created') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {authError}
                  </div>
                )}
                {view === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white/50"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white/50"
                  />
                </div>
                
                {view !== 'forgot-password' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-slate-700">Password</label>
                      {view === 'login' && (
                        <button 
                          type="button"
                          onClick={() => setView('forgot-password')}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white/50"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    
                    {view === 'signup' && password.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2 space-y-2"
                      >
                        <p className="text-xs font-medium text-slate-500 mb-2">Password Requirements:</p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {passwordRequirements.map((req, i) => {
                            const isMet = req.test(password)
                            return (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                {isMet ? (
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-slate-300" />
                                )}
                                <span className={isMet ? "text-green-600 font-medium" : "text-slate-500"}>
                                  {req.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-blue-200 mt-4" 
                >
                  {isLoading ? 'Processing...' : (view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link')}
                </Button>
              </form>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or</span></div>
              </div>

              <div className="text-center text-sm">
                <button 
                  onClick={() => {
                    setView(view === 'login' ? 'signup' : 'login')
                    setPassword('')
                    setEmail('')
                    setFullName('')
                    setAuthError(null)
                  }}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  {view === 'login' ? "Don't have an account? Sign up" : "Back to Sign In"}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (view === 'dashboard') {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900">AI-RESUME-ANALYSER</span>
        </motion.div>
        <nav className="hidden md:flex items-center gap-10">
          {['Features', 'How it Works', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="font-bold" onClick={() => setView('login')}>Sign In</Button>
          <Button className="rounded-full px-6 font-bold shadow-lg shadow-blue-100" onClick={() => setView('signup')}>Get Started</Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 border border-blue-100">
                <Zap size={16} className="fill-blue-700" />
                <span>Powered by Advanced AI Models</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                Your Resume, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Perfected by AI.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                Stop guessing what recruiters want. Get a data-driven analysis of your resume and land 3x more interviews.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-blue-200 hover:scale-105 transition-transform" onClick={() => setView('signup')}>
                  Analyze Now <ArrowRight className="w-6 h-6" />
                </Button>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Joined by 10,000+ users</p>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map(i => <CheckCircle2 key={i} size={12} className="fill-current" />)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-slate-900 mb-4">Everything you need to succeed</h2>
              <p className="text-lg text-slate-500 font-medium">Built by career experts and AI engineers.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: <TrendingUp className="w-10 h-10 text-blue-600" />,
                  title: "ATS Optimization",
                  desc: "We use the same algorithms as top Fortune 500 companies to score your resume.",
                  color: "bg-blue-50"
                },
                {
                  icon: <CheckCircle2 className="w-10 h-10 text-emerald-600" />,
                  title: "Smart Feedback",
                  desc: "Get specific, actionable advice on how to improve every section of your CV.",
                  color: "bg-emerald-50"
                },
                {
                  icon: <Briefcase className="w-10 h-10 text-indigo-600" />,
                  title: "Job Matching",
                  desc: "Discover roles that perfectly match your skills and experience level.",
                  color: "bg-indigo-50"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card className="h-full border-none shadow-xl shadow-slate-200/50 bg-white p-4">
                    <CardContent className="pt-8">
                      <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
              <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl font-black mb-6">Need help? <br />Our team is here.</h2>
                  <p className="text-slate-400 text-lg mb-10 font-medium">Have questions about your analysis or need technical support? Reach out anytime.</p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Call Us</p>
                        <p className="text-xl font-bold">+91-9717409975</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Email Us</p>
                        <p className="text-xl font-bold">dpratapsingh42@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold mb-6">Send a Message</h3>
                  <div className="space-y-4">
                    <input placeholder="Your Name" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input placeholder="Email Address" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <textarea placeholder="How can we help?" rows={4} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    <Button className="w-full h-12 rounded-xl font-bold">Send Message</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <FileText className="text-white w-4 h-4" />
            </div>
            <span className="font-black text-lg tracking-tighter">AI-RESUME-ANALYSER</span>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms of Service</a>
            <a href="#" className="hover:text-blue-600">Cookie Policy</a>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2024 AI-RESUME-ANALYSER. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function Dashboard({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setIsLoadingHistory(true)
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setHistory(data)
    setIsLoadingHistory(false)
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    setError(null)
    setProgress(10)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 2 : prev))
      }, 200)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to analyze resume')
      }

      const data = await response.json()
      setAnalysisData(data)
      setShowResults(true)
      fetchHistory() // Refresh history
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const deleteResume = async (id: string) => {
    const { error } = await supabase.from('resumes').delete().eq('id', id)
    if (!error) fetchHistory()
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="px-8 py-4 flex items-center justify-between bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter">DASHBOARD</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-[10px] text-slate-500 font-medium">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">AI Engine Online</span>
          </div>
          <Button variant="ghost" className="font-bold text-slate-500 hover:text-red-600" onClick={onLogout}>Logout</Button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="upload-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3"
            >
              <AlertCircle size={20} />
              <p className="font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <div className="space-y-12">
              <motion.div 
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto"
              >
                <div className="mb-10 text-center">
                  <h2 className="text-4xl font-black text-slate-900 mb-4">Analyze your Resume</h2>
                  <p className="text-lg text-slate-500 font-medium">Upload your CV and let our AI do the heavy lifting.</p>
                </div>
                
                <Card className="border-dashed border-2 border-blue-200 bg-white shadow-2xl shadow-blue-100/50 overflow-hidden relative">
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-12">
                      <div className="w-full max-w-md space-y-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-2xl font-black text-slate-900">Analyzing...</h3>
                            <p className="text-slate-500 font-medium">AI is evaluating your profile</p>
                          </div>
                          <span className="text-3xl font-black text-blue-600">{progress}%</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="flex flex-col items-center justify-center py-24">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-blue-50 p-8 rounded-[2.5rem] mb-8 shadow-inner relative"
                    >
                      <Upload className="w-12 h-12 text-blue-600" />
                      <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg">
                        <Zap size={16} className="fill-current" />
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900">Drop your file here</h3>
                    <p className="text-slate-500 mb-10 text-center max-w-sm font-medium">
                      We support PDF and DOCX formats. Your data is encrypted and secure.
                    </p>
                    <input type="file" id="resume-upload" className="hidden" accept=".pdf,.docx" onChange={handleUpload} />
                    <Button 
                      size="lg" 
                      className="h-14 px-10 rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-blue-200" 
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      disabled={isAnalyzing}
                    >
                      <Upload className="w-6 h-6" /> {isAnalyzing ? 'Processing...' : 'Select Resume'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* History Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900">Recent Analyses</h3>
                {isLoadingHistory ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>)}
                  </div>
                ) : history.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((item) => (
                      <Card key={item.id} className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group overflow-hidden" onClick={() => {
                        setAnalysisData(item.analysis)
                        setShowResults(true)
                      }}>
                        <div className={`h-1.5 w-full ${item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="bg-slate-100 p-2 rounded-lg">
                              <FileText className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${item.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                              {item.score}% Score
                            </div>
                          </div>
                          <h4 className="font-bold text-slate-900 truncate mb-1">{item.file_name}</h4>
                          <p className="text-xs text-slate-500 font-medium mb-4">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600 group-hover:underline">View Report</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteResume(item.id)
                              }}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No previous analyses found. Upload your first resume!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-2">Analysis Complete</h2>
                  <p className="text-slate-500 font-medium">Here's how your resume performs in the current market.</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="h-12 rounded-xl font-bold border-2" onClick={() => {
                    setShowResults(false)
                    setAnalysisData(null)
                  }}>
                    Back to Dashboard
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* ATS Score Card */}
                <Card className="lg:col-span-1 border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                  <div className="h-2 bg-blue-600 w-full"></div>
                  <CardHeader>
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <TrendingUp className="text-blue-600" /> ATS Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                        <motion.circle 
                          cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                          strokeDasharray={553} 
                          initial={{ strokeDashoffset: 553 }}
                          animate={{ strokeDashoffset: 553 - (553 * (analysisData?.score || 0)) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="text-blue-600" 
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black text-slate-900">{analysisData?.score || 0}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                          {analysisData?.score >= 80 ? 'Excellent' : analysisData?.score >= 60 ? 'Good' : 'Needs Work'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-10 p-4 bg-blue-50 rounded-2xl border border-blue-100 w-full">
                      <p className="text-sm text-blue-800 font-semibold text-center leading-relaxed">
                        {analysisData?.summary || "Your resume has been analyzed by our local heuristic engine."}
                      </p>
                      {analysisData?.summary?.includes("Local Analysis") && (
                        <p className="text-[10px] text-blue-400 text-center mt-2 font-bold uppercase tracking-widest">
                          Free Heuristic Mode Active
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback Card */}
                <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                  <div className="h-2 bg-indigo-600 w-full"></div>
                  <CardHeader>
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <ShieldCheck className="text-indigo-600" /> Detailed Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
                          <CheckCircle2 size={18} className="fill-emerald-700 text-white" />
                          <span className="font-bold text-sm uppercase tracking-wider">Strengths</span>
                        </div>
                        <ul className="space-y-4">
                          {analysisData?.pros?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-red-50 text-red-700 rounded-xl w-fit">
                          <AlertCircle size={18} className="fill-red-700 text-white" />
                          <span className="font-bold text-sm uppercase tracking-wider">Weaknesses</span>
                        </div>
                        <ul className="space-y-4">
                          {analysisData?.cons?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl w-fit mb-6">
                        <Zap size={18} className="fill-blue-700 text-white" />
                        <span className="font-bold text-sm uppercase tracking-wider">Action Plan</span>
                      </div>
                      <div className="grid md:grid-cols-1 gap-4">
                        {analysisData?.recommendations?.map((item: string, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600 font-bold text-sm shrink-0">
                              {i + 1}
                            </div>
                            <p className="text-slate-700 font-medium text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Job Recommendations */}
              <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                <div className="h-2 bg-emerald-600 w-full"></div>
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Briefcase className="text-emerald-600" /> Recommended Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysisData?.jobs?.map((job: any, i: number) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.02 }}
                        className="p-6 border-2 border-slate-50 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-black">
                            {job.matchPercentage} MATCH
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          {job.reason}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
