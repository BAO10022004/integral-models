import React, { useEffect, useRef, useState } from 'react';
import '../../styles/CategoryGrid.css';

// Import image assets
import historyImg from '../../assets/history/showoff_history.jpg';
import theoryImg from '../../assets/theory.jpg';
import aiImg from '../../assets/ai.jpg';
import infoImg from '../../assets/information.jpg';
import contactImg from '../../assets/contract.jpg';

const CategoryGrid = ({ onNavigate }) => {
    const categories = [
        { title: 'LỊCH SỬ PHÁT TRIỂN ', img: historyImg, route: 'history' },
        { title: 'KIẾN THỨC', img: theoryImg, route: 'theory' },
        { title: 'AI', img: aiImg, route: 'ai' },
        { title: 'THÔNG TIN', img: infoImg, route: 'info' },
        { title: 'LIÊN HỆ', img: contactImg, route: 'contact' }
    ];

    const [inView, setInView] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(entry.target); // Trigger only once
                }
            },
            { threshold: 0.15 } // Trigger when 15% of the section is visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section className="snap-section koa-category-section" ref={containerRef}>
            <div className={`koa-category-container ${inView ? 'animate' : ''}`}>
                {categories.map((item, index) => (
                    <div
                        key={index}
                        className="koa-category-item"
                        onClick={() => onNavigate(item.route || 'home')}
                    >
                        <img
                            src={item.img}
                            alt={item.title}
                            className="koa-category-img"
                        />
                        <div className="koa-category-label">
                            {item.title}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategoryGrid;