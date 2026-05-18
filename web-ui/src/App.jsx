import { useState, useEffect } from "react";
import ModelTester from "./pages/ModelTester.jsx";
import SolutionPage from "./pages/SolutionPage.jsx";
import Login from "./components/ui/Login.jsx";
import IntroPage from "./pages/IntroPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HistoryArticlePage from "./pages/HistoryArticlePage.jsx";
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
      // Check if session has expired (30 minutes)
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
      // Set session expiration to 30 minutes from now (30 * 60 * 1000 ms)
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

  useEffect(() => {
    const handlePopState = () => {
      setPage(getInitialPage());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Auto logout user after 30 minutes of session duration
  useEffect(() => {
    if (!user || !user.expiry) return;

    const checkAndSchedule = () => {
      const timeLeft = user.expiry - Date.now();
      if (timeLeft <= 0) {
        handleLogout();
        alert("Phiên đăng nhập của bạn đã hết hạn sau 30 phút. Vui lòng đăng nhập lại.");
      } else {
        const timeoutId = setTimeout(() => {
          handleLogout();
          alert("Phiên đăng nhập của bạn đã hết hạn sau 30 phút. Vui lòng đăng nhập lại.");
        }, timeLeft);
        return () => clearTimeout(timeoutId);
      }
    };

    return checkAndSchedule();
  }, [user]);

  // Load custom global website font, title, and favicon from localStorage
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

  // Redirect to admin page if user is logged in and visits login page
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
    // Rule: Accessing admin page requires login and admin role
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
    setPage(nextPage);

    // Update URL history without page reload
    let path = "/";
    if (nextPage === "admin") path = "/admin";
    else if (nextPage === "tester") path = "/tester";
    else if (nextPage === "login") path = "/login";
    else if (nextPage === "solution") path = "/solution";
    else if (nextPage === "history") path = "/history";
    else if (nextPage === "history-article") path = "/history/article";
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
      ) : page === "theory" ? (
        <TheoryPage onNavigate={navigate} />
      ) : page === "info" ? (
        <InfoPage onNavigate={navigate} />
      ) : page === "contact" ? (
        <ContactPage onNavigate={navigate} />
      ) : (
        <ModelTester user={user} onNavigate={navigate} />
      )}
    </>
  );
}