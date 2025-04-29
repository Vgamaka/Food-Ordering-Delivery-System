import React from 'react';
import { Link } from 'react-router-dom'; // 👈 To use Link instead of <a> for internal routes

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div>
            <h3 className="text-2xl font-bold text-red-500 mb-4">DeliciousEats</h3>
            <p className="text-gray-400 mb-4">
              Your favorite food, delivered fast and fresh to your doorstep.
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="font-bold mb-4">Useful Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#about" className="text-gray-400 hover:text-white transition-colors duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link to="/#menu" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/#chefs" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Chefs
                </Link>
              </li>
              <li>
                <Link to="/#testimonials" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Testimonials
                </Link>
              </li>
              {/* New Links */}
              <li>
                <Link to="/register/restaurant" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Register as Restaurant
                </Link>
              </li>
              <li>
                <Link to="/register/driver" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Register as Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Delivery Hours */}
          <div>
            <h4 className="font-bold mb-4">Delivery Hours</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Monday - Friday: 10:00 AM - 11:00 PM</li>
              <li>Saturday - Sunday: 9:00 AM - 12:00 AM</li>
              <li>Holidays: 10:00 AM - 10:00 PM</li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li>123 Food Street, Tasty City</li>
              <li>Phone: +94 (076) 794-6673</li>
              <li>Email: info@deliciouseats.com</li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} DeliciousEats. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
