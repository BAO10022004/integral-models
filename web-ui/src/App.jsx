import { useState, useEffect } from "react";
import ModelTester from "./pages/ModelTester.jsx";
import SolutionPage from "./pages/SolutionPage.jsx";
import Login from "./components/ui/Login.jsx";
import IntroPage from "./pages/IntroPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HistoryArticlePage from "./pages/HistoryArticlePage.jsx";
import TheoryArticlePage from "./pages/TheoryArticlePage.jsx";
import TheoryConceptsPage from "./pages/TheoryConceptsPage.jsx";
import TheoryDefinitionsPage from "./pages/TheoryDefinitionsPage.jsx";
import TheoryPropertiesPage from "./pages/TheoryPropertiesPage.jsx";
import TheoryPage from "./pages/TheoryPage.jsx";
import InfoPage from "./pages/InfoPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ChatAssistant from "./components/ui/ChatAssistant.jsx";

import { auth } from "./services/firebase";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem("user");
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const handleSetUser = (userData) => {
    if (userData) {
      const expiry = Date.now() + 30 * 60 * 1000;
      const dataWithExpiry = { ...userData, expiry };
      setUser(dataWithExpiry);
      localStorage.setItem("user", JSON.stringify(dataWithExpiry));
    } else {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Firebase Signout error:", e);
    }
    handleSetUser(null);
    navigate("login");
  };

  // ─── Idle-timeout: refresh expiry on any user activity ───────────────────
  useEffect(() => {
    if (!user || !user.expiry) return;

    const IDLE_MS = 30 * 60 * 1000; // 30 minutes of inactivity
    let timeoutId = null;

    // Extend expiry in localStorage (without causing a React re-render loop)
    const refreshExpiry = () => {
      const newExpiry = Date.now() + IDLE_MS;
      const stored = localStorage.getItem("user");
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored);
        const updated = { ...parsed, expiry: newExpiry };
        localStorage.setItem("user", JSON.stringify(updated));
        // Also keep the in-memory user expiry in sync without full state update
        setUser(prev => prev ? { ...prev, expiry: newExpiry } : prev);
      } catch { /* ignore */ }
    };

    const scheduleLogout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        alert("Phiên đăng nhập đã hết hạn do không hoạt động trong 30 phút. Vui lòng đăng nhập lại.");
      }, IDLE_MS);
    };

    // On any activity: refresh expiry & restart the logout timer
    const onActivity = () => {
      refreshExpiry();
      scheduleLogout();
    };

    const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, onActivity, { passive: true }));

    // Start the initial countdown
    scheduleLogout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, onActivity));
    };
  }, [!!user]); // Only re-run when logged-in state flips, not on every user update
  // ─────────────────────────────────────────────────────────────────────────
  const getInitialPage = () => {
    const path = window.location.pathname;
    const stored = localStorage.getItem("user");
    let storedUser = null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.expiry) {
          if (Date.now() > parsed.expiry) {
            localStorage.removeItem("user");
            storedUser = null;
          } else {
            storedUser = parsed;
          }
        } else {
          storedUser = parsed;
        }
      } catch {
        storedUser = null;
      }
    }

    const isUserAdmin = storedUser && (storedUser.role === "admin" || storedUser.Role === "admin");

    if (path === "/admin" || path === "/admin/") {
      if (!storedUser) {
        window.history.replaceState(null, "", "/login");
        return "login";
      }
      if (!isUserAdmin) {
        window.history.replaceState(null, "", "/");
        return "intro";
      }
      return "admin";
    }
    if (path === "/tester" || path === "/tester/") {
      return "tester";
    }
    if (path === "/login" || path === "/login/") {
      if (!storedUser) {
        return "login";
      }
      if (!isUserAdmin) {
        window.history.replaceState(null, "", "/");
        return "intro";
      }
      return "admin";
    }
    if (path === "/history/article" || path === "/history/article/") {
      return "history-article";
    }
    if (path === "/history" || path === "/history/") {
      return "history";
    }
    if (path === "/theory/article" || path === "/theory/article/") {
      return "theory-article";
    }
    if (path === "/theory/concepts" || path === "/theory/concepts/") {
      return "theory-concepts";
    }
    if (path === "/theory/definitions" || path === "/theory/definitions/") {
      return "theory-definitions";
    }
    if (path === "/theory/properties" || path === "/theory/properties/") {
      return "theory-properties";
    }
    if (path === "/theory" || path === "/theory/") {
      return "theory";
    }
    if (path === "/info" || path === "/info/") {
      return "info";
    }
    if (path === "/contact" || path === "/contact/") {
      return "contact";
    }
    return "intro";
  };

  const [page, setPage] = useState(getInitialPage);
  const [solutionData, setSolutionData] = useState(null);
  const [articleData, setArticleData] = useState(null);
  const [theoryArticleData, setTheoryArticleData] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      setPage(getInitialPage());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);


  useEffect(() => {
    const storedFont = localStorage.getItem("navbar_font");
    if (storedFont) {
      document.documentElement.style.setProperty('--koa-nav-font', storedFont);
      document.documentElement.style.setProperty('--navbar-font', storedFont);
      document.documentElement.style.setProperty('--font-sans', storedFont);
      document.documentElement.style.setProperty('--global-font', storedFont);
      document.documentElement.style.setProperty('--koa-sans', storedFont);
      document.documentElement.style.setProperty('--koa-serif', storedFont);
    }

    const storedTitle = localStorage.getItem("website_title");
    if (storedTitle) {
      document.title = storedTitle;
    }

    const storedFavicon = localStorage.getItem("website_favicon");
    if (storedFavicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = storedFavicon;
    }
  }, []);

  useEffect(() => {
    if (page === "login" && user) {
      const isUserAdmin = user.role === "admin" || user.Role === "admin";
      if (isUserAdmin) {
        navigate("admin");
      } else {
        navigate("intro");
      }
    }
  }, [page, user]);

  const navigate = (nextPage, data = null) => {
    if (nextPage === "admin") {
      if (!user) {
        nextPage = "login";
      } else {
        const isUserAdmin = user.role === "admin" || user.Role === "admin";
        if (!isUserAdmin) {
          nextPage = "intro";
        }
      }
    }

    if (nextPage === "solution" && data) setSolutionData(data);
    if (nextPage === "history-article" && data) setArticleData(data);
    if (nextPage === "theory-article" && data) setTheoryArticleData(data);
    setPage(nextPage);

    let path = "/";
    if (nextPage === "admin") path = "/admin";
    else if (nextPage === "tester") path = "/tester";
    else if (nextPage === "login") path = "/login";
    else if (nextPage === "solution") path = "/solution";
    else if (nextPage === "history") path = "/history";
    else if (nextPage === "history-article") path = "/history/article";
    else if (nextPage === "theory-article") path = "/theory/article";
    else if (nextPage === "theory-concepts") path = "/theory/concepts";
    else if (nextPage === "theory-definitions") path = "/theory/definitions";
    else if (nextPage === "theory-properties") path = "/theory/properties";
    else if (nextPage === "theory") path = "/theory";
    else if (nextPage === "info") path = "/info";
    else if (nextPage === "contact") path = "/contact";

    window.history.pushState(null, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {page !== "admin" && page !== "login" && <ChatAssistant />}
      {page === "solution" ? (
        <SolutionPage data={solutionData} onBack={() => navigate("intro")} />
      ) : page === "intro" ? (
        <IntroPage user={user} onLogout={handleLogout} onNavigate={navigate} />
      ) : page === "login" ? (
        <Login user={user} onSetUser={handleSetUser} onNavigate={navigate} />
      ) : page === "admin" ? (
        <AdminPage onNavigate={navigate} onLogout={handleLogout} />
      ) : page === "history" ? (
        <HistoryPage onNavigate={navigate} />
      ) : page === "history-article" ? (
        <HistoryArticlePage articleData={articleData} onNavigate={navigate} />
      ) : page === "theory-article" ? (
        <TheoryArticlePage articleData={theoryArticleData} onNavigate={navigate} />
      ) : page === "theory-concepts" ? (
        <TheoryConceptsPage onNavigate={navigate} />
      ) : page === "theory-definitions" ? (
        <TheoryDefinitionsPage onNavigate={navigate} />
      ) : page === "theory-properties" ? (
        <TheoryPropertiesPage onNavigate={navigate} />
      ) : page === "theory" ? (
        <TheoryPage onNavigate={navigate} user={user} onLogout={handleLogout} />
      ) : page === "info" ? (
        <InfoPage onNavigate={navigate} user={user} onLogout={handleLogout} />
      ) : page === "contact" ? (
        <ContactPage onNavigate={navigate} user={user} onLogout={handleLogout} />
      ) : (
        <ModelTester user={user} onNavigate={navigate} />
      )}
    </>
  );
}