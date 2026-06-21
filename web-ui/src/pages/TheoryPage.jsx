import React, { useState, useMemo, useEffect, useRef } from "react";
import Footer from "../components/common/Footer";
import LatexRenderer from "../components/ui/LatexRenderer";
import MenuOverlay from "../components/common/MenuOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Search, Compass, HelpCircle,
  Award, Copy, Check, Layers, Hash, Calculator 
} from "lucide-react";
import "katex/dist/katex.min.css";
import "../styles/KoaDesign.css";



export default function TheoryPage({ onNavigate, user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeMethodTab, setActiveMethodTab] = useState("usub");
  const [copiedId, setCopiedId] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const containerRef = useRef(null);

  // ScrollSpy to highlight the active section automatically
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // Add offset for sticky subheader

      const sections = ["home", "concept", "definition", "theorem", "properties", "formulas", "methods"];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAnchorClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100; // Offset for sticky subheader
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  // Clipboard copy handler
  const handleCopy = (latexStr, id) => {
    navigator.clipboard.writeText(latexStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // 1. Concept Data (Khái niệm)
  const concepts = [
    {
      title: "Khái niệm Nguyên hàm",
      desc: "Cho hàm số f(x) xác định trên tập K. Hàm số F(x) được gọi là nguyên hàm của f(x) trên K nếu đạo hàm của F(x) bằng f(x) với mọi x thuộc K.",
      formula: "F'(x) = f(x) \\quad \\forall x \\in K",
      tagColor: "#2ed6ff", // Neon Cyan
      badge: "Cơ sở"
    },
    {
      title: "Họ Nguyên hàm & Tích phân bất định",
      desc: "Nếu F(x) là một nguyên hàm của f(x) trên K thì mọi nguyên hàm của f(x) đều có dạng F(x) + C. Tập hợp các nguyên hàm này được gọi là tích phân bất định.",
      formula: "\\int f(x) dx = F(x) + C",
      tagColor: "#f843c2", // Magenta Pulse
      badge: "Lý thuyết"
    }
  ];

  // 2. Definition Data (Định nghĩa)
  const definitions = [
    {
      title: "Ý nghĩa Hình học (Hình thang cong)",
      desc: "Cho hàm số f(x) liên tục và không âm trên đoạn [a, b]. Tích phân xác định biểu diễn diện tích S của hình thang cong giới hạn bởi đồ thị y=f(x), trục hoành y=0 và hai đường biên x=a, x=b.",
      formula: "S = \\int_{a}^{b} f(x) dx",
      tagColor: "#a2ea13", // Lime Pop
      badge: "Hình học"
    },
    {
      title: "Định nghĩa Giới hạn Tổng Riemann",
      desc: "Tích phân xác định của hàm số f(x) trên đoạn [a, b] được định nghĩa bằng giới hạn của tổng diện tích các cột hình chữ nhật chia nhỏ khi số phân hoạch tiến ra vô hạn.",
      formula: "\\int_{a}^{b} f(x) dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*) \\Delta x_i",
      tagColor: "#2ed6ff", // Neon Cyan
      badge: "Giới hạn"
    }
  ];

  // 3. Theorems Data (Định lý)
  const theoremsData = [
    {
      title: "Định lý Newton-Leibniz",
      desc: "Định lý cơ bản nhất của Giải tích liên kết đạo hàm và tích phân, cho phép tính nhanh tích phân bằng cách lấy hiệu giá trị nguyên hàm tại hai đầu mút cận.",
      formula: "\\int_{a}^{b} f(x) dx = F(b) - F(a) = F(x) \\Big|_{a}^{b}",
      tagColor: "#f843c2", // Magenta Pulse
      badge: "Quan trọng"
    },
    {
      title: "Định lý Giá trị Trung bình Tích phân",
      desc: "Nếu f(x) liên tục trên đoạn [a, b], tồn tại một điểm c thuộc (a, b) sao cho diện tích dưới đồ thị f(x) bằng diện tích hình chữ nhật có chiều rộng (b-a) và chiều cao f(c).",
      formula: "\\int_{a}^{b} f(x) dx = f(c)(b-a) \\quad \\text{với } c \\in (a, b)",
      tagColor: "#a2ea13", // Lime Pop
      badge: "Định lý phụ"
    }
  ];

  // 4. Properties Grouped (Tính chất)
  const propertiesGrouped = {
    algebraic: {
      title: "Nhóm Tính Chất Đại Số (Algebraic)",
      items: [
        {
          name: "Tính Tuyến Tính (Linearity)",
          formula: "\\int [k \\cdot f(x) + l \\cdot g(x)] dx = k \\int f(x) dx + l \\int g(x) dx",
          desc: "Tách tổng/hiệu nguyên hàm và đưa hằng số nhân tử ra ngoài dấu tích phân."
        },
        {
          name: "Đổi Cận Tích Phân (Bounds Swap)",
          formula: "\\int_{a}^{b} f(x) dx = -\\int_{b}^{a} f(x) dx",
          desc: "Đảo ngược vị trí cận trên và cận dưới sẽ đảo ngược dấu số học của tích phân."
        },
        {
          name: "Cận Trùng Nhau (Zero Width)",
          formula: "\\int_{a}^{a} f(x) dx = 0",
          desc: "Tích phân trên khoảng rộng bằng 0 luôn cho kết quả bằng 0."
        }
      ]
    },
    geometric: {
      title: "Nhóm Tính Chất Phân Đoạn & So Sánh",
      items: [
        {
          name: "Cộng Tính Đoạn (Interval Split)",
          formula: "\\int_{a}^{b} f(x) dx = \\int_{a}^{c} f(x) dx + \\int_{c}^{b} f(x) dx",
          desc: "Tách khoảng tích phân [a, b] thành các đoạn nhỏ nối tiếp nhau (hữu ích cho hàm trị tuyệt đối)."
        },
        {
          name: "Tính So Sánh (Inequality)",
          formula: "f(x) \\ge g(x) \\implies \\int_{a}^{b} f(x) dx \\ge \\int_{a}^{b} g(x) dx",
          desc: "Nếu hàm số f luôn lớn hơn g trên [a, b] thì diện tích hình giới hạn bởi f cũng lớn hơn g."
        }
      ]
    },
    symmetry: {
      title: "Nhóm Tính Chất Đối Xứng (Symmetry)",
      items: [
        {
          name: "Tích Phân Hàm Số Lẻ",
          formula: "\\int_{-a}^{a} f(x) dx = 0 \\quad (\\text{nếu } f(-x) = -f(x))",
          desc: "Tích phân trên đoạn đối xứng quanh gốc tọa độ của hàm lẻ luôn bằng 0."
        },
        {
          name: "Tích Phân Hàm Số Chẵn",
          formula: "\\int_{-a}^{a} f(x) dx = 2 \\int_{0}^{a} f(x) dx \\quad (\\text{nếu } f(-x) = f(x))",
          desc: "Tích phân đoạn đối xứng của hàm chẵn bằng 2 lần tích phân trên nửa khoảng dương."
        }
      ]
    }
  };

  // 5. Basic Formulas (Công thức cơ bản)
  const cheatSheetFormulas = [
    { category: "basic", name: "Nguyên hàm hằng số", integral: "\\int k \\, dx", result: "kx + C", badge: "Cơ bản", color: "#2ed6ff" },
    { category: "basic", name: "Hàm lũy thừa", integral: "\\int x^n \\, dx", result: "\\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)", badge: "Cơ bản", color: "#2ed6ff" },
    { category: "basic", name: "Hàm đa thức nghịch đảo", integral: "\\int \\frac{1}{x} \\, dx", result: "\\ln|x| + C", badge: "Cơ bản", color: "#2ed6ff" },
    { category: "exp", name: "Hàm mũ tự nhiên", integral: "\\int e^x \\, dx", result: "e^x + C", badge: "Mũ / Log", color: "#f843c2" },
    { category: "exp", name: "Hàm mũ cơ số a", integral: "\\int a^x \\, dx", result: "\\frac{a^x}{\\ln a} + C", badge: "Mũ / Log", color: "#f843c2" },
    { category: "exp", name: "Hàm Logarit tự nhiên", integral: "\\int \\ln(x) \\, dx", result: "x\\ln(x) - x + C", badge: "Mũ / Log", color: "#f843c2" },
    { category: "trig", name: "Hàm Sin", integral: "\\int \\sin x \\, dx", result: "-\\cos x + C", badge: "Lượng giác", color: "#a2ea13" },
    { category: "trig", name: "Hàm Cos", integral: "\\int \\cos x \\, dx", result: "\\sin x + C", badge: "Lượng giác", color: "#a2ea13" },
    { category: "trig", name: "Hàm Tan", integral: "\\int \\tan x \\, dx", result: "-\\ln|\\cos x| + C", badge: "Lượng giác", color: "#a2ea13" },
    { category: "trig", name: "Hàm Secant bình phương", integral: "\\int \\sec^2 x \\, dx", result: "\\tan x + C", badge: "Lượng giác", color: "#a2ea13" },
    { category: "trig", name: "Hàm Cosecant bình phương", integral: "\\int \\csc^2 x \\, dx", result: "-\\cot x + C", badge: "Lượng giác", color: "#a2ea13" },
    { category: "invtrig", name: "Hàm Arcsin", integral: "\\int \\frac{1}{\\sqrt{a^2-x^2}} \\, dx", result: "\\arcsin\\left(\\frac{x}{a}\\right) + C", badge: "Lượng giác ngược", color: "#2ed6ff" },
    { category: "invtrig", name: "Hàm Arctan", integral: "\\int \\frac{1}{x^2+a^2} \\, dx", result: "\\frac{1}{a}\\arctan\\left(\\frac{x}{a}\\right) + C", badge: "Lượng giác ngược", color: "#2ed6ff" },
    { category: "hyperbolic", name: "Hàm Sinh (Sinh)", integral: "\\int \\sinh x \\, dx", result: "\\cosh x + C", badge: "Hyperbolic", color: "#f843c2" },
    { category: "hyperbolic", name: "Hàm Cosh (Cosh)", integral: "\\int \\cosh x \\, dx", result: "\\sinh x + C", badge: "Hyperbolic", color: "#f843c2" }
  ];

  // 6. Methods Data (Các phương pháp giải)
  const methods = {
    usub: {
      name: "Đổi biến số (U-Substitution)",
      formula: "\\int f(g(x)) g'(x) dx = \\int f(u) du \\quad (u = g(x))",
      desc: "Áp dụng để quy đổi một tích phân phức tạp thành dạng cơ bản thông qua phép đổi biến số thích hợp, tương tự như quy tắc đạo hàm chuỗi (chain rule) theo hướng ngược lại.",
      steps: [
        { title: "Bước 1: Chọn biểu thức u", detail: "Đặt u = g(x) (thường chọn phần trong căn, mũ, logarit hoặc đa thức mẫu số)." },
        { title: "Bước 2: Tìm vi phân hai vế", detail: "Tính đạo hàm g'(x) và biểu diễn du = g'(x)dx." },
        { title: "Bước 3: Thay đổi cận (nếu tính tích phân xác định)", detail: "Quy đổi các mốc cận của x sang mốc cận của u." },
        { title: "Bước 4: Giải tích phân & Thế ngược", detail: "Giải tích phân cơ bản theo biến u, sau đó thế ngược u = g(x) để trả kết quả (đối với tích phân bất định)." }
      ],
      example: {
        problem: "\\int 2x \\cos(x^2) dx",
        steps: [
          { text: "Đặt biến số phụ u:", latex: "u = x^2 \\implies du = 2x dx" },
          { text: "Biến đổi biểu thức nguyên hàm ban đầu:", latex: "\\int \\cos(u) du" },
          { text: "Giải tích phân cơ bản của u:", latex: "= \\sin(u) + C" },
          { text: "Trả lại biến x cho kết quả cuối cùng:", latex: "= \\sin(x^2) + C" }
        ]
      }
    },
    ibp: {
      name: "Tích phân từng phần (Integration By Parts)",
      formula: "\\int u \\, dv = u \\cdot v - \\int v \\, du",
      desc: "Sử dụng khi biểu thức tích phân chứa tích của các loại hàm số khác loại (ví dụ: đa thức nhân hàm mũ, đa thức lượng giác...). Phương pháp này là đảo ngược của quy tắc đạo hàm nhân (product rule).",
      steps: [
        { title: "Bước 1: Chọn u và dv theo thứ tự ưu tiên", detail: "Ưu tiên đặt u theo thứ tự LIATE: Logarit -> Lượng giác ngược -> Đa thức -> Mũ -> Lượng giác. dv là phần còn lại kèm dx." },
        { title: "Bước 2: Tính du và v", detail: "Tìm vi phân du = u'dx và nguyên hàm v = ∫dv." },
        { title: "Bước 3: Áp dụng công thức từng phần", detail: "Ráp vào biểu thức: u.v - ∫v.du." },
        { title: "Bước 4: Giải tích phân phụ", detail: "Giải tích phân còn lại (∫v.du) thường đã đơn giản hơn rất nhiều để ra đáp số cuối cùng." }
      ],
      example: {
        problem: "\\int x e^x dx",
        steps: [
          { text: "Đặt u theo thứ tự ưu tiên đa thức trước mũ:", latex: "u = x \\implies du = dx, \\quad dv = e^x dx \\implies v = e^x" },
          { text: "Ráp vào công thức tích phân từng phần:", latex: "= x e^x - \\int e^x dx" },
          { text: "Tính tích phân còn lại và thu gọn:", latex: "= x e^x - e^x + C" }
        ]
      }
    },
    trig: {
      name: "Lượng giác hóa (Trig Substitution)",
      formula: "x = a \\sin(t) \\implies dx = a \\cos(t) dt \\quad (\\text{cho } \\sqrt{a^2 - x^2})",
      desc: "Thay thế biến x bằng các hàm số lượng giác của biến t để triệt tiêu các căn thức khó tính, tận dụng tính chất của đẳng thức cơ bản sin²t + cos²t = 1.",
      steps: [
        { title: "Dạng √(a² - x²)", detail: "Đặt x = a.sin(t) hoặc x = a.cos(t) với t thuộc đoạn [-pi/2, pi/2]." },
        { title: "Dạng √(x² + a²)", detail: "Đặt x = a.tan(t) với t thuộc khoảng (-pi/2, pi/2)." },
        { title: "Dạng √(x² - a²)", detail: "Đặt x = a/cos(t) hoặc x = a.sec(t) để giải." }
      ],
      example: {
        problem: "\\int \\frac{1}{x^2+1} dx",
        steps: [
          { text: "Đặt x theo lượng giác:", latex: "x = \\tan(t) \\implies dx = \\sec^2(t) dt" },
          { text: "Thay vào tích phân và sử dụng đẳng thức tan²t + 1 = sec²t:", latex: "\\int \\frac{\\sec^2(t)}{\\tan^2(t)+1} dt = \\int \\frac{\\sec^2(t)}{\\sec^2(t)} dt = \\int 1 \\, dt" },
          { text: "Nguyên hàm theo t:", latex: "= t + C" },
          { text: "Trả lại biến ban đầu t = arctan(x):", latex: "= \\arctan(x) + C" }
        ]
      }
    },
    partial: {
      name: "Phân thức hữu tỷ (Partial Fractions)",
      formula: "\\frac{P(x)}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b}",
      desc: "Áp dụng cho hàm phân thức hữu tỷ có bậc tử nhỏ hơn mẫu và mẫu số phân tích được thành nhân tử. Phân tích đa thức phức tạp thành tổng các phân thức đơn giản để dễ dàng lấy logarit.",
      steps: [
        { title: "Bước 1: Phân tích mẫu số thành tích", detail: "Phân tích mẫu số thành tích các nhân tử bậc nhất hoặc bậc hai cơ bản." },
        { title: "Bước 2: Thiết lập tổng các phân thức đơn", detail: "Tách phân thức ban đầu thành tổng các phân số có tử số là hằng số A, B, C..." },
        { title: "Bước 3: Quy đồng tìm hằng số", detail: "Quy đồng mẫu số và đồng nhất hệ số ở tử số để giải hệ phương trình tìm A, B, C." },
        { title: "Bước 4: Tính nguyên hàm từng phần", detail: "Giải tích phân các phân số đơn giản bằng cách dùng nguyên hàm hàm số ln|u|." }
      ],
      example: {
        problem: "\\int \\frac{1}{x^2 - x} dx",
        steps: [
          { text: "Phân tách mẫu số và biểu diễn tổng phân số phụ:", latex: "\\frac{1}{x(x-1)} = \\frac{A}{x} + \\frac{B}{x-1}" },
          { text: "Quy đồng đồng nhất hệ số tìm A, B:", latex: "A(x-1) + Bx = 1 \\implies A = -1, \\quad B = 1" },
          { text: "Đưa về hai tích phân đơn giản:", latex: "\\int \\left( \\frac{1}{x-1} - \\frac{1}{x} \\right) dx" },
          { text: "Lấy nguyên hàm logarit tự nhiên kết hợp:", latex: "= \\ln|x-1| - \\ln|x| + C = \\ln\\left|\\frac{x-1}{x}\\right| + C" }
        ]
      }
    }
  };

  // Filter formulas based on search and category tab
  const filteredCheatSheet = useMemo(() => {
    return cheatSheetFormulas.filter((f) => {
      const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.integral.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.result.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="adora-theme w-full min-h-screen bg-[#ffffff] text-[#353241] relative overflow-x-hidden tracking-[-0.02em]" ref={containerRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        :root {
          --color-electric-violet: #592eff;
          --color-midnight-plum: #21164c;
          --color-obsidian-charcoal: #353241;
          --color-slate-smoke: #5f5f69;
          --color-pearl-mist: #e0e0db;
          --color-soft-concrete: #eeeeee;
          --color-pure-white: #ffffff;
          --color-cotton-candy: #ffaae6;
          --font-plus-jakarta-sans: 'Plus Jakarta Sans', sans-serif;
        }
        .adora-theme {
          background-color: var(--color-pure-white);
          font-family: var(--font-plus-jakarta-sans);
          letter-spacing: -0.02em;
        }
        .math-blueprint-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(var(--color-pearl-mist) 1.2px, transparent 1.2px);
          background-size: 32px 32px;
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }
        .proof-notepad-paper {
          background-image: linear-gradient(var(--color-pearl-mist) 1px, transparent 1px), linear-gradient(90deg, var(--color-pearl-mist) 1px, transparent 1px);
          background-size: 16px 16px;
        }
        .adora-heading {
          font-family: var(--font-plus-jakarta-sans);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-midnight-plum);
        }
        .adora-body {
          font-family: var(--font-plus-jakarta-sans);
          color: var(--color-obsidian-charcoal);
          letter-spacing: -0.02em;
        }
        .adora-nav-pill {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid var(--color-pearl-mist);
          border-radius: 40px;
          padding: 8px 16px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(53, 50, 65, 0.03);
          transition: all 0.3s;
        }
        .squiggle-wrapper {
          position: relative;
          display: inline-block;
          padding-left: 6px;
          padding-right: 6px;
          z-index: 10;
        }
        .adora-input {
          background: var(--color-pure-white);
          border: 1px solid var(--color-pearl-mist);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--color-obsidian-charcoal);
          font-size: 16px;
          outline: none;
          transition: all 0.25s;
        }
        .adora-input:focus {
          border-color: var(--color-electric-violet);
          border-width: 1.5px;
          box-shadow: none;
        }
        .theory-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #eef0ff 0%, #fce4f7 35%, #e0f9ff 70%, #f0ffe0 100%);
          z-index: 0;
        }
      `}</style>

      {/* Navigation Menu (Intro style) */}
      <nav className="koa-nav" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            onClick={() => onNavigate("intro")}
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "inherit", 
              fontSize: "13px", 
              fontWeight: 700, 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              cursor: "pointer", 
              transition: "0.3s",
              opacity: 0.8,
              padding: 0
            }}
            className="hover:opacity-100"
          >
            ← Quay lại
          </button>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.3em', fontWeight: 800, opacity: 0.6 }} className="uppercase">
            Thư Viện Kiến Thức
          </span>
        </div>
        <button className="koa-menu-btn" onClick={() => setMenuOpen(true)}>
          <span className="koa-menu-line"></span>
          <span className="koa-menu-line"></span>
        </button>
      </nav>

      {/* Menu Overlay */}
      <MenuOverlay menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNavigate={onNavigate} user={user} onLogout={onLogout} />

      {/* Impressionist Painterly Wash Backdrop for Hero */}
      <div className="absolute top-0 left-0 w-full h-[100vh] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[450px] h-[450px] rounded-full bg-[#bcf2ff]/30 blur-[110px]" />
        <div className="absolute top-[35%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#ffaae6]/35 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[25%] w-[400px] h-[400px] rounded-full bg-[#dfff9d]/25 blur-[100px]" />
      </div>

      {/* Sticky Table of Contents Floating Nav Pill */}
      <div className="relative z-40 max-w-4xl mx-auto my-6 sticky top-[24px] px-6">
        <div className="adora-nav-pill flex items-center justify-center gap-1.5 md:gap-4 flex-wrap">
          {[
            { id: "home", label: "Trang chủ" },
            { id: "concept", label: "Khái niệm" },
            { id: "definition", label: "Định nghĩa" },
            { id: "theorem", label: "Định lý" },
            { id: "properties", label: "Tính chất" },
            { id: "formulas", label: "Công thức" },
            { id: "methods", label: "Phương pháp" }
          ].map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              onClick={(e) => handleAnchorClick(e, sec.id)}
              className={`px-4 py-2 rounded-[40px] text-[15px] font-medium transition-all no-underline tracking-[-0.02em] ${
                activeSection === sec.id
                  ? "text-white bg-[#592eff] font-bold"
                  : "text-[#353241] hover:text-[#21164c] hover:bg-[#eeeeee]"
              }`}
            >
              {sec.label}
            </a>
          ))}
        </div>
      </div>

      {/* ================= SESSION 1: TRANG CHỦ ================= */}
      <section 
        id="home" 
        className="relative w-full overflow-hidden flex items-center justify-center text-center scroll-mt-36 z-10 px-6"
        style={{ width: "100%", height: "100vh", margin: "0 auto" }}
      >
        {/* CSS Gradient Background */}
        <div className="theory-hero-bg" />
        <div className="absolute inset-0 math-blueprint-grid opacity-30 pointer-events-none z-10" />

        {/* Floating color orbs */}
        <div className="absolute top-[10%] left-[8%] w-[420px] h-[420px] rounded-full bg-[#bcf2ff]/40 blur-[110px] pointer-events-none z-[1]" />
        <div className="absolute top-[30%] right-[5%] w-[480px] h-[480px] rounded-full bg-[#ffaae6]/35 blur-[120px] pointer-events-none z-[1]" />
        <div className="absolute bottom-[8%] left-[22%] w-[380px] h-[380px] rounded-full bg-[#dfff9d]/25 blur-[100px] pointer-events-none z-[1]" />

        {/* Content container */}
        <div className="relative z-20 max-w-4xl w-full mx-auto px-8 py-10 md:py-16 bg-white/80 backdrop-blur-md border border-[#e0e0db] rounded-[64px] shadow-[0_24px_60px_rgba(33,22,76,0.07)] flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[200px] border border-[#592eff]/30 text-[#592eff] text-xs font-semibold mb-6 md:mb-8 uppercase tracking-wider bg-[#592eff]/5"
          >
            <span>✦</span>
            <span>Thư viện Học tập tích phân chuẩn hóa</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[36px] md:text-[56px] font-bold tracking-[-0.02em] leading-[1.1] mb-6 md:mb-8 text-[#21164c] font-sans"
          >
            Thư Viện Kiến Thức <br />
            <span style={{ color: "#592eff" }}>Giải Tích Phân</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="adora-body text-sm md:text-base leading-[1.6] mb-8 md:mb-10 max-w-xl mx-auto text-[#5f5f69]"
          >
            Nơi tổng hợp toàn bộ tri thức toán học từ định lý nguyên hàm nền tảng, định nghĩa Riemann, tính chất đại số đến các phương pháp giải tích phân nâng cao do AI mô hình hóa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <a
              href="#concept"
              onClick={(e) => handleAnchorClick(e, "concept")}
              className="px-6 py-3 bg-[#592eff] text-white hover:bg-[#4b24e6] text-base font-bold rounded-lg transition-all cursor-pointer text-center no-underline hover:-translate-y-0.5 shadow-sm"
            >
              Bắt đầu học
            </a>
            <a
              href="#formulas"
              onClick={(e) => handleAnchorClick(e, "formulas")}
              className="px-6 py-3 bg-transparent hover:bg-[#eeeeee] border border-[#e0e0db] text-[#353241] text-base font-bold rounded-lg transition-all cursor-pointer text-center no-underline hover:-translate-y-0.5"
            >
              Tra công thức nhanh
            </a>
          </motion.div>
        </div>
      </section>

      <main className="relative z-10 max-w-[1200px] mx-auto px-6 py-12 flex flex-col gap-[80px]">
        
        {/* ================= SESSION 2: KHÁI NIỆM ================= */}
        <section id="concept" className="scroll-mt-36">
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-[#592eff] h-6 w-6" />
              <h2 className="adora-heading text-[32px] md:text-[38px] leading-[1.1] uppercase tracking-[-0.02em] m-0">
                2. Khái Niệm Nguyên Hàm & Tích Phân
              </h2>
            </div>
            <p className="text-[#5f5f69] text-sm m-0">Định nghĩa nguyên hàm nền tảng làm tiền đề cho phép tính giải tích</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {concepts.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#ffffff] border border-[#e0e0db] p-8 rounded-[40px] flex flex-col justify-between hover:border-[#592eff]/30 transition-all relative overflow-hidden shadow-[0_4px_30px_rgba(53,50,65,0.02)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="px-3 py-1 rounded-[200px] text-xs font-semibold uppercase tracking-wider border"
                      style={{ borderColor: item.tagColor, color: item.tagColor }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="adora-heading text-xl mb-4">{item.title}</h3>
                  <p className="adora-body text-base leading-[1.6] mb-6 text-[#5f5f69]">{item.desc}</p>
                </div>
                <div className="bg-[#eeeeee]/60 border border-[#e0e0db]/50 p-4 rounded-2xl text-center text-[#21164c] font-mono text-base font-bold">
                  <LatexRenderer latex={item.formula} displayMode={true} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SESSION 3: ĐỊNH NGHĨA ================= */}
        <section id="definition" className="scroll-mt-36">
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="text-[#592eff] h-6 w-6" />
              <h2 className="adora-heading text-[32px] md:text-[38px] leading-[1.1] uppercase tracking-[-0.02em] m-0">
                3. Định Nghĩa Tích Phân Xác Định
              </h2>
            </div>
            <p className="text-[#5f5f69] text-sm m-0">Bản chất hình học và các định nghĩa toán học cốt lõi</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {definitions.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#ffffff] border border-[#e0e0db] p-8 rounded-[40px] flex flex-col justify-between hover:border-[#592eff]/30 transition-all relative overflow-hidden shadow-[0_4px_30px_rgba(53,50,65,0.02)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="px-3 py-1 rounded-[200px] text-xs font-semibold uppercase tracking-wider border"
                      style={{ borderColor: item.tagColor, color: item.tagColor }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="adora-heading text-xl mb-4">{item.title}</h3>
                  <p className="adora-body text-base leading-[1.6] mb-6 text-[#5f5f69]">{item.desc}</p>
                </div>
                <div className="bg-[#eeeeee]/60 border border-[#e0e0db]/50 p-4 rounded-2xl text-center text-[#21164c] font-mono text-base font-bold">
                  <LatexRenderer latex={item.formula} displayMode={true} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SESSION 4: ĐỊNH LÝ ================= */}
        <section id="theorem" className="scroll-mt-36">
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-[#592eff] h-6 w-6" />
              <h2 className="adora-heading text-[32px] md:text-[38px] leading-[1.1] uppercase tracking-[-0.02em] m-0">
                4. Các Định Lý Cơ Bản
              </h2>
            </div>
            <p className="text-[#5f5f69] text-sm m-0">Những định lý trụ cột làm cơ sở tính toán và chứng minh giải tích</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {theoremsData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#ffffff] border border-[#e0e0db] p-8 rounded-[40px] flex flex-col justify-between hover:border-[#592eff]/30 transition-all relative overflow-hidden shadow-[0_4px_30px_rgba(53,50,65,0.02)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="px-3 py-1 rounded-[200px] text-xs font-semibold uppercase tracking-wider border"
                      style={{ borderColor: item.tagColor, color: item.tagColor }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="adora-heading text-xl mb-4">{item.title}</h3>
                  <p className="adora-body text-base leading-[1.6] mb-6 text-[#5f5f69]">{item.desc}</p>
                </div>
                <div className="bg-[#eeeeee]/60 border border-[#e0e0db]/50 p-4 rounded-2xl text-center text-[#21164c] font-mono text-base font-bold">
                  <LatexRenderer latex={item.formula} displayMode={true} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SESSION 5: TÍNH CHẤT ================= */}
        <section id="properties" className="scroll-mt-36">
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="text-[#592eff] h-6 w-6" />
              <h2 className="adora-heading text-[32px] md:text-[38px] leading-[1.1] uppercase tracking-[-0.02em] m-0">
                5. Tính Chất Của Tích Phân
              </h2>
            </div>
            <p className="text-[#5f5f69] text-sm m-0">Quy tắc biến đổi để tối giản biểu thức tích phân phức tạp</p>
          </div>

          <div className="flex flex-col gap-10">
            {Object.keys(propertiesGrouped).map((groupKey) => {
              const group = propertiesGrouped[groupKey];
              return (
                <div key={groupKey} className="border border-[#e0e0db] bg-[#eeeeee]/20 rounded-[40px] p-8 md:p-10">
                  <h3 className="adora-heading text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-4 bg-[#592eff] rounded-full" />
                    {group.title}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.items.map((prop, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-[#ffffff] border border-[#e0e0db] p-6 rounded-[40px] flex flex-col justify-between hover:border-[#592eff]/20 transition-all shadow-[0_4px_30px_rgba(53,50,65,0.01)]"
                      >
                        <div>
                          <h4 className="adora-heading text-base mb-2">{prop.name}</h4>
                          <p className="adora-body text-[15px] leading-[1.6] mb-4 text-[#5f5f69]">{prop.desc}</p>
                        </div>
                        <div className="bg-[#eeeeee]/60 p-3 rounded-xl text-center text-[#21164c] font-mono text-sm border border-[#e0e0db]/50">
                          <LatexRenderer latex={prop.formula} displayMode={true} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SESSION 6: CÔNG THỨC CƠ BẢN ================= */}
        <section id="formulas" className="scroll-mt-36">
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="text-[#592eff] h-6 w-6" />
              <h2 className="adora-heading text-[32px] md:text-[38px] leading-[1.1] uppercase tracking-[-0.02em] m-0">
                6. Bảng Công Thức Cơ Bản
              </h2>
            </div>
            <p className="text-[#5f5f69] text-sm m-0">Bộ quy tắc tra cứu tích phân cơ bản đến nâng cao</p>
          </div>

          <div className="bg-[#ffffff] border border-[#e0e0db] p-8 md:p-10 rounded-[40px] shadow-[0_4px_30px_rgba(53,50,65,0.02)]">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5f5f69] h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm công thức tích phân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="adora-input w-full pl-11 pr-4"
                />
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {["all", "basic", "exp", "trig", "invtrig", "hyperbolic"].map((cat) => {
                  const labelMap = {
                    all: "Tất cả",
                    basic: "Cơ bản",
                    exp: "Mũ / Logarit",
                    trig: "Lượng giác",
                    invtrig: "Lượng giác ngược",
                    hyperbolic: "Hyperbolic",
                  };
                  return (
                    <button
                      key={cat}
                      className={`px-4 py-2 rounded-[200px] text-xs font-bold border transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-[#592eff] text-white border-transparent shadow-sm"
                          : "bg-transparent text-[#5f5f69] border-[#e0e0db] hover:text-[#21164c] hover:bg-[#eeeeee]"
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {labelMap[cat]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formula Grid */}
            <AnimatePresence mode="popLayout">
              {filteredCheatSheet.length > 0 ? (
                <motion.div
                  layout
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredCheatSheet.map((f, i) => {
                    const id = `${f.category}-${i}`;
                    const isCopied = copiedId === id;
                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#ffffff] border border-[#e0e0db] p-6 rounded-[40px] flex flex-col justify-between hover:border-[#592eff]/30 transition-all group relative overflow-hidden shadow-[0_4px_24px_rgba(53,50,65,0.01)]"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span 
                            className="px-3 py-1 rounded-[200px] text-[10px] font-bold uppercase tracking-wider border"
                            style={{ borderColor: f.color, color: f.color }}
                          >
                            {f.badge}
                          </span>
                          <button
                            onClick={() => handleCopy(`${f.integral} = ${f.result}`, id)}
                            className="p-1.5 text-[#5f5f69] hover:text-[#592eff] hover:bg-[#eeeeee] rounded-lg transition-all border-none bg-transparent cursor-pointer"
                            title="Copy LaTeX"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 font-mono text-sm py-4">
                          <span className="text-[#353241]">
                            <LatexRenderer latex={f.integral} />
                          </span>
                          <span className="text-[#592eff] font-bold">=</span>
                          <span className="text-[#21164c] font-extrabold">
                            <LatexRenderer latex={f.result} />
                          </span>
                        </div>
                        <div className="mt-2 text-left">
                          <span className="text-[11px] font-bold text-[#5f5f69] tracking-wide uppercase">
                            {f.name}
                          </span>
                        </div>
                        {isCopied && (
                          <div className="absolute bottom-2 right-4 text-[10px] font-bold text-emerald-600 tracking-wider animate-pulse">
                            Đã sao chép!
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 opacity-50"
                >
                  <HelpCircle size={48} className="mx-auto text-[#5f5f69] mb-4" />
                  <div className="text-base font-bold text-[#353241] mb-1">Không tìm thấy công thức</div>
                  <div className="text-xs text-[#5f5f69]">Hãy thử từ khóa khác hoặc chuyển phân mục lọc.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ================= SESSION 7: CÁC PHƯƠNG PHÁP GIẢI ================= */}
        <section id="methods" className="mb-12 scroll-mt-36">
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="text-[#592eff] h-6 w-6" />
              <h2 className="adora-heading text-[32px] md:text-[38px] leading-[1.1] uppercase tracking-[-0.02em] m-0">
                7. Các Phương Pháp Giải Tích Phân
              </h2>
            </div>
            <p className="text-[#5f5f69] text-sm m-0">4 kỹ năng cốt lõi được mô hình AI khuyên dùng khi phân tích</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="bg-[#ffffff] border border-[#e0e0db] rounded-[40px] overflow-hidden grid lg:grid-cols-[280px_1fr] shadow-[0_4px_30px_rgba(53,50,65,0.02)]"
          >
            {/* Sidebar Tabs */}
            <div className="border-r border-[#e0e0db] bg-[#eeeeee]/30 p-6 flex flex-col gap-2 relative">
              <div className="text-xs font-bold text-[#5f5f69] uppercase tracking-widest mb-3">Phương pháp giải</div>
              {Object.keys(methods).map((tabKey) => {
                const isActive = activeMethodTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    className={`relative w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all border-none cursor-pointer ${
                      isActive
                        ? "text-[#592eff] bg-white border border-[#e0e0db] shadow-[0_2px_8px_rgba(53,50,65,0.03)]"
                        : "bg-transparent text-[#5f5f69] hover:text-[#21164c] hover:bg-white/40"
                    }`}
                    onClick={() => setActiveMethodTab(tabKey)}
                  >
                    {methods[tabKey].name.split(" (")[0]}
                  </button>
                );
              })}
            </div>

            {/* Tab content panel */}
            <div className="p-8 md:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMethodTab}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6"
                >
                  <div>
                    <h3 className="adora-heading text-2xl mb-2">
                      {methods[activeMethodTab].name}
                    </h3>
                    <p className="adora-body text-base leading-[1.6] mb-6 text-[#5f5f69]">
                      {methods[activeMethodTab].desc}
                    </p>
                  </div>

                  {/* Method Formula Core */}
                  <div className="bg-[#21164c] border border-[#21164c] p-6 rounded-[32px] text-center text-[#ffaae6] font-mono text-lg font-bold shadow-sm">
                    <LatexRenderer latex={methods[activeMethodTab].formula} displayMode={true} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mt-4">
                    {/* Method steps list */}
                    <div>
                      <h4 className="adora-heading text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Compass size={16} className="text-[#592eff]" />
                        Quy trình các bước giải
                      </h4>
                      <div className="flex flex-col gap-4">
                        {methods[activeMethodTab].steps.map((st, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="w-6 h-6 rounded-full bg-[#eeeeee] border border-[#e0e0db] text-xs font-bold text-[#592eff] flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div>
                              <div className="adora-heading text-sm mb-0.5">{st.title}</div>
                              <div className="adora-body text-[13px] leading-[1.5] text-[#5f5f69]">{st.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example calculation notepad proof box */}
                    <div className="border border-[#e0e0db] p-6 rounded-[32px] proof-notepad-paper bg-[#fafbfe]">
                      <h4 className="adora-heading text-xs uppercase tracking-widest mb-4 flex items-center gap-1.5 text-[#5f5f69]">
                        <Award size={14} className="text-[#592eff]" />
                        Ví dụ thực hành minh họa
                      </h4>
                      <div className="adora-heading text-base mb-4 flex items-center gap-1">
                        Tính tích phân: 
                        <span className="text-[#592eff] ml-1">
                          <LatexRenderer latex={methods[activeMethodTab].example.problem} />
                        </span>
                      </div>
                      <div className="flex flex-col gap-4">
                        {methods[activeMethodTab].example.steps.map((step, idx) => (
                          <div key={idx} className="flex flex-col gap-1 border-l-2 border-[#592eff]/30 pl-4 py-0.5">
                            <div className="adora-body text-xs text-[#5f5f69] font-medium">{step.text}</div>
                            <div className="text-[13px] font-mono text-[#592eff] font-bold">
                              <LatexRenderer latex={step.latex} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
