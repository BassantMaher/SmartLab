import React from 'react';
import { Github, Mail, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#3B945E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <div className="text-xl font-bold">SmartLab</div>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-center md:text-right text-sm">
              &copy; {new Date().getFullYear()} Smart Lab Inventory & Monitoring System
            </p>
          </div>
        </div>
        <div className="mt-4 border-t border-[#74B49B] pt-4">
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white hover:text-[#DFF5E1] transition-colors duration-150">
              <span className="sr-only">GitHub</span>
              <Github size={20} />
            </a>
            <a href="#" className="text-white hover:text-[#DFF5E1] transition-colors duration-150">
              <span className="sr-only">Contact</span>
              <Mail size={20} />
            </a>
            <a href="#" className="text-white hover:text-[#DFF5E1] transition-colors duration-150">
              <span className="sr-only">Support</span>
              <MessageCircle size={20} />
            </a>
          </div>
          <div className="mt-4 text-center text-xs text-[#DFF5E1]">
            <p>Designed for laboratory inventory management and environmental monitoring</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;