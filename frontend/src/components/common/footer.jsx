import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react"; // ये lucide me available hain
import { FacebookIcon, InstagramIcon, TwitterIcon } from "../icons/SocialIcons";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <Link to="/" className="text-2xl font-extrabold text-white">
            Foodly
          </Link>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            Order from your favorite restaurants —
            fresh food, fast delivery.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" aria-label="Facebook" className="hover:text-brand-400 transition-colors">
              <FacebookIcon size={18} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-brand-400 transition-colors">
              <InstagramIcon size={18} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-brand-400 transition-colors">
              <TwitterIcon size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-brand-400 transition-colors">Home</Link></li>
            <li><Link to="/cart" className="hover:text-brand-400 transition-colors">Cart</Link></li>
            <li><Link to="/profile" className="hover:text-brand-400 transition-colors">Profile</Link></li>
            <li><Link to="/seller/dashboard" className="hover:text-brand-400 transition-colors">Seller Dashboard</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-brand-400 transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-brand-400 transition-colors">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-brand-400 transition-colors">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={16} className="shrink-0" /> Indore, Madhya Pradesh, India
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0" /> support@foodly.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Foodly. All rights reserved.
      </div>
    </footer>
  );
}