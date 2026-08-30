import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de conversar sobre os produtos da Zue.');
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      size="icon-lg"
      className="group fixed bottom-6 right-6 z-50 size-auto rounded-full bg-green-500 p-4 text-white shadow-lg hover:scale-110 hover:bg-green-600"
      aria-label="WhatsApp"
    >
      <MessageCircle className="size-6" />

      <div className="absolute bottom-full right-0 mb-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="whitespace-nowrap rounded-lg bg-black px-3 py-2 text-sm font-light text-white">
          Fale conosco no WhatsApp
          <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
        </div>
      </div>
    </Button>
  );
};

export default WhatsAppButton;
