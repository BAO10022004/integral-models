import React, { useEffect } from "react";
import "../styles/HistoryArticlePage.css";
import slideImgDefault from "../assets/history/slide.png";
import introImgDefault from "../assets/history.webp";

export default function HistoryArticlePage({ articleData, onNavigate }) {
  // If no article data, go back to history page automatically
  useEffect(() => {
    if (!articleData) {
      onNavigate("history");
    }
  }, [articleData, onNavigate]);

  if (!articleData) return null;

  const displayImage = articleData.image || introImgDefault;

  return (
    <div className="article-page-container">
      {/* Background Cyber Glow Grid */}
      <div className="article-page-bg-grid"></div>
      <div className="article-page-glow-overlay"></div>

      {/* Main Header / Navigation */}
      <div className="article-page-nav">
        <button
          className="article-page-back-btn"
          onClick={() => onNavigate("history")}
        >
          <span className="back-btn-arrow">←</span> Quay lại Dòng Lịch Sử
        </button>
        <div className="article-page-nav-badge">DETAILED READROOM</div>
      </div>

      {/* Article Content Layout */}
      <div className="article-page-card">
        
        {/* Upper Grid: Image on the Left, Title & Description on the Right */}
        <div className="article-page-upper-grid">
          
          {/* Left Side: Big Premium Image with Tech Scanner styling */}
          <div className="article-page-media-pane">
            <div className="article-page-img-frame">
              <img
                src={displayImage}
                alt={articleData.title}
                className="article-page-img"
                onError={(e) => {
                  e.target.src = introImgDefault;
                }}
              />
              <div className="article-page-scanner-line"></div>
              <div className="article-page-tech-corner top-left"></div>
              <div className="article-page-tech-corner top-right"></div>
              <div className="article-page-tech-corner bottom-left"></div>
              <div className="article-page-tech-corner bottom-right"></div>
            </div>
          </div>

          {/* Right Side: Title, Year, Category and Short Description */}
          <div className="article-page-info-pane">
            <div className="article-page-meta">
              <span className="article-page-year">{articleData.year}</span>
              <span className="article-page-divider">|</span>
              <span className="article-page-category">KỶ NGUYÊN SỰ KIỆN</span>
            </div>
            
            <h1 className="article-page-title">{articleData.title}</h1>
            
            {articleData.desc && (
              <div className="article-page-short-desc-wrapper">
                <p className="article-page-short-desc-text">
                  {articleData.desc}
                </p>
              </div>
            )}
            
            {articleData.url && (
              <a
                href={articleData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="article-page-hero-link-btn"
              >
                Nguồn tham khảo gốc ↗
              </a>
            )}
          </div>
        </div>

        {/* Lower Block: Detailed Article Content BELOW */}
        <div className="article-page-lower-body">
          <div className="article-page-body-card">
            <div className="article-page-body-meta">
              <span className="body-meta-dot"></span>
              NỘI DUNG TÀI LIỆU CHÍNH THỨC
            </div>

            {articleData.articleType === "html" ? (
              <div
                className="article-page-main-text html-rich"
                dangerouslySetInnerHTML={{ __html: articleData.article || `Không có bài viết chi tiết được cấu hình cho sự kiện năm ${articleData.year}.` }}
              />
            ) : (
              <div className="article-page-main-text plain-text">
                {articleData.article || `Không có bài viết chi tiết được cấu hình cho sự kiện năm ${articleData.year}.`}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions / Footer */}
        <div className="article-page-footer">
          <div className="article-page-footer-nav">
            <button
              className="article-page-footer-back-btn"
              onClick={() => onNavigate("history")}
            >
              ↩ Quay lại trang Lịch Sử
            </button>
            <div className="article-page-footer-copyright">
              © {new Date().getFullYear()} INTEGRAL.AI • High-Performance Math Solver
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
