import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import './HomePage.css';
import slide1 from '../assets/Carousal 1.jpg';
import slide2 from '../assets/Carousal 2.jpg';
import slide3 from '../assets/Carousal 3.jpg';
import { Leaf, Truck, Tag, ShoppingCart } from 'lucide-react';
import fruitsImg from '../assets/fruits.jpg';
import vegetablesImg from '../assets/vegetables.jpeg';
import nonVegImg from '../assets/non-veg.jpg';
import breadImg from '../assets/bread.jpg';
import beveragesImg from '../assets/beverages.jpg';
import snacksImg from '../assets/snacks.jpg';

const HomePage = () => {

  return (
    <div className="home-page">
      <Carousel images={[slide1, slide2, slide3]} />

      <section className="features-section">
        <h2 className="section-title">Why Choose AkasaEats?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Leaf size={36} /></div>
            <h3>Fresh Ingredients</h3>
            <p>Sourced daily from local farms and markets</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Truck size={36} /></div>
            <h3>Fast Delivery</h3>
            <p>Get your order delivered in 30 minutes or less</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Tag size={36} /></div>
            <h3>Best Prices</h3>
            <p>Competitive pricing with daily deals and offers</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><ShoppingCart size={36} /></div>
            <h3>Easy Ordering</h3>
            <p>Simple and intuitive shopping experience</p>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h2 className="section-title">Popular Categories</h2>
        <div className="categories-grid">
          <Link to="/items?category=Fruits" className="category-card">
            <div className="category-image-wrapper">
              <img src={fruitsImg} alt="Fruits" className="category-image" />
            </div>
            <h3>Fruits</h3>
          </Link>
          <Link to="/items?category=Vegetables" className="category-card">
            <div className="category-image-wrapper">
              <img src={vegetablesImg} alt="Vegetables" className="category-image" />
            </div>
            <h3>Vegetables</h3>
          </Link>
          <Link to="/items?category=Non-Veg" className="category-card">
            <div className="category-image-wrapper">
              <img src={nonVegImg} alt="Non-Veg" className="category-image" />
            </div>
            <h3>Non-Veg</h3>
          </Link>
          <Link to="/items?category=Breads" className="category-card">
            <div className="category-image-wrapper">
              <img src={breadImg} alt="Breads" className="category-image" />
            </div>
            <h3>Breads</h3>
          </Link>
          <Link to="/items?category=Beverages" className="category-card">
            <div className="category-image-wrapper">
              <img src={beveragesImg} alt="Beverages" className="category-image" />
            </div>
            <h3>Beverages</h3>
          </Link>
          <Link to="/items?category=Snacks" className="category-card">
            <div className="category-image-wrapper">
              <img src={snacksImg} alt="Snacks" className="category-image" />
            </div>
            <h3>Snacks</h3>
          </Link>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Order?</h2>
          <p>Start shopping now and enjoy fresh food delivered to your home</p>
          <Link to="/items" className="cta-button large">
            Start Shopping →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
