import React from 'react';

const MenuOverlay = ({ menuOpen, setMenuOpen, onNavigate }) => {
    return (
        <div className={`koa-menu-overlay ${menuOpen ? 'open' : ''}`}>
            <button className="koa-menu-close" onClick={() => setMenuOpen(false)}>&times;</button>

            <div className="koa-menu-links">
                <a href="#" className="koa-menu-link" onClick={() => { setMenuOpen(false); onNavigate('intro'); }}>Home Landing</a>
                <a href="#" className="koa-menu-link" onClick={() => { setMenuOpen(false); onNavigate('tester'); }}>Model Tester</a>
                <a href="#" className="koa-menu-link" onClick={() => { setMenuOpen(false); onNavigate('admin'); }}>Admin Panel</a>
                <a href="#" className="koa-menu-link" onClick={() => { setMenuOpen(false); onNavigate('login'); }}>Login</a>
            </div>

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