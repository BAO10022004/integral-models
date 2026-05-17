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

import { auth } from "./services/firebase";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
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
    const storedUser = localStorage.getItem("user");

    if (path === "/admin" || path === "/admin/") {
      return storedUser ? "admin" : "login";
    }
    if (path === "/tester" || path === "/tester/") {
      return "tester";
    }
    if (path === "/login" || path === "/login/") {
      return storedUser ? "admin" : "login";
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

  // Load custom global website font from localStorage
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
  }, []);

  // Redirect to admin page if user is logged in and visits login page
  useEffect(() => {
    if (page === "login" && user) {
      navigate("admin");
    }
  }, [page, user]);

  const navigate = (nextPage, data = null) => {
    // Rule: Accessing admin page requires login
    if (nextPage === "admin" && !user) {
      nextPage = "login";
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



      {page === "solution" ? (
        <SolutionPage data={solutionData} onBack={() => navigate("intro")} />
      ) : page === "intro" ? (
        <IntroPage onNavigate={navigate} />
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
        <ModelTester user={user} />
      )}
    </>
  );
}