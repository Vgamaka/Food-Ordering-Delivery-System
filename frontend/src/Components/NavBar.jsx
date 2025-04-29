import React, { useState } from 'react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Brand Name */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          {/* Logo Image */}
          <img
            src="/favicon.png"
            alt="DeliciousEats Logo"
            className="h-8 w-8 mr-2"
          />
          {/* Brand Text */}
          <span className="text-2xl font-bold text-red-600">
            DeliciousEats
          </span>
        </div>

        {/* Main Menu */}
        <div className="hidden md:flex space-x-8">
          <a href="#home" className="text-red-600 font-medium" onClick={() => navigate('/')}>Home</a>
          <a href="#about" className="text-gray-700 hover:text-red-600 transition-colors duration-300">About</a>
          <a href="#menu" className="text-gray-700 hover:text-red-600 transition-colors duration-300">Menu</a>
          <a href="#restaurants" className="text-gray-700 hover:text-red-600 transition-colors duration-300">Restaurants</a>
          <a href="#testimonials" className="text-gray-700 hover:text-red-600 transition-colors duration-300">Testimonials</a>
        </div>

        {/* Cart and Profile Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={() => navigate('/cart')} 
            className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition-colors duration-300"
          >
            <ShoppingCart size={20} />
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors duration-300"
          >
            <User size={20} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <button 
            onClick={() => navigate('/cart')} 
            className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition-colors duration-300"
          >
            <ShoppingCart size={18} />
          </button>
          <button onClick={toggleMenu} className="text-gray-700">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-inner">
          <div className="flex flex-col space-y-4">
            <a href="#home" className="text-red-600 font-medium" onClick={() => navigate('/')}>Home</a>
            <a href="#about" className="text-gray-700 hover:text-red-600 transition-colors duration-300">About</a>
            <a href="#menu" className="text-gray-700 hover:text-red-600 transition-colors duration-300">Menu</a>
            <a href="#restaurants" className="text-gray-700 hover:text-red-600 transition-colors duration-300">Restaurants</a>
            <a href="#testimonials" className="text-gray-700 hover:text-red-600 transition-colors duration-300">Testimonials</a>
            <button 
              onClick={() => navigate('/profile')} 
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors duration-300"
            >
              <User size={20} />
              <span>My Profile</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
