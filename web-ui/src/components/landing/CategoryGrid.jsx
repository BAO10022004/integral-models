import React, { useEffect, useRef, useState } from 'react';
import '../../styles/CategoryGrid.css';

// Import image assets
import historyImg from '../../assets/history/showoff_history.jpg';
import theoryImg from '../../assets/theory.jpg';
import aiImg from '../../assets/ai.jpg';
import infoImg from '../../assets/information.jpg';
import contactImg from '../../assets/contract.jpg';

const CategoryGrid = ({ onNavigate }) => {
    const [categories, setCategories] = useState([]);
    const [inView, setInView] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        // Load custom category images from localStorage
        const storedImages = localStorage.getItem("landing_category_images");
        let customImages = {};
        if (storedImages) {
            try {
                customImages = JSON.parse(storedImages);
            } catch (e) {
                console.error("Failed to parse custom landing category images", e);
            }
        }

        // Merge custom configuration values with default assets
        const list = [
            { title: 'LỊCH SỬ PHÁT TRIỂN ', img: customImages.history || historyImg, route: 'history' },
            { title: 'KIẾN THỨC', img: customImages.theory || theoryImg, route: 'theory' },
            { title: 'AI', img: customImages.ai || aiImg, route: 'ai' },
            { title: 'THÔNG TIN', img: customImages.info || infoImg, route: 'info' },
            { title: 'LIÊN HỆ', img: customImages.contact || contactImg, route: 'contact' }
        ];
        setCategories(list);
    }, []);

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