import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email content
    const emailBody = encodeURIComponent(
      `Nome: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Telefone: ${formData.phone}\n\n` +
      `Mensagem:\n${formData.message}`
    );
    
    // Open default email client
    window.location.href = `mailto:guiroesler2@gmail.com?subject=Contato via Site Zue&body=${emailBody}`;
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Gostaria de entrar em contato com a Zue.");
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-6 tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            Contato
          </h1>
          <p className="text-gray-600 font-light text-lg max-w-2xl mx-auto">
            Estamos aqui para atendê-la com toda atenção e cuidado que você merece. Entre em contato conosco.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-light text-black mb-8 tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
                Informações de Contato
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-light text-black mb-1 tracking-wide">WhatsApp</h3>
                    <p className="text-gray-600 font-light">+55 (51) 98935-4834</p>
                    <button
                      onClick={handleWhatsAppClick}
                      className="text-black border-b border-transparent hover:border-black transition-all duration-300 text-sm mt-2"
                    >
                      Conversar no WhatsApp
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-light text-black mb-1 tracking-wide">E-mail</h3>
                    <p className="text-gray-600 font-light">guiroesler2@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-light text-black mb-1 tracking-wide">Localização</h3>
                    <p className="text-gray-600 font-light">Rio Grande do Sul, Brasil</p>
                    <p className="text-gray-500 text-sm mt-1">Retirada na loja com agendamento</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-light text-black mb-1 tracking-wide">Horário de Atendimento</h3>
                    <p className="text-gray-600 font-light">Segunda a Sexta: 9h às 18h</p>
                    <p className="text-gray-600 font-light">Sábado: 9h às 15h</p>
                    <p className="text-gray-500 text-sm mt-1">Atendimento via WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp CTA */}
            <div className="bg-gray-50 p-8 text-center">
              <h3 className="text-xl font-light text-black mb-4 tracking-wide">
                Atendimento Rápido
              </h3>
              <p className="text-gray-600 font-light mb-6 leading-relaxed">
                Para um atendimento mais ágil, fale conosco diretamente pelo WhatsApp. Estamos prontas para ajudá-la!
              </p>
              <button
                onClick={handleWhatsAppClick}
                className="group bg-black text-white px-6 py-3 flex items-center gap-3 mx-auto hover:bg-gray-800 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-light tracking-wide">Conversar Agora</span>
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-light text-black mb-8 tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
              Envie sua Mensagem
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-light text-gray-700 mb-2 tracking-wide">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:ring-0 outline-hidden transition-colors duration-300 font-light"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-light text-gray-700 mb-2 tracking-wide">
                  E-mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:ring-0 outline-hidden transition-colors duration-300 font-light"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-light text-gray-700 mb-2 tracking-wide">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:ring-0 outline-hidden transition-colors duration-300 font-light"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-light text-gray-700 mb-2 tracking-wide">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:ring-0 outline-hidden transition-colors duration-300 font-light resize-none"
                  placeholder="Como podemos ajudá-la? Compartilhe seus interesses, dúvidas ou sugestões..."
                />
              </div>

              <button
                type="submit"
                className="group w-full bg-black text-white py-4 flex items-center justify-center gap-3 hover:bg-gray-800 transition-all duration-300"
              >
                <Send className="w-5 h-5" />
                <span className="font-light tracking-wide">Enviar Mensagem</span>
              </button>

              <p className="text-sm text-gray-500 text-center font-light">
                * Campos obrigatórios
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;