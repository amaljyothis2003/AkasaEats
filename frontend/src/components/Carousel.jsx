import { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ images = [], interval = 4000 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <div className="carousel">
      {images.map((img, i) => (
        <div
          key={i}
          className={`carousel-slide ${i === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${img})` }}
          aria-hidden={i !== index}
        >
          <div className="carousel-overlay" />
          <div className="carousel-content">
            <h2 className="carousel-title">Fresh flavors, every day</h2>
            <p className="carousel-subtitle">Farm-to-table ingredients delivered fast.</p>
            <div className="carousel-cta">
              <a href="/items" className="btn btn-primary">Browse Menu</a>
            </div>
          </div>
        </div>
      ))}

      <div className="carousel-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
