import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NewsletterPopupProps {
  onClose: () => void;
}

const NewsletterPopup = ({ onClose }: NewsletterPopupProps) => {
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailBody = encodeURIComponent(
      `Nova inscrição na newsletter:\n\nE-mail: ${email}\n\nEsta pessoa gostaria de receber novidades sobre a Zue.`
    );

    window.location.href = `mailto:guiroesler2@gmail.com?subject=Nova Inscrição Newsletter - Zue&body=${emailBody}`;
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md gap-0 rounded-none border-0 p-8 ring-0 sm:max-w-md animate-fadeIn"
        showCloseButton
      >
        <DialogHeader className="mb-8 items-center text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-black">
            <Mail className="size-8 text-white" />
          </div>

          <DialogTitle
            className="text-2xl font-light tracking-wide text-black"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Seja a Primeira
          </DialogTitle>

          <DialogDescription className="font-light leading-relaxed text-gray-600">
            Receba em primeira mão nossos lançamentos exclusivos, tendências e ofertas especiais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail"
            required
            className="h-auto rounded-none border-gray-200 px-4 py-3 font-light shadow-none focus-visible:border-black focus-visible:ring-0"
          />

          <Button
            type="submit"
            className="h-auto w-full gap-3 rounded-none bg-black py-4 font-light tracking-wide text-white hover:bg-gray-800"
          >
            Quero Receber
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs font-light text-gray-500">
          Respeitamos sua privacidade. Você pode cancelar a qualquer momento.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;
