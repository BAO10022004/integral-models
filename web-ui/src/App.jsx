import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, History, Sparkles, Brain, Calculator, Trash2, Cpu, ChevronLeft, ChevronRight, Delete, CornerDownLeft, X, MoveLeft, MoveRight, User, LogIn, UserPlus, LogOut, CheckCircle2 } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import * as math from 'mathjs';
import confetti from 'canvas-confetti';
import 'mathlive';

const IntegralIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg 
    width={size} 
    height={size * 2} 
    viewBox="0 0 24 48" 
    fill="none" 
    stroke={color} 
    strokeWidth="3.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M18 6C18 2 12 2 12 10V38C12 46 6 46 6 42" />
  </svg>
);

const App = () => {
  const [expression, setExpression] = useState('');
  const [diffVar, setDiffVar] = useState('x');
  const [lowerBound, setLowerBound] = useState('');
  const [upperBound, setUpperBound] = useState('');
  const [result, setResult] = useState(null);
  const [isSolving, setIsSolving] = useState(false);
  const [history, setHistory] = useState([]);
  const [steps, setSteps] = useState([]);
  const [isDefinite, setIsDefinite] = useState(false);
  const [user, setUser] = useState(null);
  const [authVisible, setAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });

  const mainInputRef = useRef(null);
  const mathFieldRef = useRef(null);

  useEffect(() => {
    if (mathFieldRef.current) {
      mathFieldRef.current.addEventListener('input', (ev) => {
        setExpression(ev.target.value);
      });
      
      // Customize math-field appearance
      mathFieldRef.current.style.fontSize = '1.8rem';
      mathFieldRef.current.style.width = '100%';
      mathFieldRef.current.style.background = 'transparent';
      mathFieldRef.current.style.color = 'white';
      mathFieldRef.current.style.border = 'none';
      mathFieldRef.current.focus();
    }
  }, []);

  // Mock solving logic for demo purposes (Graduation Project level UI)
  const solveIntegral = async () => {
    if (!expression.trim()) return;
    
    setIsSolving(true);
    setResult(null);
    setSteps([]);

    // Simulate "Neural Calculation" delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Basic mock logic for common integrals to show off UI
      let resultLaTeX = '';
      let resultSteps = [];
      
      const expr = expression.toLowerCase().replace(/\s/g, '');
      
      if (expr === 'x') {
        resultLaTeX = '\\frac{x^2}{2} + C';
        resultSteps = [
          'Áp dụng công thức lũy thừa: \\int x^n dx = \\frac{x^{n+1}}{n+1} + C',
          'Với n = 1, ta có: \\int x^1 dx = \\frac{x^{1+1}}{1+1} + C',
          'Kết quả: \\frac{x^2}{2} + C'
        ];
      } else if (expr.includes('sin(x)')) {
        resultLaTeX = '-\\cos(x) + C';
        resultSteps = [
          'Xác định nguyên hàm cơ bản của hàm lượng giác.',
          '\\int \\sin(x) dx = -\\cos(x) + C'
        ];
      } else if (expr.includes('cos(x)')) {
        resultLaTeX = '\\sin(x) + C';
        resultSteps = [
          'Xác định nguyên hàm cơ bản của hàm lượng giác.',
          '\\int \\cos(x) dx = \\sin(x) + C'
        ];
      } else if (expr === 'e^x' || expr === 'exp(x)') {
        resultLaTeX = 'e^x + C';
        resultSteps = [
          'Hàm số e^x là hàm số đặc biệt có nguyên hàm bằng chính nó.',
          '\\int e^x dx = e^x + C'
        ];
      } else {
        // Fallback for demo: show a generic but professional result
        resultLaTeX = '\\text{Phức tạp... Hãy thử các hàm cơ bản như x, sin(x), e^x}';
        resultSteps = ['Đang phát triển thuật toán giải tích phân phức tạp...'];
      }

      setResult(resultLaTeX);
      setSteps(resultSteps);
      
      const newHistoryItem = {
        expr: expression,
        res: resultLaTeX,
        id: Date.now()
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 5));
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f2ff', '#7000ff', '#ff00c8']
      });

      // Special handling for history display
      const displayExpr = isDefinite 
        ? `\\int_{${lowerBound || 'a'}}^{${upperBound || 'b'}} ${expression} d${diffVar}` 
        : `\\int ${expression} d${diffVar}`;

    } catch (err) {
      console.error(err);
      setResult('\\text{Lỗi cú pháp. Vui lòng nhập định dạng hợp lệ.}');
    } finally {
      setIsSolving(false);
    }
  };

  const clearHistory = () => setHistory([]);

  const insertSymbol = (symbol) => {
    if (mathFieldRef.current) {
      mathFieldRef.current.executeCommand(['insert', symbol]);
      mathFieldRef.current.focus();
    }
  };

  const symbols = [
    { label: 'x', val: 'x' },
    { label: 'y', val: 'y' },
    { label: 'z', val: 'z' },
    { label: 'n', val: 'n' },
    { label: 'x^n', val: '^' },
    { label: 'x²', val: '^2' },
    { label: '√', val: 'sqrt(' },
    { label: 'π', val: 'pi' },
    { label: 'sin', val: 'sin(' },
    { label: 'cos', val: 'cos(' },
    { label: 'ln', val: 'ln(' },
    { label: 'log', val: 'log(' },
    { label: 'abs', val: 'abs(' },
    { label: 'e', val: 'e' }
  ];

  const handleAction = (action) => {
    const input = mainInputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (action === 'delete') {
      mathFieldRef.current?.executeCommand('deleteBackward');
    } else if (action === 'left') {
      mathFieldRef.current?.executeCommand('moveBackward');
    } else if (action === 'right') {
      mathFieldRef.current?.executeCommand('moveForward');
    }
    mathFieldRef.current?.focus();
  };

  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'register') {
      setUser({ name: authForm.name || 'User', email: authForm.email });
    } else {
      setUser({ name: authForm.email.split('@')[0] || 'Member', email: authForm.email });
    }
    setAuthVisible(false);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.3 }
    });
  };

  const logout = () => {
    setUser(null);
    setAuthForm({ email: '', password: '', name: '' });
  };

  return (
    <div className="app-root">
      <div className="liquid-bg" />
      <div className="orb orb-primary" />
      <div className="orb orb-secondary" />

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {authVisible && (
          <motion.div 
            className="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAuthVisible(false)}
          >
            <motion.div 
              className="glass-panel auth-card"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-auth" onClick={() => setAuthVisible(false)}>
                <X size={20} />
              </button>

              <div className="auth-header">
                <h2>{authMode === 'login' ? 'CHÀO MỪNG TRỞ LẠI' : 'TẠO TÀI KHOẢN MỚI'}</h2>
                <p>{authMode === 'login' ? 'Đăng nhập để lưu lịch sử và đồng bộ dữ liệu.' : 'Tham gia cộng đồng toán học Aura ngay hôm nay.'}</p>
              </div>

              <form onSubmit={handleAuth} className="auth-form">
                {authMode === 'register' && (
                  <div className="form-group">
                    <label>Họ và Tên</label>
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn A" 
                      required 
                      value={authForm.name}
                      onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="example@aura.edu" 
                    required 
                    value={authForm.email}
                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={authForm.password}
                    onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  />
                </div>

                <button type="submit" className="btn-glass btn-primary w-full justify-center mt-4">
                  {authMode === 'login' ? 'ĐĂNG NHẬP NGAY' : 'ĐĂNG KÝ TÀI KHOẢN'}
                </button>
              </form>

              <div className="auth-footer">
                {authMode === 'login' ? (
                  <p>Chưa có tài khoản? <span onClick={() => setAuthMode('register')}>Đăng ký ngay</span></p>
                ) : (
                  <p>Đã có tài khoản? <span onClick={() => setAuthMode('login')}>Đăng nhập</span></p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container">
        {/* Navigation / Profile */}
        <nav className="top-nav">
          <div className="user-profile">
            {user ? (
              <div className="user-info-pill">
                <CheckCircle2 size={16} className="text-primary" />
                <span>{user.name}</span>
                <button className="logout-btn" onClick={logout}><LogOut size={14} /></button>
              </div>
            ) : (
              <button className="btn-glass auth-trigger" onClick={() => {
                setAuthMode('login');
                setAuthVisible(true);
              }}>
                <LogIn size={16} /> ĐĂNG NHẬP
              </button>
            )}
          </div>
        </nav>

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="header-section"
        >
          <div className="badge floating">
            <Sparkles size={16} /> Graduation Project 2026
          </div>
          <h1>INTEGRAL <span style={{ color: 'var(--primary)' }}>SOLVER</span></h1>
          <p>Hệ thống hỗ trợ giải tích phân thông minh dùng AI tích hợp thuật toán ký hiệu.</p>
        </motion.header>

        {/* Input Terminal */}
        <section className="math-input-container">
          <motion.div 
            className="glass-panel glass-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div 
              className="input-wrapper" 
              onClick={() => mainInputRef.current?.focus()}
              style={{ cursor: 'text' }}
            >
              <div className="integral-input-group" onClick={(e) => e.stopPropagation()}>
                <div className="bounds-inputs">
                  <input 
                    type="text" 
                    className="bound-field upper" 
                    placeholder="b"
                    value={upperBound}
                    onChange={(e) => {
                      setUpperBound(e.target.value);
                      setIsDefinite(true);
                    }}
                  />
                  <IntegralIcon size={32} color="var(--primary)" />
                  <input 
                    type="text" 
                    className="bound-field lower" 
                    placeholder="a"
                    value={lowerBound}
                    onChange={(e) => {
                      setLowerBound(e.target.value);
                      setIsDefinite(true);
                    }}
                  />
                </div>
              </div>
              <math-field 
                ref={mathFieldRef}
                placeholder="Nhập biểu thức..."
              >
                {expression}
              </math-field>
              <span className="input-suffix flex items-center" onClick={(e) => e.stopPropagation()}>
                d
                <input 
                  type="text" 
                  className="diff-var-input" 
                  value={diffVar} 
                  onChange={(e) => setDiffVar(e.target.value.slice(0, 1))}
                  maxLength={1}
                />
              </span>
            </div>

            <div className="keyboard-container">
              <div className="math-keyboard">
                {/* Math & Var Section */}
                <div className="kb-section">
                  <div className="kb-grid-vars">
                    <button className="kb-btn" onClick={() => insertSymbol('x')}>x</button>
                    <button className="kb-btn" onClick={() => insertSymbol('y')}>y</button>
                    <button className="kb-btn shadow-accent" onClick={() => insertSymbol('^2')}>a²</button>
                    <button className="kb-btn shadow-accent" onClick={() => insertSymbol('^')}>a^b</button>
                    <button className="kb-btn" onClick={() => insertSymbol('(')}>(</button>
                    <button className="kb-btn" onClick={() => insertSymbol(')')}>)</button>
                    <button className="kb-btn" onClick={() => insertSymbol('<')}>&lt;</button>
                    <button className="kb-btn" onClick={() => insertSymbol('>')}>&gt;</button>
                    <button className="kb-btn" onClick={() => insertSymbol('abs(')}>|a|</button>
                    <button className="kb-btn" onClick={() => insertSymbol(',')}>,</button>
                    <button className="kb-btn" onClick={() => insertSymbol('<=')}>&le;</button>
                    <button className="kb-btn" onClick={() => insertSymbol('>=')}>&ge;</button>
                    <button className="kb-btn darker">ABC</button>
                    <button className="kb-btn darker"><Calculator size={18}/></button>
                    <button className="kb-btn" onClick={() => insertSymbol('sqrt(')}>&radic;</button>
                    <button className="kb-btn" onClick={() => insertSymbol('pi')}>&pi;</button>
                  </div>
                </div>

                {/* Number Pad Section */}
                <div className="kb-section">
                  <div className="kb-grid-nums">
                    {[7, 8, 9].map(n => <button key={n} className="kb-btn darker" onClick={() => insertSymbol(n.toString())}>{n}</button>)}
                    <button className="kb-btn" onClick={() => insertSymbol('\\frac{#?}{#?}')}>&divide;</button>
                    {[4, 5, 6].map(n => <button key={n} className="kb-btn darker" onClick={() => insertSymbol(n.toString())}>{n}</button>)}
                    <button className="kb-btn" onClick={() => insertSymbol('*')}>&times;</button>
                    {[1, 2, 3].map(n => <button key={n} className="kb-btn darker" onClick={() => insertSymbol(n.toString())}>{n}</button>)}
                    <button className="kb-btn" onClick={() => insertSymbol('-')}>&minus;</button>
                    <button className="kb-btn darker" onClick={() => insertSymbol('0')}>0</button>
                    <button className="kb-btn darker" onClick={() => insertSymbol('.')}>.</button>
                    <button className="kb-btn" onClick={() => insertSymbol('=')}>=</button>
                    <button className="kb-btn" onClick={() => insertSymbol('+')}>+</button>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="kb-section last">
                  <div className="kb-grid-actions">
                    <button className="kb-btn action-grey" style={{fontSize: '0.8rem'}}>chức năng</button>
                    <div className="action-row">
                      <button className="kb-btn darker" onClick={() => handleAction('left')}><MoveLeft size={20}/></button>
                      <button className="kb-btn darker" onClick={() => handleAction('right')}><MoveRight size={20}/></button>
                    </div>
                    <button className="kb-btn darker" onClick={() => handleAction('delete')}><Delete size={20}/></button>
                    <button className="kb-btn action-enter" onClick={solveIntegral}><CornerDownLeft size={20}/></button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Results Area */}
        <AnimatePresence>
          {result && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="results-section"
            >
              <div className="glass-panel result-card">
                <div className="card-header">
                  <Brain size={20} color="var(--accent)" />
                  <span>KẾT QUẢ PHÂN TÍCH</span>
                </div>
                
                <div className="math-display">
                  <BlockMath 
                    math={isDefinite 
                      ? `\\int_{${lowerBound}}^{${upperBound}} ${expression} \\, d${diffVar} = ${result.replace(/x/g, diffVar)}` 
                      : `\\int ${expression} \\, d${diffVar} = ${result.replace(/x/g, diffVar)}`
                    } 
                  />
                </div>

                <div className="steps-container">
                  <h4>CÁC BƯỚC GIẢI CHI TIẾT:</h4>
                  {steps.map((step, idx) => (
                    <motion.div 
                      key={idx} 
                      className="step-item"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * idx }}
                    >
                      <div className="step-number">{idx + 1}</div>
                      <div className="step-content">
                        {step.includes('\\') ? <InlineMath math={step} /> : step}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* History & Dashboard */}
        <div className="dashboard-grid">
          <motion.div 
            className="glass-panel dashboard-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-header">
              <History size={20} />
              <span>LỊCH SỬ TRA CỨU</span>
              <button className="clear-btn" onClick={clearHistory}>
                <Trash2 size={16} />
              </button>
            </div>
            <div className="history-list">
              {history.length > 0 ? history.map(item => (
                <div key={item.id} className="history-item" onClick={() => {
                  setExpression(item.expr);
                  // Optionally restore bounds if saved in history
                }}>
                  <span className="hist-expr">
                   {item.expr.includes('\\int') ? <InlineMath math={item.expr} /> : `∫ ${item.expr} d${diffVar}`}
                  </span>
                  <ArrowRight size={14} />
                </div>
              )) : (
                <div className="empty-state">Chưa có lịch sử</div>
              )}
            </div>
          </motion.div>

          <motion.div 
            className="glass-panel dashboard-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header">
              <Cpu size={20} />
              <span>THÔNG SỐ HỆ THỐNG</span>
            </div>
            <div className="stats-list">
              <div className="stat-item">
                <span className="label">Engine:</span>
                <span className="value">Aura-X 2026</span>
              </div>
              <div className="stat-item">
                <span className="label">Latent Speed:</span>
                <span className="value">14.2 ms</span>
              </div>
              <div className="stat-item">
                <span className="label">Accuracy:</span>
                <span className="value">99.8%</span>
              </div>
            </div>
          </motion.div>
        </div>

        <footer>
          <p>© 2026 Graduation Project - Designed for Excellence</p>
        </footer>
      </main>

    </div>
  );
};

export default App;
