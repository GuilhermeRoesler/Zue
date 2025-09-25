import React, { useState } from 'react';
import { X, Mail, ArrowRight } from 'lucide-react';

interface NewsletterPopupProps {
  onClose: () => void;
}

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email content for newsletter signup
    const emailBody = encodeURIComponent(
      `Nova inscrição na newsletter:\n\nE-mail: ${email}\n\nEsta pessoa gostaria de receber novidades sobre a Zue.`
    );
    
    // Open default email client
    window.location.href = `mailto:guiroesler2@gmail.com?subject=Nova Inscrição Newsletter - Zue&body=${emailBody}`;
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white max-w-md w-full p-8 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-light text-black mb-4 tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            Seja a Primeira
          </h2>
          
          <p className="text-gray-600 font-light leading-relaxed">
            Receba em primeira mão nossos lançamentos exclusivos, tendências e ofertas especiais.
          </p>
        </div>

        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              required
              className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:ring-0 outline-hidden transition-colors duration-300 font-light"
            />
          </div>

          <button
            type="submit"
            className="group w-full bg-black text-white py-4 flex items-center justify-center gap-3 hover:bg-gray-800 transition-all duration-300"
          >
            <span className="font-light tracking-wide">Quero Receber</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </form>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center mt-6 font-light">
          Respeitamos sua privacidade. Você pode cancelar a qualquer momento.
        </p>
      </div>
    </div>
  );
};

export default NewsletterPopup;