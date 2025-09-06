import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

function loadToken() { return localStorage.getItem('token') ?? '' }

type AuthContextValue = {
  token: string
  setToken: (t: string) => void
  logout: () => void
}
const AuthContext = createContext<AuthContextValue | null>(null)
const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthContext missing')
  return ctx
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string>(loadToken())
  const setToken = (t: string) => { setTokenState(t); localStorage.setItem('token', t) }
  const logout = () => { setTokenState(''); localStorage.removeItem('token') }
  const value = useMemo(() => ({ token, setToken, logout }), [token])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Login() {
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.message || (Array.isArray(data?.errors) ? data.errors.map((i:any)=> i.message).join(', ') : 'Login failed')
        throw new Error(msg)
      }
      setToken(data.token)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="container-page flex items-center justify-center min-h-full">
      <div className="card-glass w-full max-w-md p-6">
        <h1 className="text-3xl font-extrabold mb-4">Welcome back</h1>
        <form onSubmit={submit} className="space-y-3">
          <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          <input className="input input-bordered w-full" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <button className="btn btn-primary w-full" disabled={loading}>{loading? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="text-sm mt-3">New here? <Link className="link" to="/register">Create an account</Link></p>
      </div>
    </div>
  )
}

function Register() {
  const { setToken } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.message || (Array.isArray(data?.errors) ? data.errors.map((i:any)=> i.message).join(', ') : 'Registration failed')
        throw new Error(msg)
      }
      setToken(data.token)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="container-page flex items-center justify-center min-h-full">
      <div className="card-glass w-full max-w-md p-6">
        <h1 className="text-3xl font-extrabold mb-4">Create account</h1>
        <form onSubmit={submit} className="space-y-3">
          <input className="input input-bordered w-full" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required />
          <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          <input className="input input-bordered w-full" placeholder="Password (min 8 chars)" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <button className="btn btn-primary w-full" disabled={loading}>{loading? 'Creating...' : 'Register'}</button>
        </form>
        <p className="text-sm mt-3">Already have an account? <Link className="link" to="/login">Login</Link></p>
      </div>
    </div>
  )
}

function Dashboard() {
  const { token, logout } = useAuth()
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }), [token])
  const today = new Date()
  const [yearStr, setYearStr] = useState(String(today.getFullYear()))
  const [monthStr, setMonthStr] = useState(String(today.getMonth() + 1))
  const [salary, setSalary] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [note, setNote] = useState('')
  const [summary, setSummary] = useState<{salary:string,totalExpenses:string,balance:string}>({salary:'0.00',totalExpenses:'0.00',balance:'0.00'})
  const [expenses, setExpenses] = useState<Array<any>>([])
  const [me, setMe] = useState<{name?:string,email?:string}>({})

  const year = Number(yearStr)
  const month = Number(monthStr)
  const isValidPeriod = Number.isFinite(year) && Number.isFinite(month) && year >= 2000 && year <= 3000 && month >= 1 && month <= 12

  const refresh = async () => {
    if (!isValidPeriod) {
      setSummary({ salary: '0.00', totalExpenses: '0.00', balance: '0.00' })
      setExpenses([])
      return
    }
    const qs = `year=${year}&month=${month}`
    const [sRes, eRes, meRes] = await Promise.all([
      fetch(`/api/summary?${qs}`, { headers }),
      fetch(`/api/expenses?${qs}`, { headers }),
      fetch(`/api/auth/me`, { headers }),
    ])
    const s = await sRes.json(); const e = await eRes.json(); const m = await meRes.json()
    setSummary(s); setExpenses(e); setMe(m)
  }

  useEffect(() => { refresh() }, [yearStr, monthStr])

  const saveSalary = async () => {
    await fetch('/api/salary', { method:'POST', headers, body: JSON.stringify({ year, month, salary }) })
    setSalary(''); await refresh()
  }

  const addExpense = async () => {
    await fetch('/api/expenses', { method:'POST', headers, body: JSON.stringify({ year, month, category, amount, date, note: note || undefined }) })
    setCategory(''); setAmount(''); setNote(''); await refresh()
  }

  const delExpense = async (id:string) => {
    await fetch(`/api/expenses/${id}`, { method:'DELETE', headers })
    await refresh()
  }

  const [theme, setTheme] = useState<'night'|'corporate'>(
    (localStorage.getItem('theme') as 'night'|'corporate') || 'night'
  )
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    // Force animated background to re-read CSS vars
    const bg = document.querySelector('.animated-bg') as HTMLElement | null
    if (bg) { bg.style.opacity = '0.999'; requestAnimationFrame(()=>{ if(bg) bg.style.opacity = '1'; }) }
  },[theme])

  return (
    <div className="container-page space-y-6">
      <div className="navbar bg-base-100/70 backdrop-blur-lg rounded-xl shadow flex flex-wrap gap-2">
        <div className="flex-1 min-w-[10rem]"><Link to="/" className="btn btn-ghost normal-case text-xl">Day2Day Expense</Link></div>
        <div className="flex-1 md:flex-none md:w-auto text-right min-w-[12rem]">
          <span className="inline mr-3 truncate align-middle max-w-[50vw]">{me?.name ? `Hi, ${me.name}!` : ''}</span>
          <select className="select select-bordered select-sm mr-2" value={theme} onChange={(e)=>setTheme(e.target.value as any)}>
            <option value="night">Dark</option>
            <option value="corporate">Light</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 items-start">
        <div className="card card-glass p-4 order-1">
          <h2 className="font-semibold mb-2">Period</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <input className="input input-bordered w-full sm:w-32" type="number" value={yearStr} onChange={e=>setYearStr(e.target.value)} placeholder="Year" />
            <input className="input input-bordered w-full sm:w-24" type="number" value={monthStr} min={1} max={12} onChange={e=>setMonthStr(e.target.value)} placeholder="Month (1-12)" />
            <button className="btn sm:ml-auto" onClick={refresh}>Refresh</button>
          </div>
        </div>
        <div className="card card-glass p-4 order-3 md:order-2">
          <h2 className="font-semibold mb-2">Set Salary</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input className="input input-bordered flex-1" placeholder="e.g. 50000.00" value={salary} onChange={e=>setSalary(e.target.value)} />
            <button className="btn btn-primary" onClick={saveSalary}>Save</button>
          </div>
        </div>
        <div className="card card-glass p-4 order-2 md:order-3">
          <h2 className="font-semibold mb-2">Summary</h2>
          <div className="stats shadow stats-vertical lg:stats-horizontal">
            <div className="stat"><div className="stat-title">Salary</div><div className="stat-value text-primary">₹{summary.salary}</div></div>
            <div className="stat"><div className="stat-title">Spent</div><div className="stat-value text-secondary">₹{summary.totalExpenses}</div></div>
            <div className="stat"><div className="stat-title">Balance</div><div className={`stat-value ${Number(summary.balance)>=0? 'text-success':'text-error'}`}>₹{summary.balance}</div></div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 items-start">
        <div className="card card-glass p-4 md:col-span-1">
          <h2 className="font-semibold mb-2">Add Expense</h2>
          <div className="grid grid-cols-1 gap-2">
            <input className="input input-bordered w-full" placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
            <input className="input input-bordered w-full" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
            <input className="input input-bordered w-full" type="date" value={date} onChange={e=>setDate(e.target.value)} />
            <input className="input input-bordered w-full" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
            <button className="btn btn-primary w-full" onClick={addExpense}>Add</button>
          </div>
        </div>
        <div className="card card-glass p-4 md:col-span-2">
          <h2 className="font-semibold mb-2">Expenses</h2>
          {/* Mobile list (cards) */}
          <div className="md:hidden space-y-2">
            {expenses.map((e:any)=> (
              <div key={e.id} className="rounded-xl border border-base-300/60 bg-base-100/70 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{e.date}</span>
                  <span className="font-semibold">₹{e.amount}</span>
                </div>
                <div className="text-xs opacity-80">{e.category}</div>
                <div className="text-xs mt-1 line-clamp-2 break-words">{e.note || '-'}</div>
                <div className="mt-2 text-right">
                  <button className="btn btn-xs" onClick={()=>delExpense(e.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop/tablet table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="table table-zebra table-fixed">
              <thead>
                <tr>
                  <th className="w-32">Date</th>
                  <th className="w-48">Category</th>
                  <th className="w-32">Amount</th>
                  <th>Note</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e:any)=> (
                  <tr key={e.id}>
                    <td>{e.date}</td>
                    <td>{e.category}</td>
                    <td>₹{e.amount}</td>
                    <td className="truncate">{e.note || '-'}</td>
                    <td><button className="btn btn-xs" onClick={()=>delExpense(e.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  useEffect(()=>{
    const t = setTimeout(()=>setShowSplash(false), 2000)
    return ()=>clearTimeout(t)
  },[])

  return (
    <AuthProvider>
      <div className="animated-bg" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/" element={<Protected><Dashboard/></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <div className="container-page">
        <footer className="footer footer-center bg-base-100/70 backdrop-blur-lg rounded-xl shadow p-4">
          <aside className="text-sm md:text-base">
            <p>
              Made with
              <span className="mx-1 text-error">❤</span>
              by <span className="font-semibold">Kaushik Karmakar</span>
            </p>
          </aside>
          <nav className="grid grid-flow-col gap-4">
            <a href="https://www.instagram.com/kaushik____42/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM17.75 6a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 17.75 6z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/kaushik.karmakar.376" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M13.5 22v-8h2.5l.5-3h-3v-1.9c0-.9.3-1.5 1.7-1.5H17V4.2c-.3 0-1.4-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V11H7v3h3v8h3.5z"/>
              </svg>
            </a>
          </nav>
        </footer>
      </div>
      {showSplash && (
        <div className="splash-overlay">
          <div className="relative">
            <div className="splash-ring" />
            <img src="https://res.cloudinary.com/dtyodrnjg/image/upload/v1757163751/icon_fw5dbm.jpg" alt="logo" className="splash-logo" />
          </div>
        </div>
      )}
    </AuthProvider>
  )
}
