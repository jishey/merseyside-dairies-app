import React, { useState, useMemo, useCallback } from 'react';
import { Home, ClipboardList, Calculator, Clock, Settings as SettingsIcon, ChevronLeft, ChevronRight, Plus, Minus, Check, X, WifiOff, User, Lock, Eye, EyeOff, AlertTriangle, LogOut, Edit3, Trash2, Mail, RefreshCw, Package, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Logo ────────────────────────────────────────────────────────
const LOGO_B64 = 'https://merseysidedairies.co.uk/wp-content/uploads/2016/04/Merseyside_Dairies_Logo_PNG.png';

// ─── Data ────────────────────────────────────────────────────────
const MILKMEN = [
  { id: 1, name: 'Ian', pin: '1234' },
  { id: 2, name: 'Gary', pin: '5678' },
  { id: 3, name: 'Andy', pin: '9012' },
  { id: 4, name: 'Joseph', pin: '3456' },
  { id: 5, name: 'Tommy', pin: '7890' },
  { id: 6, name: 'Reg', pin: '2345' },
  { id: 7, name: 'Frank', pin: '6789' },
];

// Ordered by size then colour: 2L blue, 2L green, 1L blue, 1L green, Pint blue, Pint green
const PRODUCTS_INIT = [
  { id: 1, name: 'Blue Milk', size: '2 Litre', color: '#2563EB' },
  { id: 4, name: 'Green Milk', size: '2 Litre', color: '#16A34A' },
  { id: 2, name: 'Blue Milk', size: '1 Litre', color: '#2563EB' },
  { id: 5, name: 'Green Milk', size: '1 Litre', color: '#16A34A' },
  { id: 3, name: 'Blue Milk', size: 'Pint', color: '#2563EB' },
  { id: 6, name: 'Green Milk', size: 'Pint', color: '#16A34A' },
];

// Colour palette for product assignment
const PRODUCT_COLORS = [
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Yellow', hex: '#CA8A04' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Pink', hex: '#DB2777' },
  { name: 'Teal', hex: '#0D9488' },
];

const DAYS = ['sun','mon','tue','wed','thu','fri','sat'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function dateStr(d) { return d.toISOString().split('T')[0]; }
function formatDate(d) {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const nth = (n) => n + (['st','nd','rd'][((n+90)%100-10)%10-1] || 'th');
  return `${days[d.getDay()]} ${nth(d.getDate())} ${months[d.getMonth()]}`;
}
function timeNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Generate 14-day history per milkman with realistic variance
function buildHistory(milkmenList = MILKMEN) {
  const data = {};
  const basesPerMilkman = [
    { 1:44,2:28,3:15,4:30,5:20,6:10 },
    { 1:40,2:25,3:12,4:28,5:18,6:9 },
    { 1:48,2:30,3:16,4:32,5:22,6:11 },
    { 1:42,2:26,3:14,4:29,5:19,6:10 },
    { 1:46,2:29,3:15,4:31,5:21,6:10 },
    { 1:38,2:24,3:13,4:27,5:17,6:9 },
    { 1:50,2:32,3:17,4:33,5:23,6:12 },
  ];
  const dayMult = { sun:0, mon:1.15, tue:1.0, wed:0.95, thu:1.0, fri:1.2, sat:1.1 };
  let seed = 42;
  const rng = () => { seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };

  milkmenList.forEach((m, mi) => {
    data[m.id] = {};
    for (let i = 1; i <= 90; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (d.getDay() === 0) continue; // skip sundays
      const dow = DAYS[d.getDay()];
      const ds = dateStr(d);
      data[m.id][ds] = {};
      PRODUCTS_INIT.forEach(p => {
        const base = basesPerMilkman[mi % basesPerMilkman.length][p.id];
        const mult = dayMult[dow];
        const out = Math.max(1, Math.round(base * mult * (0.85 + rng() * 0.3)));
        const back = Math.max(0, Math.round(out * (0.05 + rng() * 0.1)));
        const waste = Math.max(0, Math.round((out - back) * (rng() * 0.08)));
        data[m.id][ds][p.id] = { out, back, waste };
      });
    }
  });
  return data;
}

// ─── Sub-components ──────────────────────────────────────────────
function NumPad({ onPress, onDelete, onClear }) {
  const keys = [1,2,3,4,5,6,7,8,9,'',0,'del'];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, maxWidth:300, margin:'0 auto' }}>
      {keys.map((k,i) => k === '' ? <div key={i}/> : (
        <button key={i} onClick={() => k === 'del' ? onDelete() : onPress(k)}
          style={{ height:64, borderRadius:12, fontSize:28, fontWeight:800, border:'none',
            background: k === 'del' ? 'linear-gradient(135deg, #FEE2E2, #FECACA)' : '#fff',
            color: k === 'del' ? '#DC2626' : '#1E293B',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)', transition:'all 0.15s',
            active: { transform: 'scale(0.95)' } }}>
          {k === 'del' ? <X size={28}/> : k}
        </button>
      ))}
    </div>
  );
}

function PinDots({ length, filled }) {
  return (
    <div style={{ display:'flex', gap:16, justifyContent:'center', margin:'24px 0' }}>
      {Array.from({length}).map((_,i) => (
        <div key={i} style={{ width:24, height:24, borderRadius:'50%',
          background: i < filled ? '#2563EB' : '#E2E8F0', border:'none',
          transition:'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: i < filled ? 'scale(1.1)' : 'scale(1)' }} />
      ))}
    </div>
  );
}

function Stepper({ value, onChange, min = 0, max = 999, disabled }) {
  const [typing, setTyping] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <button disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width:48, height:48, borderRadius:'50%', border:'none',
          background: disabled ? '#F3F4F6' : 'linear-gradient(135deg, #f0f4f8, #ffffff)',
          fontSize:24, fontWeight:800,
          color: disabled ? '#9CA3AF' : '#1E293B', cursor: disabled ? 'default' : 'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: disabled ? 'none' : '0 2px 6px rgba(0,0,0,0.08)',
          transition:'all 0.15s' }}>
        <Minus size={20}/>
      </button>
      <>
        <input type="text" inputMode="numeric" pattern="[0-9]*" className="stepper-num"
          value={typing ? draft : value} disabled={disabled}
          onFocus={() => { setTyping(true); setDraft(''); }}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            setDraft(raw);
          }}
          onBlur={() => {
            setTyping(false);
            if (draft === '') return;
            const n = parseInt(draft, 10);
            if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.target.blur(); }
          }}
          style={{ width:72, textAlign:'center', fontSize:28, fontWeight:800,
            color: disabled ? '#9CA3AF' : '#1E293B', background: disabled ? '#F3F4F6' : (typing ? '#F0FDF4' : '#fff'),
            border: typing ? '2px solid #2563EB' : '2px solid #E2E8F0', borderRadius:10, padding:'8px 6px',
            outline:'none', transition:'all 0.15s', boxShadow: typing ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none' }}/>
      </>
      <button disabled={disabled}
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{ width:48, height:48, borderRadius:'50%', border:'none',
          background: disabled ? '#F3F4F6' : 'linear-gradient(135deg, #f0f4f8, #ffffff)',
          fontSize:24, fontWeight:800,
          color: disabled ? '#9CA3AF' : '#1E293B', cursor: disabled ? 'default' : 'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: disabled ? 'none' : '0 2px 6px rgba(0,0,0,0.08)',
          transition:'all 0.15s' }}>
        <Plus size={20}/>
      </button>
    </div>
  );
}

function BottomNav({ active, onNav }) {
  const items = [
    { icon: Home, label: 'Home', id: 'dashboard' },
    { icon: ClipboardList, label: 'Clipboards', id: 'clipboards' },
    { icon: Calculator, label: 'Order', id: 'order' },
    { icon: Clock, label: 'History', id: 'history' },
    { icon: SettingsIcon, label: 'Settings', id: 'settings' },
  ];
  return (
    <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
      width:'100%', maxWidth:430, background:'#fff', borderTop:'1px solid #E2E8F0',
      display:'flex', zIndex:50, boxShadow:'0 -2px 12px rgba(0,0,0,0.08)' }}>
      {items.map(({ icon: Icon, label, id }) => (
        <button key={id} onClick={() => onNav(id)}
          style={{ flex:1, padding:'10px 0', display:'flex', flexDirection:'column',
            alignItems:'center', gap:2, border:'none', background:'none', cursor:'pointer',
            color: active === id ? '#2563EB' : '#94A3B8',
            transition:'all 0.2s',
            borderRadius: active === id ? '12px 12px 0 0' : '0',
            background: active === id ? 'rgba(37, 99, 235, 0.05)' : 'transparent' }}>
          <Icon size={24} strokeWidth={active === id ? 2.5 : 2}/>
          <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.05em' }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    submitted: { bg:'#DCFCE7', text:'#166534', border:'#BBF7D0' },
    progress: { bg:'#DBEAFE', text:'#1E40AF', border:'#93C5FD' },
    anomaly: { bg:'#FEF3C7', text:'#92400E', border:'#FCD34D' },
    not_started: { bg:'#F1F5F9', text:'#64748B', border:'#CBD5E1' },
  };
  const labels = { submitted:'Submitted', progress:'In Progress', anomaly:'Has Anomalies', not_started:'Not Started' };
  const c = colors[status] || colors.progress;
  return (
    <span style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:800,
      background:c.bg, color:c.text, border:`1px solid ${c.border}`,
      letterSpacing:'0.05em', textTransform:'uppercase' }}>{labels[status]}</span>
  );
}

// ─── Shared UI Components (outside main to avoid remount flicker) ─
const GLOBAL_STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  input.stepper-num::-webkit-outer-spin-button,
  input.stepper-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input.stepper-num { -moz-appearance: textfield; font-variant-numeric: tabular-nums; }
  .paper-bg {
    background: #FDF6E3;
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.6) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(255,245,220,0.4) 0%, transparent 50%);
  }
  .screen-fade { animation: fadeIn 0.2s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
  .milk-gradient { background: linear-gradient(135deg, #1E3A5F 0%, #2563EB 50%, #1E3A5F 100%); }
`;

function Phone({ children, bg = '#F8FAFC' }) {
  return (
    <div style={{ maxWidth:430, margin:'0 auto', minHeight:'100vh', background:bg,
      position:'relative', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)', borderRadius: 24,
      overflow: 'hidden', border: '8px solid #f1f5f9' }}>
      <style>{GLOBAL_STYLES}</style>
      {children}
    </div>
  );
}

function Page({ children, cream, padBottom = 0 }) {
  return (
    <div style={{ minHeight:'100vh', padding:'24px 20px', paddingBottom: padBottom || 24,
      background: cream ? '#FDF6E3' : '#fff' }} className="screen-fade">{children}</div>
  );
}

function Btn({ children, onClick, color = '#2563EB', outline, disabled, full = true, style = {} }) {
  const colorMap = {
    '#16A34A': 'linear-gradient(135deg, #16A34A, #15803D)',
    '#2563EB': 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    '#DC2626': 'linear-gradient(135deg, #DC2626, #B91C1C)',
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: full ? '100%' : 'auto', padding:'16px 24px', borderRadius:14,
        fontSize:18, fontWeight:800, border: outline ? `2px solid ${color}` : 'none',
        background: outline ? 'transparent' : (disabled ? '#D1D5DB' : (colorMap[color] || color)),
        color: outline ? color : '#fff', cursor: disabled ? 'default' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        minHeight:56, boxShadow: outline ? 'none' : (disabled ? 'none' : `0 4px 12px ${color}33`),
        transition:'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        ...style }}>
      {children}
    </button>
  );
}

function BackBtn({ onClick, label = 'Back' }) {
  return (
    <button onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
        color:'#2563EB', fontWeight:800, fontSize:17, cursor:'pointer', padding:'8px 0',
        marginBottom:20, transition:'all 0.2s', letterSpacing:'-0.02em' }}>
      <ChevronLeft size={24}/> {label}
    </button>
  );
}

// ─── Main App ────────────────────────────────────────────────────
export default function MerseysideDairiesApp() {
  const today = useMemo(() => new Date(), []);
  const todayStr = dateStr(today);

  // All state at top level (React rules of hooks)
  const [screen, setScreen] = useState('welcome');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState(PRODUCTS_INIT);

  // Milkmen management — must be before anything that references milkmen
  const [milkmen, setMilkmen] = useState(MILKMEN);

  // PIN / setup
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [setupPinConfirm, setSetupPinConfirm] = useState('');
  const [setupStep, setSetupStep] = useState(1); // 1=name, 2=pin, 3=confirm

  // Clipboard data
  const history = useMemo(() => buildHistory(milkmen), [milkmen]);
  const [clipboardData, setClipboardData] = useState(() => {
    const d = {};
    milkmen.forEach(m => { d[m.id] = {}; products.forEach(p => { d[m.id][p.id] = { out: 0, back: 0, waste: 0 }; }); });
    return d;
  });
  const [confirmedAnomalies, setConfirmedAnomalies] = useState({});
  const [morningMode, setMorningMode] = useState(true);
  const [morningSnapshot, setMorningSnapshot] = useState({}); // snapshot of Taking Out values when switching to afternoon
  const [afternoonEdits, setAfternoonEdits] = useState({}); // tracks which products were edited in afternoon mode: { `${milkmanId}-${productId}`: true }
  const [submitted, setSubmitted] = useState({});

  // History flip
  const [historyOffset, setHistoryOffset] = useState(1);
  const [flipDir, setFlipDir] = useState(0); // -1 older, 1 newer, 0 none

  // Admin
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [adminNav, setAdminNav] = useState('dashboard');

  // Fridge
  const [fridgeStock, setFridgeStock] = useState(() => {
    const d = {}; PRODUCTS_INIT.forEach(p => { d[p.id] = 0; }); return d;
  });
  const [fridgeSaved, setFridgeSaved] = useState(false);

  // Order
  const [orderData, setOrderData] = useState({});
  const [emailText, setEmailText] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  // Targets
  const [orderTargets, setOrderTargets] = useState(() => {
    const t = {};
    ['mon','tue','wed','thu','fri','sat'].forEach(d => {
      t[d] = {};
      PRODUCTS_INIT.forEach(p => { t[d][p.id] = Math.round(40 + Math.random() * 60); });
    });
    return t;
  });
  const [targetDay, setTargetDay] = useState('mon');

  // Product management
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name:'', size:'', color:'#2563EB' });

  // History/reporting
  const [reportDateOffset, setReportDateOffset] = useState(0);
  const [weeklyView, setWeeklyView] = useState(false);

  // Settings
  const [supplierEmail, setSupplierEmail] = useState('supplier@dairy.co.uk');

  // Expanded clipboard accordion
  const [expandedMilkman, setExpandedMilkman] = useState(null);

  // Offline simulation
  const [offline, setOffline] = useState(false);

  // Summary confirmed
  const [summaryDone, setSummaryDone] = useState(false);

  // Headed out confirmation screen — per milkman
  const [headedOut, setHeadedOut] = useState({});

  // Absences + Round Coverage (Feature 1)
  const [absences, setAbsences] = useState({});
  const [addingMilkman, setAddingMilkman] = useState(false);
  const [newMilkmanName, setNewMilkmanName] = useState('');
  const [newMilkmanPin, setNewMilkmanPin] = useState('');

  // Close Day (Feature 4)
  const [dayClosed, setDayClosed] = useState(false);
  const [closeTime, setCloseTime] = useState(null);

  // Supplier Order History (Feature 5)
  const [orderHistory, setOrderHistory] = useState([]);

  // ─── Helpers ──────────────────────────────────────────────────
  // Returns { avg, weeks } — weeks is how many same-day data points we have
  const getAverageData = useCallback((milkmanId, productId) => {
    const h = history[milkmanId];
    if (!h) return { avg: 0, weeks: 0 };
    const dow = DAYS[today.getDay()];
    const sameDayEntries = Object.entries(h)
      .filter(([ds]) => {
        const d = new Date(ds + 'T00:00:00');
        return DAYS[d.getDay()] === dow;
      })
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 4);
    const vals = sameDayEntries.map(([,prods]) => prods[productId]?.out || 0);
    if (vals.length === 0) return { avg: 0, weeks: 0 };
    return { avg: Math.round(vals.reduce((a,b) => a+b, 0) / vals.length), weeks: vals.length };
  }, [history, today]);

  const getAverage = useCallback((milkmanId, productId) => {
    return getAverageData(milkmanId, productId).avg;
  }, [getAverageData]);

  const isAnomaly = useCallback((milkmanId, productId, value) => {
    const { avg, weeks } = getAverageData(milkmanId, productId);
    // Don't flag anomalies until we have at least 4 weeks of same-day data
    if (weeks < 4) return false;
    if (avg === 0) return false;
    // Taking 0 when you normally take something is an anomaly,
    // but only if the milkman has actually started filling in their clipboard
    if (value === 0) {
      const data = clipboardData[milkmanId];
      const hasStarted = products.some(p => (data?.[p.id]?.out || 0) > 0);
      return hasStarted;
    }
    return Math.abs(value - avg) / avg > 0.25;
  }, [getAverage]);

  const milkmanStatus = useCallback((mId) => {
    if (submitted[mId]) return 'submitted';
    const data = clipboardData[mId];
    const hasAnomaly = products.some(p => {
      const val = data?.[p.id]?.out || 0;
      return isAnomaly(mId, p.id, val) && !confirmedAnomalies[`${mId}-${p.id}`];
    });
    if (hasAnomaly) return 'anomaly';
    const hasData = products.some(p => (data?.[p.id]?.out || 0) > 0);
    return hasData ? 'progress' : 'not_started';
  }, [submitted, clipboardData, products, isAnomaly, confirmedAnomalies]);

  const navigate = useCallback((s, nav) => {
    setScreen(s);
    if (nav) setAdminNav(nav);
  }, []);

  const handleAdminNav = useCallback((id) => {
    setAdminNav(id);
    const map = { dashboard:'admin-dashboard', clipboards:'admin-clipboards',
      order:'admin-order', history:'admin-history', settings:'admin-settings' };
    setScreen(map[id]);
  }, []);

  // ─── SCREEN 18: No WiFi ──────────────────────────────────────
  if (offline) {
    return (
      <Phone>
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', padding:40, textAlign:'center' }} className="screen-fade">
          <div style={{ width:100, height:100, borderRadius:'50%', background:'rgba(100,116,139,0.08)',
            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24 }}>
            <WifiOff size={80} color="#64748B" />
          </div>
          <h2 style={{ fontSize:28, fontWeight:800, marginTop:24, color:'#1E293B',
            letterSpacing:'-0.02em' }}>
            Looks like you're not connected
          </h2>
          <p style={{ fontSize:18, color:'#64748B', marginTop:12, lineHeight:1.6 }}>
            Pop back on the depot WiFi and try again.
          </p>
          <div style={{ marginTop:32, width:'100%' }}>
            <Btn onClick={() => setOffline(false)} color="#2563EB">Try Again</Btn>
          </div>
        </div>
      </Phone>
    );
  }

  // ─── SCREEN 1: Welcome ────────────────────────────────────────
  if (screen === 'welcome') {
    return (
      <Phone bg="#fff">
        <Page>
          <div style={{ background:'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
            borderRadius:20, padding:'32px 24px', textAlign:'center', marginBottom:32,
            boxShadow:'0 8px 24px rgba(30, 58, 95, 0.15)' }}>
            <img src={LOGO_B64} alt="Merseyside Dairies" style={{ height:80, margin:'0 auto 16px' }}/>
            <h1 style={{ fontSize:32, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>
              {greeting()}!
            </h1>
            <p style={{ fontSize:18, color:'rgba(255,255,255,0.9)', marginTop:8 }}>
              Tap your name to get started
            </p>
          </div>

          {dayClosed && (
            <div style={{ background:'#FEE2E2', borderRadius:12, padding:16, marginBottom:16,
              border:'2px solid #FCA5A5', display:'flex', alignItems:'center', gap:12 }}>
              <AlertTriangle size={24} color="#DC2626"/>
              <span style={{ fontSize:14, fontWeight:700, color:'#DC2626' }}>
                Today's round is closed
              </span>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {milkmen.map((m, idx) => {
              const isOff = absences[m.id];
              const coveringMilkman = isOff ? (isOff.covering === 'john' ? 'John' : milkmen.find(mm => mm.id === isOff.covering)?.name || 'Unknown') : null;
              return (
                <button key={m.id}
                  onClick={() => { if (!dayClosed) { setCurrentUser(m); setPinEntry(''); setPinError(false); setScreen('pin'); } }}
                  disabled={dayClosed}
                  style={{ background: isOff ? '#F1F5F9' : '#fff', border:'2px solid #E2E8F0', borderRadius:14,
                    padding:'16px 20px', fontSize:20, fontWeight:700, textAlign:'left',
                    cursor: dayClosed ? 'not-allowed' : 'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
                    display:'flex', alignItems:'center', gap:12, transition:'all 0.2s',
                    position:'relative', opacity: isOff ? 0.6 : 1,
                    borderLeft:`4px solid ${isOff ? '#94A3B8' : ['#2563EB', '#16A34A'][idx % 2]}` }}>
                  <div style={{ width:40, height:40, borderRadius:'50%',
                    background: isOff ? '#CBD5E1' : ['#2563EB', '#16A34A'][idx % 2], display:'flex',
                    alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <User size={20} color="#fff"/>
                  </div>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:20, fontWeight:800, color: isOff ? '#64748B' : '#1E293B' }}>
                      {m.name}
                    </span>
                    {isOff && (
                      <div style={{ fontSize:12, color:'#64748B', fontWeight:600, marginTop:2 }}>
                        Off today — covered by {coveringMilkman}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop:28, display:'flex', flexDirection:'column', gap:12 }}>
            <Btn onClick={() => { setSetupStep(1); setSetupName(''); setSetupPin(''); setSetupPinConfirm(''); setScreen('setup'); }}
              outline color="#64748B">I'm New Here</Btn>
            <button onClick={() => { setAdminUser(''); setAdminPass(''); setScreen('admin-login'); }}
              style={{ background:'none', border:'none', color:'#2563EB', fontSize:16,
                fontWeight:700, cursor:'pointer', padding:12, letterSpacing:'-0.01em' }}>
              Admin Login
            </button>
          </div>

          {/* Demo: offline toggle */}
          <div style={{ marginTop:28, textAlign:'center' }}>
            <button onClick={() => setOffline(true)}
              style={{ background:'none', border:'1px dashed #D1D5DB', borderRadius:10,
                padding:'10px 16px', fontSize:13, color:'#94A3B8', cursor:'pointer',
                fontWeight:600, transition:'all 0.2s' }}>
              <WifiOff size={14} style={{ verticalAlign:'middle', marginRight:4 }}/> Simulate Offline
            </button>
          </div>
        </Page>
      </Phone>
    );
  }

  // ─── SCREEN 2: First-Time Setup ──────────────────────────────
  if (screen === 'setup') {
    return (
      <Phone bg="#fff">
        <Page>
          <BackBtn onClick={() => setScreen('welcome')} />
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:28, color:'#1E293B',
            letterSpacing:'-0.02em' }}>Create Your Clipboard</h2>

          {setupStep === 1 && (
            <>
              <label style={{ fontSize:16, fontWeight:700, display:'block', marginBottom:10,
                color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                What's your name?
              </label>
              <input defaultValue={setupName} onChange={e => setSetupName(e.target.value)}
                onBlur={e => setSetupName(e.target.value)}
                placeholder="e.g. John"
                style={{ width:'100%', padding:16, fontSize:20, borderRadius:12, border:'2px solid #E2E8F0',
                  boxSizing:'border-box', fontWeight:600, color:'#1E293B', transition:'all 0.2s',
                  ':focus': { borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)' } }}/>
              <div style={{ marginTop:28 }}>
                <Btn onClick={() => { if (setupName.trim()) setSetupStep(2); }}
                  disabled={!setupName.trim()} color="#16A34A">Next</Btn>
              </div>
            </>
          )}

          {setupStep === 2 && (
            <>
              <p style={{ fontSize:20, marginBottom:8, color:'#1E293B', fontWeight:700 }}>
                Choose a 4-digit PIN, {setupName}
              </p>
              <PinDots length={4} filled={setupPin.length} />
              <NumPad onPress={(k) => { if (setupPin.length < 4) setSetupPin(setupPin + k); }}
                onDelete={() => setSetupPin(setupPin.slice(0,-1))} />
              <div style={{ marginTop:28 }}>
                <Btn onClick={() => { if (setupPin.length === 4) setSetupStep(3); }}
                  disabled={setupPin.length !== 4} color="#16A34A">Next</Btn>
              </div>
            </>
          )}

          {setupStep === 3 && (
            <>
              <p style={{ fontSize:20, marginBottom:8, color:'#1E293B', fontWeight:700 }}>
                Confirm your PIN
              </p>
              <PinDots length={4} filled={setupPinConfirm.length} />
              {setupPinConfirm.length === 4 && setupPinConfirm !== setupPin && (
                <p style={{ color:'#DC2626', fontSize:18, textAlign:'center', fontWeight:700,
                  background:'#FEE2E2', padding:'12px 16px', borderRadius:10, marginBottom:20 }}>
                  PINs don't match. Try again.
                </p>
              )}
              <NumPad onPress={(k) => { if (setupPinConfirm.length < 4) setSetupPinConfirm(setupPinConfirm + k); }}
                onDelete={() => setSetupPinConfirm(setupPinConfirm.slice(0,-1))} />
              <div style={{ marginTop:28 }}>
                <Btn onClick={() => { if (setupPinConfirm === setupPin) setScreen('welcome'); }}
                  disabled={setupPinConfirm.length !== 4 || setupPinConfirm !== setupPin} color="#16A34A">
                  Create My Clipboard
                </Btn>
              </div>
            </>
          )}
        </Page>
      </Phone>
    );
  }

  // ─── SCREEN 3: PIN Entry ──────────────────────────────────────
  if (screen === 'pin' && currentUser) {
    return (
      <Phone bg="#fff">
        <Page>
          <BackBtn onClick={() => { setCurrentUser(null); setPinEntry(''); setScreen('welcome'); }} />
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:48, fontWeight:800, color:'#1E3A5F', marginBottom:8,
              letterSpacing:'-0.02em' }}>{currentUser.name}</div>
            <p style={{ fontSize:18, color:'#64748B', marginTop:4, fontWeight:600 }}>Enter your PIN</p>
          </div>

          <PinDots length={4} filled={pinEntry.length} />

          {pinError && (
            <p style={{ color:'#DC2626', fontSize:18, textAlign:'center', fontWeight:700,
              marginBottom:16, animation:'shake 0.3s', background:'#FEE2E2', padding:'12px 16px',
              borderRadius:10 }}>
              That's not right, try again
            </p>
          )}

          <NumPad
            onPress={(k) => {
              if (pinEntry.length >= 4) return;
              const next = pinEntry + k;
              setPinEntry(next);
              if (next.length === 4) {
                if (next === currentUser.pin) {
                  setPinError(false);
                  // If they already headed out, come back in afternoon mode
                  if (headedOut[currentUser.id] && morningSnapshot[currentUser.id]) {
                    setMorningMode(false);
                  } else {
                    setMorningMode(true);
                  }
                  setSummaryDone(false);
                  setScreen('clipboard');
                } else {
                  setPinError(true);
                  setTimeout(() => setPinEntry(''), 400);
                }
              }
            }}
            onDelete={() => { setPinEntry(pinEntry.slice(0,-1)); setPinError(false); }}
          />
        </Page>
      </Phone>
    );
  }

  // ─── SCREEN 4: My Clipboard — Today ──────────────────────────
  if (screen === 'clipboard' && currentUser) {
    const data = clipboardData[currentUser.id];
    const isSubmitted = submitted[currentUser.id];

    return (
      <Phone bg="#E8E0D0">
        <div style={{ minHeight:'100vh', padding:'0 12px 120px' }} className="screen-fade">
          {/* Clipboard clip at top */}
          <div style={{ display:'flex', justifyContent:'center', paddingTop:8, position:'relative', zIndex:10 }}>
            <div style={{ width:80, height:32,
              background:'linear-gradient(135deg, #78716C 0%, #57534E 50%, #78716C 100%)',
              borderRadius:'0 0 12px 12px', border:'3px solid #57534E', borderTop:'none',
              boxShadow:'0 4px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)' }}/>
          </div>

          {/* Clipboard paper */}
          <div style={{ background:'#FDF6E3', borderRadius:'0 0 16px 16px', padding:'24px 18px 28px',
            boxShadow:'0 6px 20px rgba(0,0,0,0.12)', position:'relative', marginTop:-8, minHeight:'80vh',
            backgroundImage:
              'radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.6) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,245,220,0.4) 0%, transparent 50%)' }}>

            {/* Folded corner → history */}
            <button onClick={() => { setHistoryOffset(1); setFlipDir(-1); setScreen('history'); }}
              style={{ position:'absolute', top:0, right:0, width:48, height:48, background:'none',
                border:'none', cursor:'pointer', padding:0 }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <path d="M48 0 L48 48 L0 0 Z" fill="#E8DCC8"/>
                <path d="M48 0 L48 48 L0 0 Z" fill="url(#fold)" opacity="0.3"/>
                <path d="M12 0 L48 0 L48 36 Z" fill="none" stroke="#D4C8A8" strokeWidth="1"/>
                <defs><linearGradient id="fold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#000" stopOpacity="0.1"/>
                  <stop offset="1" stopColor="#000" stopOpacity="0.3"/>
                </linearGradient></defs>
              </svg>
              <span style={{ position:'absolute', top:6, right:4, fontSize:10, color:'#92400E',
                fontWeight:800, transform:'rotate(45deg)' }}>FLIP</span>
            </button>

            {/* Header */}
            <div style={{ marginBottom:22, paddingRight:48 }}>
              <h2 style={{ fontSize:28, fontWeight:800, color:'#1E3A5F', letterSpacing:'-0.02em' }}>
                {currentUser.name}'s Clipboard
              </h2>
              <p style={{ fontSize:16, color:'#78716C', marginTop:6, fontWeight:600 }}>
                {formatDate(today)}
              </p>
            </div>

            {/* Morning/Afternoon toggle */}
            {!isSubmitted && (() => {
              const hasMorningData = products.some(p => (data[p.id]?.out || 0) > 0);
              return (
                <div style={{ display:'flex', gap:10, marginBottom:22, background:'#FBF9F4',
                  borderRadius:14, padding:3 }}>
                  <button onClick={() => setMorningMode(true)}
                    style={{ flex:1, padding:'12px 0', borderRadius:10, fontWeight:800, fontSize:16,
                      border:'none', cursor:'pointer', letterSpacing:'-0.01em',
                      background: morningMode ? '#fff' : 'transparent',
                      color: morningMode ? '#1E3A5F' : '#78716C',
                      transition:'all 0.2s',
                      boxShadow: morningMode ? '0 2px 6px rgba(0,0,0,0.08)' : 'none' }}>
                    Morning Load
                  </button>
                  <button onClick={() => {
                      if (hasMorningData) {
                        const snap = {};
                        products.forEach(p => { snap[p.id] = data[p.id]?.out || 0; });
                        setMorningSnapshot(prev => ({...prev, [currentUser.id]: snap}));
                        setMorningMode(false);
                      }
                    }}
                    disabled={!hasMorningData}
                    style={{ flex:1, padding:'12px 0', borderRadius:10, fontWeight:800, fontSize:16,
                      border:'none',
                      cursor: hasMorningData ? 'pointer' : 'not-allowed',
                      background: !morningMode ? '#fff' : 'transparent',
                      color: !hasMorningData ? '#D1D5DB' : (!morningMode ? '#1E3A5F' : '#78716C'),
                      transition:'all 0.2s',
                      boxShadow: !morningMode ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      opacity: hasMorningData ? 1 : 0.5 }}>
                    Back from Round
                  </button>
                </div>
              );
            })()}

            {/* Product list */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {products.map(p => {
                const outVal = data[p.id]?.out || 0;
                const backVal = data[p.id]?.back || 0;
                const avg = getAverage(currentUser.id, p.id);
                const anomaly = morningMode && isAnomaly(currentUser.id, p.id, outVal);
                const confirmed = confirmedAnomalies[`${currentUser.id}-${p.id}`];

                return (
                  <div key={p.id} style={{ background: anomaly ? '#FEF3C7' : '#FFFBF0',
                    borderRadius:12, padding:16, border: anomaly ? '2px solid #F59E0B' : '1px solid #E8DCC8',
                    borderLeft: `4px solid ${p.color}`,
                    backgroundColor: anomaly ? '#FEF3C7' : `${p.color}08` }}>

                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                      <div style={{ width:16, height:16, borderRadius:'50%', background:p.color, flexShrink:0 }}/>
                      <span style={{ fontSize:18, fontWeight:800, color:'#1E3A5F' }}>{p.name}</span>
                      <span style={{ fontSize:15, color:'#78716C', fontWeight:500 }}>({p.size})</span>
                    </div>

                    {/* Taking Out */}
                    {(() => {
                      const editKey = `${currentUser.id}-${p.id}`;
                      const wasEdited = afternoonEdits[editKey];
                      const snap = morningSnapshot[currentUser.id]?.[p.id];
                      return (
                        <div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <div>
                              <span style={{ fontSize:14, fontWeight:800, color:'#57534E',
                                textTransform:'uppercase', letterSpacing:'0.05em' }}>Taking Out</span>
                              {wasEdited && (
                                <span style={{ fontSize:11, fontWeight:800, color:'#fff',
                                  background:'#DC2626', padding:'2px 8px', borderRadius:4, marginLeft:8 }}>
                                  EDITED
                                </span>
                              )}
                            </div>
                            <Stepper value={outVal} disabled={isSubmitted}
                              onChange={(v) => {
                                if (!morningMode && snap !== undefined) {
                                  setAfternoonEdits(prev => ({...prev, [editKey]: v !== snap}));
                                }
                                setClipboardData(prev => {
                                  const cur = prev[currentUser.id][p.id];
                                  // Clamp brought-back so it never exceeds new taking-out
                                  const clampedBack = Math.min(cur.back || 0, v);
                                  return {
                                    ...prev, [currentUser.id]: { ...prev[currentUser.id],
                                      [p.id]: { ...cur, out: v, back: clampedBack } }
                                  };
                                });
                              }} />
                          </div>
                          {wasEdited && (
                            <p style={{ fontSize:13, color:'#DC2626', margin:'6px 0 0', fontStyle:'italic',
                              fontWeight:600 }}>
                              Was {snap} this morning
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Brought Back (afternoon) */}
                    {!morningMode && outVal > 0 && (
                      <>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14 }}>
                          <span style={{ fontSize:14, fontWeight:800, color:'#57534E',
                            textTransform:'uppercase', letterSpacing:'0.05em' }}>Brought Back</span>
                          <Stepper value={backVal} disabled={isSubmitted} max={outVal}
                            onChange={(v) => setClipboardData(prev => ({
                              ...prev, [currentUser.id]: { ...prev[currentUser.id],
                                [p.id]: { ...prev[currentUser.id][p.id], back: v } }
                            }))} />
                        </div>

                        {/* Damaged / Lost (waste) - only show if there's unaccounted product */}
                        {outVal - backVal > 0 && (
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:'#94A3B8',
                              textTransform:'uppercase', letterSpacing:'0.05em' }}>Damaged / Lost</span>
                            <Stepper value={data[p.id]?.waste || 0} disabled={isSubmitted}
                              max={outVal - backVal}
                              onChange={(v) => setClipboardData(prev => ({
                                ...prev, [currentUser.id]: { ...prev[currentUser.id],
                                  [p.id]: { ...prev[currentUser.id][p.id], waste: v } }
                              }))} />
                          </div>
                        )}
                      </>
                    )}
                    {!morningMode && outVal === 0 && (
                      <p style={{ marginTop:10, fontSize:14, color:'#9CA3AF', fontStyle:'italic',
                        fontWeight:500 }}>
                        Nothing taken out — nothing to bring back
                      </p>
                    )}

                    {/* Anomaly warning */}
                    {anomaly && !confirmed && (
                      <div style={{ marginTop:14, padding:12, background:'#FFF7ED', borderRadius:8,
                        border:'1px solid #FBBF24', display:'flex', alignItems:'center',
                        justifyContent:'space-between', gap:10 }}>
                        <p style={{ fontSize:14, color:'#92400E', margin:0, flex:1, fontWeight:600 }}>
                          <AlertTriangle size={14} style={{ verticalAlign:'middle', marginRight:4 }}/>
                          Avg ~{avg} on {['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'][today.getDay()]} (last 4 weeks)
                        </p>
                        <button onClick={() => setConfirmedAnomalies(prev => ({...prev, [`${currentUser.id}-${p.id}`]: true}))}
                          style={{ padding:'8px 14px', borderRadius:8, border:'2px solid #F59E0B',
                            background:'#FEF3C7', fontWeight:700, fontSize:13, cursor:'pointer',
                            color:'#92400E', whiteSpace:'nowrap', transition:'all 0.2s' }}>
                          That's right
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            {!isSubmitted && (
              <div style={{ marginTop:28 }}>
                {morningMode ? (
                  <Btn onClick={() => {
                    // Check for unconfirmed anomalies before heading out
                    const unconfirmed = products.filter(p => {
                      const val = data[p.id]?.out || 0;
                      return isAnomaly(currentUser.id, p.id, val) && !confirmedAnomalies[`${currentUser.id}-${p.id}`];
                    });
                    if (unconfirmed.length > 0) {
                      setScreen('confirm-anomalies');
                    } else {
                      const snap = {};
                      products.forEach(p => { snap[p.id] = clipboardData[currentUser.id][p.id]?.out || 0; });
                      setMorningSnapshot(prev => ({...prev, [currentUser.id]: snap}));
                      setHeadedOut(prev => ({...prev, [currentUser.id]: true}));
                      setScreen('headed-out');
                    }
                  }} color="#16A34A">
                    <Check size={24}/> Confirm & Head Out
                  </Btn>
                ) : (
                  <Btn onClick={() => { setSummaryDone(false); setScreen('summary'); }} color="#16A34A">
                    End of Day — Submit
                  </Btn>
                )}
              </div>
            )}

            {/* Logout */}
            <div style={{ marginTop:18 }}>
              <button onClick={() => { setCurrentUser(null); setPinEntry(''); setScreen('welcome'); }}
                style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'2px solid #D1D5DB',
                  background:'#F9FAFB', fontWeight:800, fontSize:17, cursor:'pointer',
                  color:'#6B7280', transition:'all 0.2s',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <LogOut size={18}/> Log Out
              </button>
            </div>
          </div>
        </div>
      </Phone>
    );
  }

  // ─── ANOMALY CONFIRMATION BEFORE HEAD OUT ─────────────────────
  if (screen === 'confirm-anomalies' && currentUser) {
    const data = clipboardData[currentUser.id];
    const anomalyProducts = products.filter(p => {
      const val = data[p.id]?.out || 0;
      return isAnomaly(currentUser.id, p.id, val) && !confirmedAnomalies[`${currentUser.id}-${p.id}`];
    });

    return (
      <Phone bg="#FEF3C7">
        <div style={{ minHeight:'100vh', padding:'32px 20px 40px' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ width:90, height:90, borderRadius:'50%', background:'#FDE68A',
              display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px',
              boxShadow:'0 6px 16px rgba(245, 158, 11, 0.25)' }}>
              <AlertTriangle size={48} color="#D97706"/>
            </div>
            <h2 style={{ fontSize:26, fontWeight:800, color:'#92400E', letterSpacing:'-0.02em', marginBottom:8 }}>
              Hold on, {currentUser.name}
            </h2>
            <p style={{ fontSize:17, color:'#A16207', fontWeight:600 }}>
              These amounts look unusual — are you sure?
            </p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
            {anomalyProducts.map(p => {
              const val = data[p.id]?.out || 0;
              const avg = getAverage(currentUser.id, p.id);
              return (
                <div key={p.id} style={{ background:'#fff', borderRadius:14, padding:'16px 18px',
                  border:'2px solid #FBBF24', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div style={{ width:14, height:14, borderRadius:'50%', background:p.color, flexShrink:0 }}/>
                    <span style={{ fontSize:17, fontWeight:800, color:'#1E293B' }}>{p.name}</span>
                    <span style={{ fontSize:14, color:'#78716C', fontWeight:600 }}>({p.size})</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:15, color:'#92400E', fontWeight:600 }}>
                      Taking <strong style={{ fontSize:20 }}>{val}</strong> — avg ~{avg} on {['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'][today.getDay()]} (last 4 wks)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Btn onClick={() => {
              // Confirm all anomalies and proceed to head out
              const newConfirmed = {...confirmedAnomalies};
              anomalyProducts.forEach(p => { newConfirmed[`${currentUser.id}-${p.id}`] = true; });
              setConfirmedAnomalies(newConfirmed);
              const snap = {};
              products.forEach(p => { snap[p.id] = clipboardData[currentUser.id][p.id]?.out || 0; });
              setMorningSnapshot(prev => ({...prev, [currentUser.id]: snap}));
              setHeadedOut(prev => ({...prev, [currentUser.id]: true}));
              setScreen('headed-out');
            }} color="#F59E0B" style={{ color:'#92400E' }}>
              <Check size={22}/> Yes, that's right — Head Out
            </Btn>
            <Btn onClick={() => setScreen('clipboard')} outline color="#92400E">
              <ChevronLeft size={20}/> Go Back & Fix
            </Btn>
          </div>
        </div>
      </Phone>
    );
  }

  // ─── HEADED OUT CONFIRMATION ──────────────────────────────────
  if (screen === 'headed-out' && currentUser) {
    return (
      <Phone bg="#E8E0D0">
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', padding:40, textAlign:'center' }}>
          <div style={{ width:110, height:110, borderRadius:'50%',
            background:'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:28,
            boxShadow:'0 8px 24px rgba(22, 163, 74, 0.2)' }}>
            <Check size={56} color="#16A34A"/>
          </div>
          <h2 style={{ fontSize:30, fontWeight:800, color:'#166534', letterSpacing:'-0.02em',
            marginBottom:8 }}>
            Clipboard Saved
          </h2>
          <p style={{ fontSize:20, color:'#57534E', fontWeight:600, lineHeight:1.5 }}>
            Drive safe, {currentUser.name}!
          </p>
          <p style={{ fontSize:16, color:'#78716C', marginTop:8, fontWeight:500 }}>
            When you're back, log in again to fill in what you brought back.
          </p>
          <div style={{ marginTop:36, width:'100%' }}>
            <Btn onClick={() => { setCurrentUser(null); setPinEntry(''); setScreen('welcome'); }} color="#2563EB">
              <LogOut size={20}/> Done
            </Btn>
          </div>
        </div>
      </Phone>
    );
  }

  // ─── SCREEN 5: Historical Clipboard ───────────────────────────
  if (screen === 'history' && currentUser) {
    const histDate = new Date(today);
    histDate.setDate(histDate.getDate() - historyOffset);
    const histStr = dateStr(histDate);
    const histData = history[currentUser.id]?.[histStr];

    return (
      <Phone bg="#E8E0D0">
        <div style={{ minHeight:'100vh', padding:'0 12px 40px' }} className="screen-fade">
          <div style={{ display:'flex', justifyContent:'center', paddingTop:8, position:'relative', zIndex:10 }}>
            <div style={{ width:80, height:32,
              background:'linear-gradient(135deg, #78716C 0%, #57534E 50%, #78716C 100%)',
              borderRadius:'0 0 12px 12px', border:'3px solid #57534E', borderTop:'none',
              boxShadow:'0 4px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)' }}/>
          </div>

          <div style={{ background:'#FDF6E3', borderRadius:'0 0 16px 16px', padding:'24px 18px 28px',
            boxShadow:'0 6px 20px rgba(0,0,0,0.12)', marginTop:-8, minHeight:'70vh',
            transition:'opacity 0.25s ease',
            backgroundImage:
              'radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.6) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,245,220,0.4) 0%, transparent 50%)' }}>

            {/* Navigation */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <button onClick={() => setHistoryOffset(h => h+1)}
                style={{ width:48, height:48, borderRadius:12, border:'2px solid #E2E8F0',
                  background:'#fff', cursor:'pointer', display:'flex', alignItems:'center',
                  justifyContent:'center', transition:'all 0.2s', boxShadow:'0 2px 4px rgba(0,0,0,0.06)' }}>
                <ChevronLeft size={24} color="#1E293B"/>
              </button>
              <div style={{ textAlign:'center' }}>
                <h3 style={{ fontSize:22, fontWeight:800, color:'#1E3A5F', letterSpacing:'-0.02em' }}>
                  {formatDate(histDate)}
                </h3>
                <p style={{ fontSize:13, color:'#78716C', fontWeight:600,
                  textTransform:'uppercase', letterSpacing:'0.05em', marginTop:4 }}>Read only</p>
              </div>
              <button onClick={() => { if (historyOffset > 1) setHistoryOffset(h => h-1); }}
                disabled={historyOffset <= 1}
                style={{ width:48, height:48, borderRadius:12, border:'2px solid #E2E8F0',
                  background: historyOffset <= 1 ? '#F3F4F6' : '#fff',
                  cursor: historyOffset <= 1 ? 'default' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.2s', boxShadow:'0 2px 4px rgba(0,0,0,0.06)' }}>
                <ChevronRight size={24} color={historyOffset <= 1 ? '#D1D5DB' : '#1E293B'}/>
              </button>
            </div>

            {/* Products */}
            {histData ? (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {products.map(p => {
                  const d = histData[p.id];
                  return (
                    <div key={p.id} style={{ background:'#FFFBF0', borderRadius:10, padding:14,
                      border:'1px solid #E8DCC8', borderLeft:`4px solid ${p.color}`,
                      backgroundColor: `${p.color}08` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        <div style={{ width:12, height:12, borderRadius:'50%', background:p.color }}/>
                        <span style={{ fontSize:17, fontWeight:800, color:'#1E3A5F' }}>
                          {p.name} ({p.size})
                        </span>
                      </div>
                      <div style={{ display:'flex', gap:18, fontSize:16, color:'#57534E', fontWeight:600, flexWrap:'wrap' }}>
                        <span>Out: <strong>{d?.out || 0}</strong></span>
                        <span>Back: <strong>{d?.back || 0}</strong></span>
                        {(d?.waste || 0) > 0 && <span style={{ color:'#F59E0B' }}>Damaged: <strong>{d?.waste || 0}</strong></span>}
                        <span style={{ color:'#16A34A' }}>Sold: <strong>{(d?.out || 0) - (d?.back || 0) - (d?.waste || 0)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ textAlign:'center', fontSize:18, color:'#9CA3AF', padding:40, fontWeight:500 }}>
                No data for this day (Sunday or no record)
              </p>
            )}

            <div style={{ marginTop:28 }}>
              <Btn onClick={() => setScreen('clipboard')} color="#2563EB">
                <ChevronLeft size={20}/> Back to Today
              </Btn>
            </div>
          </div>
        </div>
      </Phone>
    );
  }

  // ─── SCREEN 7: End-of-Day Summary ─────────────────────────────
  if (screen === 'summary' && currentUser) {
    const data = clipboardData[currentUser.id];

    if (summaryDone) {
      return (
        <Phone bg="#fff">
          <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', padding:40, textAlign:'center' }} className="screen-fade">
            <div style={{ width:100, height:100, borderRadius:'50%', background:'#DCFCE7',
              display:'flex', alignItems:'center', justifyContent:'center', marginBottom:28,
              boxShadow:'0 6px 16px rgba(22, 163, 74, 0.2)' }}>
              <Check size={56} color="#16A34A"/>
            </div>
            <h2 style={{ fontSize:32, fontWeight:800, color:'#166534', letterSpacing:'-0.02em' }}>
              All done for today, {currentUser.name}.
            </h2>
            <p style={{ fontSize:18, color:'#6B7280', marginTop:12, fontWeight:500 }}>
              See you tomorrow!
            </p>
            <div style={{ marginTop:36, width:'100%' }}>
              <Btn onClick={() => { setCurrentUser(null); setPinEntry(''); setScreen('welcome'); }} color="#2563EB">
                <LogOut size={20}/> Back to Start
              </Btn>
            </div>
          </div>
        </Phone>
      );
    }

    return (
      <Phone bg="#fff">
        <Page cream>
          <BackBtn onClick={() => setScreen('clipboard')} />
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:4, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>
            Your Day, {currentUser.name}
          </h2>
          <p style={{ fontSize:16, color:'#78716C', marginBottom:24, fontWeight:600 }}>
            {formatDate(today)}
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
            {products.map(p => {
              const out = data[p.id]?.out || 0;
              const back = data[p.id]?.back || 0;
              const waste = data[p.id]?.waste || 0;
              const sold = out - back - waste;
              const anomaly = isAnomaly(currentUser.id, p.id, out) && out > 0;
              const wasEdited = afternoonEdits[`${currentUser.id}-${p.id}`];
              const origVal = morningSnapshot[currentUser.id]?.[p.id];
              return (
                <div key={p.id} style={{
                  background: wasEdited ? '#FEE2E2' : (anomaly ? '#FEF3C7' : '#FFFBF0'),
                  borderRadius:12, padding:16,
                  border: wasEdited ? '2px solid #FCA5A5' : (anomaly ? '2px solid #F59E0B' : '1px solid #E8DCC8'),
                  borderLeft: `4px solid ${p.color}`,
                  backgroundColor: wasEdited ? '#FEE2E2' : (anomaly ? '#FEF3C7' : `${p.color}08`) }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <div style={{ width:14, height:14, borderRadius:'50%', background:p.color }}/>
                    <span style={{ fontSize:18, fontWeight:800, color:'#1E3A5F' }}>
                      {p.name} ({p.size})
                    </span>
                    {wasEdited && (
                      <span style={{ fontSize:11, fontWeight:800, color:'#fff',
                        background:'#DC2626', padding:'2px 8px', borderRadius:4 }}>EDITED</span>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:20, fontSize:17, fontWeight:700, color:'#1E3A5F', flexWrap:'wrap' }}>
                    <span>Out: <strong>{out}</strong></span>
                    <span>Back: <strong>{back}</strong></span>
                    {waste > 0 && <span style={{ color:'#F59E0B' }}>Damaged: <strong>{waste}</strong></span>}
                    <span style={{ color: sold > 0 ? '#16A34A' : '#DC2626' }}>
                      Sold: <strong>{sold}</strong>
                    </span>
                  </div>
                  {wasEdited && origVal !== undefined && (
                    <p style={{ fontSize:13, color:'#DC2626', margin:'8px 0 0', fontStyle:'italic',
                      fontWeight:600 }}>
                      Morning value was {origVal}, changed to {out} after round
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:28 }}>
            <Btn onClick={() => { setSubmitted(prev => ({...prev, [currentUser.id]: true})); setSummaryDone(true); }}
              color="#16A34A">
              <Check size={24}/> Confirm & Submit
            </Btn>
          </div>
        </Page>
      </Phone>
    );
  }

  // ─── SCREEN 8: Admin Login ────────────────────────────────────
  if (screen === 'admin-login') {
    return (
      <Phone bg="#fff">
        <Page>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div style={{ background:'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
              borderRadius:20, padding:'28px 24px', marginBottom:0 }}>
              <img src={LOGO_B64} alt="Merseyside Dairies" style={{ height:70, margin:'0 auto 12px' }}/>
              <h2 style={{ fontSize:32, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>
                Admin Login
              </h2>
            </div>
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:16, fontWeight:700, display:'block', marginBottom:8,
              color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Username
            </label>
            <input defaultValue="john" placeholder="Username"
              style={{ width:'100%', padding:16, fontSize:18, borderRadius:12, border:'2px solid #E2E8F0',
                boxSizing:'border-box', fontWeight:600, color:'#1E293B', transition:'all 0.2s' }}/>
          </div>

          <div style={{ marginBottom:28 }}>
            <label style={{ fontSize:16, fontWeight:700, display:'block', marginBottom:8,
              color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Password
            </label>
            <input type="password" defaultValue="admin" placeholder="Password"
              style={{ width:'100%', padding:16, fontSize:18, borderRadius:12, border:'2px solid #E2E8F0',
                boxSizing:'border-box', fontWeight:600, color:'#1E293B', transition:'all 0.2s' }}/>
          </div>

          <Btn onClick={() => { setIsAdmin(true); setAdminNav('dashboard'); setScreen('admin-dashboard'); }}
            color="#2563EB">
            <Lock size={20}/> Log In
          </Btn>

          <p style={{ textAlign:'center', marginTop:12, fontSize:13, color:'#9CA3AF', fontWeight:600 }}>
            (Demo: tap Log In to enter)
          </p>

          <div style={{ marginTop:28, textAlign:'center' }}>
            <button onClick={() => setScreen('welcome')}
              style={{ background:'none', border:'none', color:'#2563EB', fontSize:17,
                fontWeight:700, cursor:'pointer', letterSpacing:'-0.01em' }}>
              Back to Milkman View
            </button>
          </div>
        </Page>
      </Phone>
    );
  }

  // ─── SCREEN 9: Admin Dashboard ────────────────────────────────
  if (isAdmin && screen === 'admin-dashboard') {
    const workingMilkmen = milkmen.filter(m => !absences[m.id]);
    const confirmedCount = workingMilkmen.filter(m => headedOut[m.id] || submitted[m.id]).length;
    const submittedCount = workingMilkmen.filter(m => submitted[m.id]).length;
    const anomalyCount = workingMilkmen.filter(m => milkmanStatus(m.id) === 'anomaly').length;

    return (
      <Phone bg="#F8FAFC">
        <div style={{ padding:'24px 20px 100px' }} className="screen-fade">
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:32, fontWeight:800, color:'#1E3A5F', letterSpacing:'-0.02em' }}>
              Morning, John
            </h2>
            <p style={{ fontSize:16, color:'#64748B', fontWeight:600, marginTop:6 }}>
              {formatDate(today)}
            </p>
          </div>

          {Object.keys(absences).length > 0 && (
            <div style={{ background:'#F3E8FF', borderRadius:12, padding:14, marginBottom:16,
              border:'2px solid #E9D5FF' }}>
              <p style={{ fontSize:13, fontWeight:800, color:'#6B21A8', margin:0 }}>
                OFF TODAY: {Object.entries(absences).map(([mId, abs]) => {
                  const m = milkmen.find(mm => mm.id === parseInt(mId));
                  const cover = abs.covering === 'john' ? 'John' : milkmen.find(mm => mm.id === abs.covering)?.name;
                  return `${m?.name} (→ ${cover})`;
                }).join(', ')}
              </p>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <button onClick={() => navigate('admin-clipboards','clipboards')}
              style={{ background:'linear-gradient(135deg, #EFF6FF, #DBEAFE)', padding:20, borderRadius:16,
                border:'2px solid #93C5FD', cursor:'pointer', textAlign:'left', transition:'all 0.2s',
                boxShadow:'0 4px 12px rgba(37, 99, 235, 0.1)' }}>
              <ClipboardList size={32} color="#2563EB"/>
              <div style={{ fontSize:32, fontWeight:800, color:'#1E3A5F', marginTop:12,
                letterSpacing:'-0.02em' }}>{confirmedCount}/{workingMilkmen.length}</div>
              <div style={{ fontSize:13, color:'#64748B', fontWeight:800,
                textTransform:'uppercase', letterSpacing:'0.05em' }}>
                {submittedCount > 0 ? `Confirmed (${submittedCount} finished)` : 'Clipboards In'}
              </div>
            </button>

            <button onClick={() => navigate('admin-clipboards','clipboards')}
              style={{ background:'linear-gradient(135deg, #FFFBEB, #FEF3C7)', padding:20, borderRadius:16,
                border:'2px solid #FCD34D', cursor:'pointer', textAlign:'left', transition:'all 0.2s',
                boxShadow:'0 4px 12px rgba(245, 158, 11, 0.1)' }}>
              <AlertTriangle size={32} color="#D97706"/>
              <div style={{ fontSize:32, fontWeight:800, color:'#92400E', marginTop:12,
                letterSpacing:'-0.02em' }}>{anomalyCount}</div>
              <div style={{ fontSize:14, color:'#64748B', fontWeight:800,
                textTransform:'uppercase', letterSpacing:'0.05em' }}>Anomalies</div>
            </button>

            <button onClick={() => navigate('admin-fridge','dashboard')}
              style={{ background:'linear-gradient(135deg, #F5F3FF, #EDE9FE)', padding:20, borderRadius:16,
                border:'2px solid #C4B5FD', cursor:'pointer', textAlign:'left', transition:'all 0.2s',
                boxShadow:'0 4px 12px rgba(124, 58, 237, 0.1)' }}>
              <Package size={32} color="#7C3AED"/>
              <div style={{ fontSize:18, fontWeight:800, color:'#5B21B6', marginTop:12 }}>
                {fridgeSaved ? `Done at ${timeNow()}` : 'Not yet entered'}
              </div>
              <div style={{ fontSize:14, color:'#64748B', fontWeight:800,
                textTransform:'uppercase', letterSpacing:'0.05em' }}>Fridge Count</div>
            </button>

            <button onClick={() => navigate('admin-order','order')}
              style={{ background:'linear-gradient(135deg, #F0FDF4, #DCFCE7)', padding:20, borderRadius:16,
                border:'2px solid #86EFAC', cursor:'pointer', textAlign:'left', transition:'all 0.2s',
                boxShadow:'0 4px 12px rgba(22, 163, 74, 0.1)' }}>
              <Mail size={32} color="#16A34A"/>
              <div style={{ fontSize:18, fontWeight:800, color:'#166534', marginTop:12 }}>
                {orderSent ? 'Sent' : 'Not yet placed'}
              </div>
              <div style={{ fontSize:14, color:'#64748B', fontWeight:800,
                textTransform:'uppercase', letterSpacing:'0.05em' }}>Today's Order</div>
            </button>
          </div>

          {submittedCount > 0 && !dayClosed && (
            <div style={{ marginTop:16 }}>
              <button onClick={() => {
                if (confirm('Close the day? Milkmen will no longer be able to edit their clipboards.')) {
                  setDayClosed(true);
                  setCloseTime(timeNow());
                }
              }}
                style={{ width:'100%', background:'linear-gradient(135deg, #FCA5A5, #F87171)',
                  color:'#fff', border:'none', borderRadius:12, padding:16, fontSize:16,
                  fontWeight:800, cursor:'pointer', transition:'all 0.2s',
                  boxShadow:'0 4px 12px rgba(220, 38, 38, 0.3)' }}>
                <Check size={18} style={{ verticalAlign:'middle', marginRight:8 }}/>
                Close Day
              </button>
            </div>
          )}

          {dayClosed && closeTime && (
            <div style={{ marginTop:16, textAlign:'center' }}>
              <p style={{ fontSize:13, color:'#64748B', fontWeight:700, marginBottom:8 }}>
                Closed at {closeTime}
              </p>
              <button onClick={() => {
                setDayClosed(false);
                setCloseTime(null);
              }}
                style={{ background:'#F1F5F9', color:'#2563EB', border:'2px solid #CBD5E1',
                  borderRadius:10, padding:12, fontSize:14, fontWeight:700, cursor:'pointer',
                  transition:'all 0.2s' }}>
                Reopen Day
              </button>
            </div>
          )}

          <button onClick={() => navigate('admin-order-history','history')}
            style={{ width:'100%', marginTop:12, background:'none', border:'2px solid #E2E8F0',
              color:'#2563EB', borderRadius:10, padding:12, fontSize:14, fontWeight:700,
              cursor:'pointer', transition:'all 0.2s' }}>
            📋 Order History
          </button>
        </div>
        <BottomNav active={adminNav} onNav={handleAdminNav}/>
      </Phone>
    );
  }

  // ─── SCREEN 10: Fridge Stock Entry ────────────────────────────
  if (isAdmin && screen === 'admin-fridge') {
    return (
      <Phone bg="#fff">
        <div style={{ padding:'24px 20px 100px' }} className="screen-fade">
          <BackBtn onClick={() => navigate('admin-dashboard','dashboard')} />
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:6, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>Fridge Count</h2>
          <p style={{ fontSize:16, color:'#64748B', marginBottom:24, fontWeight:600 }}>
            Count what's left after the lads have loaded
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {products.map(p => (
              <div key={p.id} style={{ background:'#F8FAFC', borderRadius:12, padding:16,
                border:'2px solid #E2E8F0', borderLeft:`4px solid ${p.color}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background:p.color }}/>
                  <span style={{ fontSize:18, fontWeight:800, color:'#1E3A5F' }}>
                    {p.name} ({p.size})
                  </span>
                </div>
                <Stepper value={fridgeStock[p.id] || 0}
                  onChange={(v) => setFridgeStock(prev => ({...prev, [p.id]: v}))} />
              </div>
            ))}
          </div>

          <div style={{ marginTop:28 }}>
            <Btn onClick={() => { setFridgeSaved(true); navigate('admin-dashboard','dashboard'); }}
              color="#16A34A">
              <Check size={24}/> Save Fridge Count
            </Btn>
          </div>
        </div>
        <BottomNav active={adminNav} onNav={handleAdminNav}/>
      </Phone>
    );
  }

  // ─── SCREEN 11: All Clipboards View ───────────────────────────
  if (isAdmin && screen === 'admin-clipboards') {
    const totals = {};
    products.forEach(p => { totals[p.id] = { out:0, back:0, waste:0 }; });
    milkmen.forEach(m => {
      if (absences[m.id]) return; // Skip absent milkmen
      products.forEach(p => {
        totals[p.id].out += clipboardData[m.id]?.[p.id]?.out || 0;
        totals[p.id].back += clipboardData[m.id]?.[p.id]?.back || 0;
        totals[p.id].waste += clipboardData[m.id]?.[p.id]?.waste || 0;
      });
    });

    return (
      <Phone bg="#F8FAFC">
        <div style={{ padding:'24px 20px 100px' }} className="screen-fade">
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:24, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>Today's Clipboards</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {milkmen.map(m => {
              if (absences[m.id]) return null;
              const status = milkmanStatus(m.id);
              const expanded = expandedMilkman === m.id;
              return (
                <div key={m.id} style={{ background:'#fff', borderRadius:12, overflow:'hidden',
                  border:'2px solid #E2E8F0', boxShadow:'0 2px 4px rgba(0,0,0,0.04)' }}>
                  <button onClick={() => setExpandedMilkman(expanded ? null : m.id)}
                    style={{ width:'100%', padding:'16px 20px', display:'flex', alignItems:'center',
                      justifyContent:'space-between', background:'none', border:'none', cursor:'pointer',
                      transition:'all 0.2s' }}>
                    <span style={{ fontSize:20, fontWeight:800, color:'#1E3A5F' }}>{m.name}</span>
                    <StatusBadge status={status}/>
                  </button>
                  {expanded && (
                    <div style={{ padding:'0 20px 16px', background:'#F8FAFC' }}>
                      {products.map(p => {
                        const d = clipboardData[m.id]?.[p.id] || { out:0, back:0, waste:0 };
                        const anomaly = isAnomaly(m.id, p.id, d.out);
                        const wasEdited = afternoonEdits[`${m.id}-${p.id}`];
                        const origVal = morningSnapshot[m.id]?.[p.id];
                        const sold = d.out - d.back - (d.waste || 0);
                        return (
                          <div key={p.id} style={{
                            padding: '12px 12px',
                            borderBottom:'1px solid #E2E8F0',
                            background: wasEdited ? '#FEE2E2' : (anomaly ? '#FEF3C7' : 'transparent'),
                            borderRadius: (anomaly || wasEdited) ? 8 : 0,
                            borderLeft: (anomaly || wasEdited) ? `4px solid ${p.color}` : 'none',
                            marginBottom: (anomaly || wasEdited) ? 8 : 0 }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ width:10, height:10, borderRadius:'50%', background:p.color }}/>
                                <span style={{ fontSize:16, fontWeight:700, color:'#1E293B' }}>
                                  {p.name} ({p.size})
                                </span>
                                {wasEdited && (
                                  <span style={{ fontSize:11, fontWeight:800, color:'#fff',
                                    background:'#DC2626', padding:'1px 6px', borderRadius:3 }}>EDITED</span>
                                )}
                              </div>
                              <div style={{ display:'flex', gap:14, fontSize:15, fontWeight:700, color:'#1E293B' }}>
                                <span>Out: {d.out}</span>
                                <span>Back: {d.back}</span>
                                {d.waste > 0 && <span style={{ color:'#F59E0B', fontSize:13 }}>Damaged: {d.waste}</span>}
                                <span style={{ color:'#16A34A' }}>Sold: {sold}</span>
                              </div>
                            </div>
                            {wasEdited && origVal !== undefined && (
                              <p style={{ fontSize:12, color:'#DC2626', margin:'6px 0 0',
                                fontStyle:'italic', fontWeight:600 }}>
                                Morning value was {origVal}, changed to {d.out} after round
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div style={{ background:'#1E3A5F', borderRadius:14, padding:18, marginTop:20,
            boxShadow:'0 6px 16px rgba(30, 58, 95, 0.15)' }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:14,
              textTransform:'uppercase', letterSpacing:'0.05em' }}>Daily Totals</h3>
            {products.map(p => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0',
                borderBottom:'1px solid rgba(255,255,255,0.1)', fontSize:14, fontWeight:700 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:p.color }}/>
                  <span style={{ color:'#CBD5E1' }}>{p.name} ({p.size})</span>
                </div>
                <span style={{ color:'#fff' }}>
                  Out: {totals[p.id].out} | Back: {totals[p.id].back} | Waste: {totals[p.id].waste} | Sold: {totals[p.id].out - totals[p.id].back - totals[p.id].waste}
                </span>
              </div>
            ))}
          </div>
        </div>
        <BottomNav active={adminNav} onNav={handleAdminNav}/>
      </Phone>
    );
  }

  // ─── SCREEN 12: Order Calculator ──────────────────────────────
  if (isAdmin && screen === 'admin-order') {
    const dow = DAYS[today.getDay()] || 'mon';

    return (
      <Phone bg="#F8FAFC">
        <div style={{ padding:'24px 20px 100px' }} className="screen-fade">
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:24, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>Order Calculator</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {products.map(p => {
              const inFridge = fridgeStock[p.id] || 0;
              const returned = milkmen.reduce((s, m) => s + (clipboardData[m.id]?.[p.id]?.back || 0), 0);
              const onHand = inFridge + returned;
              // Tomorrow's day for target lookup
              const tomorrowDate = new Date(today); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
              const tomorrowDow = DAYS[tomorrowDate.getDay()] || 'mon';
              const target = orderTargets[tomorrowDow]?.[p.id] || 50;
              const suggested = Math.max(0, target - onHand);
              const current = orderData[p.id] ?? suggested;

              return (
                <div key={p.id} style={{ background:'#fff', borderRadius:12, padding:16,
                  borderLeft:`4px solid ${p.color}`, border:'2px solid #E2E8F0',
                  boxShadow:'0 2px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', background:p.color }}/>
                    <span style={{ fontSize:18, fontWeight:800, color:'#1E3A5F' }}>
                      {p.name} ({p.size})
                    </span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:14,
                    color:'#64748B', marginBottom:12, fontWeight:600 }}>
                    <span>Tomorrow's Target: <strong style={{ color:'#1E293B' }}>{target}</strong></span>
                    <span>In Fridge: <strong style={{ color:'#1E293B' }}>{inFridge}</strong></span>
                    <span>On Hand: <strong style={{ color:'#1E293B' }}>{onHand}</strong></span>
                    <span>Returned: <strong style={{ color:'#1E293B' }}>{returned}</strong></span>
                  </div>
                  <div style={{ background:'#EFF6FF', padding:10, borderRadius:10, marginBottom:12,
                    fontSize:15, fontWeight:800, color:'#1E40AF', textAlign:'center',
                    border:'2px solid #BFDBFE' }}>
                    Need to order: {suggested}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:16, fontWeight:800, color:'#1E293B' }}>Your Order:</span>
                    <Stepper value={current}
                      onChange={(v) => setOrderData(prev => ({...prev, [p.id]: v}))} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:28 }}>
            <Btn onClick={() => {
              const tomorrowDate = new Date(today); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
              const tomorrowDow = DAYS[tomorrowDate.getDay()] || 'mon';
              const lines = products.map(p => {
                const inFridge = fridgeStock[p.id] || 0;
                const returned = milkmen.reduce((s, m) => s + (clipboardData[m.id]?.[p.id]?.back || 0), 0);
                const onHand = inFridge + returned;
                const target = orderTargets[tomorrowDow]?.[p.id] || 50;
                const suggested = Math.max(0, target - onHand);
                const qty = orderData[p.id] ?? suggested;
                return `- ${p.name} (${p.size}): ${qty}`;
              }).join('\n');
              setEmailText(`Hi,\n\nPlease find our order for delivery tomorrow morning:\n\n${lines}\n\nThanks,\nJohn\nMerseyside Dairies`);
              setOrderSent(false);
              setScreen('admin-order-email');
            }} color="#2563EB">
              <Mail size={20}/> Generate Order Email
            </Btn>
            <div style={{ marginTop:12 }}>
              <Btn onClick={() => setScreen('admin-products')} outline color="#64748B">
                <Package size={18}/> Add / Remove Products
              </Btn>
            </div>
          </div>
        </div>
        <BottomNav active={adminNav} onNav={handleAdminNav}/>
      </Phone>
    );
  }

  // ─── SCREEN 13: Order Email Draft ─────────────────────────────
  if (isAdmin && screen === 'admin-order-email') {
    return (
      <Phone bg="#fff">
        <div style={{ padding:'24px 20px', display:'flex', flexDirection:'column', minHeight:'100vh' }} className="screen-fade">
          <BackBtn onClick={() => navigate('admin-order','order')} />
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:20, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>Order Email</h2>

          <div style={{ background:'#F8FAFC', padding:14, borderRadius:12, marginBottom:18,
            border:'2px solid #E2E8F0' }}>
            <p style={{ fontSize:15, fontWeight:800, color:'#1E293B', margin:0,
              textTransform:'uppercase', letterSpacing:'0.05em' }}>To: {supplierEmail}</p>
          </div>

          {!orderSent ? (
            <>
              <textarea defaultValue={emailText} onChange={e => setEmailText(e.target.value)}
                style={{ flex:1, minHeight:300, border:'2px solid #E2E8F0', borderRadius:12,
                  padding:16, fontSize:15, fontFamily:'monospace', resize:'vertical',
                  lineHeight:1.6, boxSizing:'border-box', fontWeight:500, color:'#1E293B',
                  transition:'all 0.2s' }}/>
              <div style={{ marginTop:18, display:'flex', flexDirection:'column', gap:10 }}>
                <Btn onClick={() => {
                  const items = {};
                  products.forEach(p => {
                    items[p.id] = orderData[p.id] || 0;
                  });
                  setOrderHistory(prev => [...prev, {
                    date: formatDate(today),
                    time: timeNow(),
                    items: items,
                    email: supplierEmail
                  }]);
                  setOrderSent(true);
                }} color="#16A34A">
                  <Mail size={20}/> Send Order
                </Btn>
                <Btn onClick={() => navigate('admin-order','order')} outline color="#64748B">
                  <RefreshCw size={18}/> Redraft
                </Btn>
              </div>
            </>
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', textAlign:'center' }}>
              <div style={{ width:100, height:100, borderRadius:'50%', background:'#DCFCE7',
                display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24,
                boxShadow:'0 6px 16px rgba(22, 163, 74, 0.2)' }}>
                <Check size={56} color="#16A34A"/>
              </div>
              <h3 style={{ fontSize:28, fontWeight:800, color:'#166534', letterSpacing:'-0.02em' }}>
                Order sent!
              </h3>
              <p style={{ fontSize:16, color:'#64748B', marginTop:10, fontWeight:600 }}>
                {supplierEmail} at {timeNow()}
              </p>
              <div style={{ marginTop:28, width:'100%' }}>
                <Btn onClick={() => navigate('admin-dashboard','dashboard')} color="#2563EB">
                  Done
                </Btn>
              </div>
            </div>
          )}
        </div>
      </Phone>
    );
  }

  // ─── SCREEN 14: Order Targets Setup ───────────────────────────
  if (isAdmin && screen === 'admin-targets') {
    const dayTabs = ['mon','tue','wed','thu','fri','sat'];
    const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat'];

    return (
      <Phone bg="#fff">
        <div style={{ padding:'24px 20px 100px' }} className="screen-fade">
          <BackBtn onClick={() => navigate('admin-order','order')} />
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:18, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>Stock Targets</h2>
          <p style={{ fontSize:15, color:'#64748B', marginBottom:20, fontWeight:600 }}>
            How much of each product do you want in the fridge each morning?
          </p>

          {/* Day tabs */}
          <div style={{ display:'flex', gap:8, marginBottom:24, overflowX:'auto', paddingBottom:4 }}>
            {dayTabs.map((d,i) => (
              <button key={d} onClick={() => setTargetDay(d)}
                style={{ padding:'10px 16px', borderRadius:12, fontWeight:800, fontSize:15,
                  border:'2px solid #E2E8F0', cursor:'pointer', flexShrink:0,
                  background: targetDay === d ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : '#fff',
                  color: targetDay === d ? '#fff' : '#64748B',
                  transition:'all 0.2s', boxShadow: targetDay === d ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none',
                  letterSpacing:'-0.01em' }}>
                {dayLabels[i]}
              </button>
            ))}
          </div>

          {/* Products for selected day */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {products.map(p => (
              <div key={p.id} style={{ background:'#F8FAFC', borderRadius:12, padding:16,
                border:'2px solid #E2E8F0', borderLeft:`4px solid ${p.color}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background:p.color }}/>
                  <span style={{ fontSize:18, fontWeight:800, color:'#1E3A5F' }}>
                    {p.name} ({p.size})
                  </span>
                </div>
                <Stepper value={orderTargets[targetDay]?.[p.id] || 0}
                  onChange={(v) => setOrderTargets(prev => ({
                    ...prev, [targetDay]: { ...prev[targetDay], [p.id]: v }
                  }))} />
              </div>
            ))}
          </div>

          <div style={{ marginTop:28 }}>
            <Btn onClick={() => navigate('admin-order','order')} color="#16A34A">
              <Check size={20}/> Save Targets
            </Btn>
          </div>
        </div>
        <BottomNav active={adminNav} onNav={handleAdminNav}/>
      </Phone>
    );
  }

  // ─── SCREEN 15: Product Management ────────────────────────────
  if (isAdmin && screen === 'admin-products') {
    const colorPalette = (selected, onSelect) => (
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
        {PRODUCT_COLORS.map(c => (
          <button key={c.hex} onClick={() => onSelect(c.hex)}
            title={c.name}
            style={{ width:40, height:40, borderRadius:'50%', border: selected === c.hex ? '3px solid #1E293B' : '3px solid #E2E8F0',
              background: c.hex, cursor:'pointer', transition:'all 0.2s',
              boxShadow: selected === c.hex ? '0 0 0 3px #fff, 0 0 0 5px ' + c.hex : 'none',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
            {selected === c.hex && <Check size={18} color="#fff"/>}
          </button>
        ))}
      </div>
    );

    return (
      <Phone bg="#fff">
        <div style={{ padding:'24px 20px 100px' }} className="screen-fade">
          <BackBtn onClick={() => navigate('admin-settings','settings')} />
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:24, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>Products</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {products.map(p => (
              <div key={p.id} style={{ background:'#F8FAFC', borderRadius:12, padding:16,
                border:'2px solid #E2E8F0', borderLeft:`4px solid ${p.color}` }}>
                {editingProduct === p.id ? (
                  <div>
                    <input value={p.name} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? {...x, name: e.target.value} : x))}
                      style={{ width:'100%', padding:12, fontSize:16, borderRadius:10, border:'2px solid #E2E8F0',
                        marginBottom:10, boxSizing:'border-box', fontWeight:600, color:'#1E293B',
                        transition:'all 0.2s' }} placeholder="Product name"/>
                    <input value={p.size} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? {...x, size: e.target.value} : x))}
                      style={{ width:'100%', padding:12, fontSize:16, borderRadius:10, border:'2px solid #E2E8F0',
                        marginBottom:10, boxSizing:'border-box', fontWeight:600, color:'#1E293B',
                        transition:'all 0.2s' }} placeholder="Size"/>
                    {colorPalette(p.color, (hex) => setProducts(prev => prev.map(x => x.id === p.id ? {...x, color: hex} : x)))}
                    <div style={{ display:'flex', gap:8 }}>
                      <Btn onClick={() => setEditingProduct(null)} color="#16A34A" full={false} style={{ flex:1 }}>
                        <Check size={18}/> Done
                      </Btn>
                      <Btn onClick={() => {
                        if (confirm('Remove this product from all future clipboards?')) {
                          setProducts(prev => prev.filter(x => x.id !== p.id));
                          setEditingProduct(null);
                        }
                      }} color="#DC2626" full={false} style={{ flex:1 }}>
                        <Trash2 size={18}/> Delete
                      </Btn>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', background:p.color }}/>
                      <div>
                        <div style={{ fontSize:18, fontWeight:800, color:'#1E293B' }}>{p.name}</div>
                        <div style={{ fontSize:14, color:'#64748B', fontWeight:600, marginTop:2 }}>
                          {p.size}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setEditingProduct(p.id)}
                      style={{ padding:'8px 14px', borderRadius:10, border:'2px solid #E2E8F0',
                        background:'#fff', cursor:'pointer', fontWeight:700, fontSize:13,
                        color:'#1E293B', transition:'all 0.2s' }}>
                      <Edit3 size={16} style={{ verticalAlign:'middle', marginRight:4 }}/> Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {addingProduct ? (
            <div style={{ background:'#F0FDF4', borderRadius:12, padding:16, marginTop:18,
              border:'2px solid #86EFAC' }}>
              <input value={newProduct.name} onChange={e => setNewProduct(prev => ({...prev, name: e.target.value}))}
                placeholder="Product name" style={{ width:'100%', padding:12, fontSize:16, borderRadius:10,
                  border:'2px solid #E2E8F0', marginBottom:10, boxSizing:'border-box',
                  fontWeight:600, color:'#1E293B', transition:'all 0.2s' }}/>
              <input value={newProduct.size} onChange={e => setNewProduct(prev => ({...prev, size: e.target.value}))}
                placeholder="Size (e.g. 1 Litre)" style={{ width:'100%', padding:12, fontSize:16, borderRadius:10,
                  border:'2px solid #E2E8F0', marginBottom:10, boxSizing:'border-box',
                  fontWeight:600, color:'#1E293B', transition:'all 0.2s' }}/>
              {colorPalette(newProduct.color, (hex) => setNewProduct(prev => ({...prev, color: hex})))}
              <Btn onClick={() => {
                if (newProduct.name && newProduct.size) {
                  const id = Math.max(...products.map(p => p.id)) + 1;
                  setProducts(prev => [...prev, { ...newProduct, id }]);
                  setNewProduct({ name:'', size:'', color:'#2563EB' });
                  setAddingProduct(false);
                }
              }} color="#16A34A">
                <Check size={18}/> Add Product
              </Btn>
            </div>
          ) : (
            <div style={{ marginTop:18 }}>
              <Btn onClick={() => setAddingProduct(true)} outline color="#16A34A">
                <Plus size={20}/> Add Product
              </Btn>
            </div>
          )}
        </div>
        <BottomNav active={adminNav} onNav={handleAdminNav}/>
      </Phone>
    );
  }

  // ─── SCREEN 16: History & Reporting ───────────────────────────
  if (isAdmin && screen === 'admin-history') {
    const reportDate = new Date(today);
    reportDate.setDate(reportDate.getDate() - reportDateOffset);

    // Calculate totals from history
    const rds = dateStr(reportDate);
    let totalOut = 0, totalBack = 0;
    milkmen.forEach(m => {
      const dayData = history[m.id]?.[rds];
      if (dayData) {
        products.forEach(p => {
          totalOut += dayData[p.id]?.out || 0;
          totalBack += dayData[p.id]?.back || 0;
        });
      }
    });

    // Weekly chart data
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const ds = dateStr(d);
      let sold = 0;
      milkmen.forEach(m => {
        const dd = history[m.id]?.[ds];
        if (dd) products.forEach(p => { sold += (dd[p.id]?.out || 0) - (dd[p.id]?.back || 0) - (dd[p.id]?.waste || 0); });
      });
      weekData.push({ day: DAY_LABELS[d.getDay()], sold });
    }

    return (
      <Phone bg="#fff">
        <div style={{ padding:'24px 20px 100px' }} className="screen-fade">
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:20, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>History</h2>

          <div style={{ display:'flex', gap:10, marginBottom:24, background:'#F8FAFC',
            borderRadius:14, padding:3 }}>
            <button onClick={() => setWeeklyView(false)}
              style={{ flex:1, padding:'12px 0', borderRadius:10, fontWeight:800, fontSize:15,
                border:'none', cursor:'pointer', letterSpacing:'-0.01em',
                background: !weeklyView ? '#fff' : 'transparent',
                color: !weeklyView ? '#1E3A5F' : '#64748B',
                transition:'all 0.2s', boxShadow: !weeklyView ? '0 2px 6px rgba(0,0,0,0.08)' : 'none' }}>
              Daily
            </button>
            <button onClick={() => setWeeklyView(true)}
              style={{ flex:1, padding:'12px 0', borderRadius:10, fontWeight:800, fontSize:15,
                border:'none', cursor:'pointer', letterSpacing:'-0.01em',
                background: weeklyView ? '#fff' : 'transparent',
                color: weeklyView ? '#1E3A5F' : '#64748B',
                transition:'all 0.2s', boxShadow: weeklyView ? '0 2px 6px rgba(0,0,0,0.08)' : 'none' }}>
              Weekly
            </button>
          </div>

          {!weeklyView ? (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                <button onClick={() => setReportDateOffset(o => o+1)}
                  style={{ width:48, height:48, borderRadius:12, border:'2px solid #E2E8F0',
                    background:'#fff', cursor:'pointer', display:'flex', alignItems:'center',
                    justifyContent:'center', transition:'all 0.2s',
                    boxShadow:'0 2px 4px rgba(0,0,0,0.06)' }}>
                  <ChevronLeft size={24} color="#1E293B"/>
                </button>
                <span style={{ flex:1, textAlign:'center', fontSize:20, fontWeight:800,
                  color:'#1E293B', letterSpacing:'-0.02em' }}>
                  {formatDate(reportDate)}
                </span>
                <button onClick={() => setReportDateOffset(o => Math.max(0, o-1))}
                  disabled={reportDateOffset === 0}
                  style={{ width:48, height:48, borderRadius:12, border:'2px solid #E2E8F0',
                    background: reportDateOffset === 0 ? '#F3F4F6' : '#fff',
                    cursor: reportDateOffset === 0 ? 'default' : 'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.2s', boxShadow:'0 2px 4px rgba(0,0,0,0.06)' }}>
                  <ChevronRight size={24} color={reportDateOffset === 0 ? '#D1D5DB' : '#1E293B'}/>
                </button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:24 }}>
                <div style={{ background:'linear-gradient(135deg, #EFF6FF, #DBEAFE)', padding:16,
                  borderRadius:12, textAlign:'center', border:'2px solid #93C5FD' }}>
                  <div style={{ fontSize:32, fontWeight:800, color:'#1E40AF',
                    letterSpacing:'-0.02em' }}>{totalOut}</div>
                  <div style={{ fontSize:13, color:'#64748B', fontWeight:800,
                    textTransform:'uppercase', letterSpacing:'0.05em', marginTop:6 }}>
                    Taken Out
                  </div>
                </div>
                <div style={{ background:'linear-gradient(135deg, #FFFBEB, #FEF3C7)', padding:16,
                  borderRadius:12, textAlign:'center', border:'2px solid #FCD34D' }}>
                  <div style={{ fontSize:32, fontWeight:800, color:'#92400E',
                    letterSpacing:'-0.02em' }}>{totalBack}</div>
                  <div style={{ fontSize:13, color:'#64748B', fontWeight:800,
                    textTransform:'uppercase', letterSpacing:'0.05em', marginTop:6 }}>
                    Returned
                  </div>
                </div>
                <div style={{ background:'linear-gradient(135deg, #F0FDF4, #DCFCE7)', padding:16,
                  borderRadius:12, textAlign:'center', border:'2px solid #86EFAC' }}>
                  <div style={{ fontSize:32, fontWeight:800, color:'#166534',
                    letterSpacing:'-0.02em' }}>{totalOut - totalBack}</div>
                  <div style={{ fontSize:13, color:'#64748B', fontWeight:800,
                    textTransform:'uppercase', letterSpacing:'0.05em', marginTop:6 }}>
                    Sold
                  </div>
                </div>
              </div>

              {/* Per-product breakdown */}
              {products.map(p => {
                let pOut = 0, pBack = 0, pWaste = 0;
                milkmen.forEach(m => {
                  const dd = history[m.id]?.[rds];
                  if (dd) { pOut += dd[p.id]?.out || 0; pBack += dd[p.id]?.back || 0; pWaste += dd[p.id]?.waste || 0; }
                });
                return (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 0', borderBottom:'1px solid #E2E8F0' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:p.color }}/>
                      <span style={{ fontSize:15, fontWeight:700, color:'#1E293B' }}>
                        {p.name} ({p.size})
                      </span>
                    </div>
                    <span style={{ fontSize:15, fontWeight:800, color:'#16A34A' }}>
                      {pOut - pBack - pWaste} sold
                    </span>
                  </div>
                );
              })}
            </>
          ) : (
            <div>
              <h3 style={{ fontSize:18, fontWeight:800, marginBottom:16, color:'#1E293B',
                letterSpacing:'-0.02em' }}>Total Sold — Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weekData}>
                  <XAxis dataKey="day" tick={{ fontSize:14, fontWeight:700 }}/>
                  <YAxis tick={{ fontSize:14, fontWeight:700 }}/>
                  <Tooltip/>
                  <Bar dataKey="sold" fill="url(#barGradient)" radius={[8,8,0,0]}/>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#2563EB"/>
                      <stop offset="1" stopColor="#1D4ED8"/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <BottomNav active={adminNav} onNav={handleAdminNav}/>
      </Phone>
    );
  }

  // ─── SCREEN 17: Order History ─────────────────────────────────
  if (isAdmin && screen === 'admin-order-history') {
    return (
      <Phone bg="#fff">
        <div style={{ padding:'24px 20px 100px' }} className="screen-fade">
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:24, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>Order History</h2>

          {orderHistory.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:'#94A3B8' }}>
              <Mail size={48} style={{ margin:'0 auto 16px', display:'block' }}/>
              <p style={{ fontSize:16, fontWeight:600 }}>No orders sent yet</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {orderHistory.map((order, idx) => (
                <div key={idx} style={{ background:'#F8FAFC', borderRadius:12, padding:16,
                  border:'2px solid #E2E8F0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:16, fontWeight:800, color:'#1E3A5F' }}>
                      {order.date}
                    </span>
                    <span style={{ fontSize:13, color:'#64748B', fontWeight:600 }}>
                      {order.time}
                    </span>
                  </div>
                  <p style={{ fontSize:13, color:'#64748B', margin:'0 0 10px' }}>
                    To: {order.email}
                  </p>
                  <div style={{ background:'#fff', borderRadius:8, padding:10, fontSize:12 }}>
                    {products.map(p => {
                      const qty = order.items[p.id] || 0;
                      return qty > 0 ? (
                        <div key={p.id} style={{ display:'flex', justifyContent:'space-between',
                          padding:'4px 0', color:'#1E293B' }}>
                          <span>{p.name} ({p.size})</span>
                          <strong>{qty}</strong>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <BottomNav active={adminNav} onNav={handleAdminNav}/>
      </Phone>
    );
  }

  // ─── SCREEN 18: Settings ──────────────────────────────────────
  if (isAdmin && screen === 'admin-settings') {
    return (
      <Phone bg="#fff">
        <div style={{ padding:'24px 20px 100px' }} className="screen-fade">
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:28, color:'#1E3A5F',
            letterSpacing:'-0.02em' }}>Settings</h2>

          <div style={{ marginBottom:32 }}>
            <label style={{ fontSize:16, fontWeight:800, display:'block', marginBottom:10,
              color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Supplier Email
            </label>
            <input defaultValue={supplierEmail} onChange={e => setSupplierEmail(e.target.value)}
              style={{ width:'100%', padding:16, fontSize:16, borderRadius:12,
                border:'2px solid #E2E8F0',
                boxSizing:'border-box', fontWeight:600, color:'#1E293B', transition:'all 0.2s' }}/>
          </div>

          <div style={{ marginBottom:32, paddingBottom:24, borderBottom:'2px solid #E2E8F0' }}>
            <h3 style={{ fontSize:20, fontWeight:800, marginBottom:14, color:'#1E293B',
              letterSpacing:'-0.02em' }}>Quick Links</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <Btn onClick={() => setScreen('admin-targets')} outline color="#2563EB">
                <Calculator size={18}/> Stock Targets
              </Btn>
              <Btn onClick={() => setScreen('admin-products')} outline color="#2563EB">
                <Package size={18}/> Manage Products
              </Btn>
            </div>
          </div>

          <div style={{ marginBottom:32 }}>
            <h3 style={{ fontSize:20, fontWeight:800, marginBottom:14, color:'#1E293B',
              letterSpacing:'-0.02em' }}>Manage Milkmen</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {milkmen.map(m => (
                <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  background:'#F8FAFC', padding:'14px 16px', borderRadius:10,
                  border:'2px solid #E2E8F0' }}>
                  <div>
                    <span style={{ fontSize:18, fontWeight:800, color:'#1E293B' }}>{m.name}</span>
                    <div style={{ fontSize:12, color:'#64748B', fontWeight:600, marginTop:2 }}>PIN: {m.pin}</div>
                  </div>
                  <button onClick={() => {
                    if (confirm(`Remove ${m.name}? This cannot be undone.`)) {
                      setMilkmen(prev => prev.filter(mm => mm.id !== m.id));
                      setClipboardData(prev => {
                        const newData = {...prev};
                        delete newData[m.id];
                        return newData;
                      });
                      setSubmitted(prev => {
                        const newSubmitted = {...prev};
                        delete newSubmitted[m.id];
                        return newSubmitted;
                      });
                    }
                  }} style={{ padding:'6px 12px', borderRadius:8, border:'2px solid #FCA5A5',
                    background:'#FEE2E2', color:'#DC2626', fontWeight:800, fontSize:12,
                    cursor:'pointer', transition:'all 0.2s', letterSpacing:'-0.01em' }}>
                    <Trash2 size={13} style={{ verticalAlign:'middle', marginRight:4 }}/> Remove
                  </button>
                </div>
              ))}
            </div>

            {!addingMilkman ? (
              <button onClick={() => setAddingMilkman(true)}
                style={{ width:'100%', marginTop:12, padding:12, borderRadius:10,
                  border:'2px dashed #93C5FD', background:'#EFF6FF', color:'#2563EB',
                  fontWeight:800, fontSize:14, cursor:'pointer', transition:'all 0.2s' }}>
                <Plus size={16} style={{ verticalAlign:'middle', marginRight:6 }}/> Add Milkman
              </button>
            ) : (
              <div style={{ marginTop:12, background:'#F8FAFC', padding:14, borderRadius:10, border:'2px solid #E2E8F0' }}>
                <input defaultValue={newMilkmanName} onChange={e => setNewMilkmanName(e.target.value)}
                  placeholder="Name" style={{ width:'100%', marginBottom:10, padding:8, borderRadius:6,
                  border:'1px solid #CBD5E1', fontSize:14, boxSizing:'border-box' }}/>
                <input defaultValue={newMilkmanPin} onChange={e => setNewMilkmanPin(e.target.value)}
                  placeholder="PIN" style={{ width:'100%', marginBottom:10, padding:8, borderRadius:6,
                  border:'1px solid #CBD5E1', fontSize:14, boxSizing:'border-box' }}/>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => {
                    if (newMilkmanName.trim() && newMilkmanPin.trim()) {
                      const newId = Math.max(0, ...milkmen.map(m => m.id)) + 1;
                      const newM = { id: newId, name: newMilkmanName, pin: newMilkmanPin };
                      setMilkmen(prev => [...prev, newM]);
                      setClipboardData(prev => ({
                        ...prev,
                        [newId]: {}
                      }));
                      Object.keys(clipboardData).forEach(key => {
                        if (key !== newId) {
                          products.forEach(p => {
                            if (!clipboardData[newId][p.id]) {
                              clipboardData[newId][p.id] = { out: 0, back: 0, waste: 0 };
                            }
                          });
                        }
                      });
                      products.forEach(p => {
                        clipboardData[newId][p.id] = { out: 0, back: 0, waste: 0 };
                      });
                      setNewMilkmanName('');
                      setNewMilkmanPin('');
                      setAddingMilkman(false);
                    }
                  }} style={{ flex:1, padding:8, borderRadius:6, border:'none',
                    background:'#16A34A', color:'#fff', fontWeight:700, fontSize:13,
                    cursor:'pointer', transition:'all 0.2s' }}>
                    <Check size={14} style={{ verticalAlign:'middle', marginRight:4 }}/> Add
                  </button>
                  <button onClick={() => {
                    setNewMilkmanName('');
                    setNewMilkmanPin('');
                    setAddingMilkman(false);
                  }} style={{ flex:1, padding:8, borderRadius:6, border:'none',
                    background:'#E2E8F0', color:'#64748B', fontWeight:700, fontSize:13,
                    cursor:'pointer', transition:'all 0.2s' }}>
                    <X size={14} style={{ verticalAlign:'middle', marginRight:4 }}/> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign:'center', marginBottom:32 }}>
            <p style={{ fontSize:13, color:'#9CA3AF', fontWeight:800,
              textTransform:'uppercase', letterSpacing:'0.05em' }}>
              v1.0.0 — Merseyside Dairies Clipboard
            </p>
          </div>

          <Btn onClick={() => { setIsAdmin(false); setScreen('welcome'); }} color="#DC2626">
            <LogOut size={20}/> Log Out
          </Btn>
        </div>
        <BottomNav active={adminNav} onNav={handleAdminNav}/>
      </Phone>
    );
  }

  // ─── Fallback ─────────────────────────────────────────────────
  return (
    <Phone bg="#fff">
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:20, color:'#9CA3AF', fontWeight:700 }}>Loading...</p>
          <button onClick={() => setScreen('welcome')}
            style={{ marginTop:18, padding:'14px 28px', fontSize:18, borderRadius:12,
              background:'linear-gradient(135deg, #2563EB, #1D4ED8)', color:'#fff',
              border:'none', fontWeight:800, cursor:'pointer', transition:'all 0.2s',
              boxShadow:'0 4px 12px rgba(37, 99, 235, 0.3)' }}>
            Go Home
          </button>
        </div>
      </div>
    </Phone>
  );
}
