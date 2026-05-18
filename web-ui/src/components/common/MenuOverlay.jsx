import React, { useState } from 'react';

const MenuOverlay = ({ menuOpen, setMenuOpen, onNavigate, user, onLogout }) => {
    const [showProfile, setShowProfile] = useState(false);
    const isUserAdmin = user && (user.role === 'admin' || user.Role === 'admin');

    const handleLinkClick = (page) => {
        setMenuOpen(false);
        setShowProfile(false); // Reset profile view when navigating
        onNavigate(page);
    };

    const handleLogoutClick = () => {
        setMenuOpen(false);
        setShowProfile(false);
        if (onLogout) {
            onLogout();
        }
    };

    // Helper to get name initials for avatar
    const getInitials = () => {
        if (!user) return '?';
        const name = user.displayName || user.DisplayName || user.email || user.Email || '';
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className={`koa-menu-overlay ${menuOpen ? 'open' : ''}`}>
            <button className="koa-menu-close" onClick={() => { setMenuOpen(false); setShowProfile(false); }}>&times;</button>

            {showProfile && user ? (
                <div className="koa-profile-card">
                    {user.photoUrl || user.PhotoUrl ? (
                        <img
                            src={user.photoUrl || user.PhotoUrl}
                            alt="Avatar"
                            className="koa-profile-avatar"
                        />
                    ) : (
                        <div className="koa-profile-avatar">
                            {getInitials()}
                        </div>
                    )}

                    <div className="koa-profile-name">
                        {user.displayName || user.DisplayName || 'User'}
                    </div>

                    <div className="koa-profile-email">
                        {user.email || user.Email}
                    </div>

                    <div className={`koa-profile-role-badge ${isUserAdmin ? 'admin' : 'user'}`}>
                        {isUserAdmin ? 'Admin' : 'User'}
                    </div>

                    <div className="koa-profile-actions">
                        <button className="koa-profile-btn primary" onClick={() => setShowProfile(false)}>
                            Back to Menu
                        </button>
                        <button className="koa-profile-btn secondary" onClick={handleLogoutClick}>
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="koa-menu-links">
                    <a href="#" className="koa-menu-link" onClick={(e) => { e.preventDefault(); handleLinkClick('intro'); }}>Home</a>
                    <a href="#" className="koa-menu-link" onClick={(e) => { e.preventDefault(); handleLinkClick('history'); }}>History</a>
                    <a href="#" className="koa-menu-link" onClick={(e) => { e.preventDefault(); handleLinkClick('theory'); }}>Theory</a>
                    <a href="#" className="koa-menu-link" onClick={(e) => { e.preventDefault(); handleLinkClick('tester'); }}>AI Engine</a>
                    <a href="#" className="koa-menu-link" onClick={(e) => { e.preventDefault(); handleLinkClick('info'); }}>Info</a>
                    <a href="#" className="koa-menu-link" onClick={(e) => { e.preventDefault(); handleLinkClick('contact'); }}>Contact</a>

                    {isUserAdmin && (
                        <a href="#" className="koa-menu-link admin-highlight-link" onClick={(e) => { e.preventDefault(); handleLinkClick('admin'); }} style={{ color: '#e8c96a', fontWeight: 'bold' }}>
                            Admin Panel
                        </a>
                    )}

                    {user ? (
                        <a href="#" className="koa-menu-link account-link" onClick={(e) => { e.preventDefault(); setShowProfile(true); }}>
                            Account
                        </a>
                    ) : (
                        <a href="#" className="koa-menu-link login-link" onClick={(e) => { e.preventDefault(); handleLinkClick('login'); }}>
                            Login
                        </a>
                    )}
                </div>
            )}

            <div className="koa-menu-footer">
                <div>&copy; 2026 INTEGRAL. ALL RIGHTS RESERVED.</div>
                <div className="koa-social-icons">
                    <a href="#" className="koa-social-icon">FB</a>
                    <a href="#" className="koa-social-icon">IG</a>
                    <a href="#" className="koa-social-icon">TK</a>
                </div>
            </div>
        </div>
    );
};

export default MenuOverlay;
