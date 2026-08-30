import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailBody = encodeURIComponent(
      `Nome: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Telefone: ${formData.phone}\n\n` +
        `Mensagem:\n${formData.message}`
    );

    window.location.href = `mailto:guiroesler2@gmail.com?subject=Contato via Site Zue&body=${emailBody}`;
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de entrar em contato com a Zue.');
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  const fieldClassName =
    'h-auto rounded-none border-gray-200 px-4 py-3 font-light shadow-none focus-visible:border-black focus-visible:ring-0';

  return (
    <div className="min-h-screen bg-white pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1
            className="mb-6 text-4xl font-light tracking-wide text-black md:text-5xl"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Contato
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light text-gray-600">
            Estamos aqui para atendê-la com toda atenção e cuidado que você merece. Entre em contato conosco.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div className="space-y-12">
            <div>
              <h2
                className="mb-8 text-2xl font-light tracking-wide text-black"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Informações de Contato
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="mt-1 size-6 shrink-0 text-gray-600" />
                  <div>
                    <h3 className="mb-1 font-light tracking-wide text-black">WhatsApp</h3>
                    <p className="font-light text-gray-600">+55 (51) 98935-4834</p>
                    <Button
                      variant="ghost"
                      onClick={handleWhatsAppClick}
                      className="mt-2 h-auto rounded-none border-b border-transparent px-0 text-sm text-black hover:border-black hover:bg-transparent"
                    >
                      Conversar no WhatsApp
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="mt-1 size-6 shrink-0 text-gray-600" />
                  <div>
                    <h3 className="mb-1 font-light tracking-wide text-black">E-mail</h3>
                    <p className="font-light text-gray-600">guiroesler2@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 size-6 shrink-0 text-gray-600" />
                  <div>
                    <h3 className="mb-1 font-light tracking-wide text-black">Localização</h3>
                    <p className="font-light text-gray-600">Rio Grande do Sul, Brasil</p>
                    <p className="mt-1 text-sm text-gray-500">Retirada na loja com agendamento</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="mt-1 size-6 shrink-0 text-gray-600" />
                  <div>
                    <h3 className="mb-1 font-light tracking-wide text-black">Horário de Atendimento</h3>
                    <p className="font-light text-gray-600">Segunda a Sexta: 9h às 18h</p>
                    <p className="font-light text-gray-600">Sábado: 9h às 15h</p>
                    <p className="mt-1 text-sm text-gray-500">Atendimento via WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="gap-0 rounded-none border-0 bg-gray-50 py-8 ring-0">
              <CardHeader className="items-center px-8 text-center">
                <CardTitle className="text-xl font-light tracking-wide text-black">
                  Atendimento Rápido
                </CardTitle>
                <CardDescription className="font-light leading-relaxed text-gray-600">
                  Para um atendimento mais ágil, fale conosco diretamente pelo WhatsApp. Estamos prontas para ajudá-la!
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center px-8 pt-2">
                <Button
                  onClick={handleWhatsAppClick}
                  className="h-auto gap-3 rounded-none bg-black px-6 py-3 font-light tracking-wide text-white hover:bg-gray-800"
                >
                  <MessageCircle className="size-5" />
                  Conversar Agora
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2
              className="mb-8 text-2xl font-light tracking-wide text-black"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Envie sua Mensagem
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-light tracking-wide text-gray-700">
                  Nome Completo *
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={fieldClassName}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-light tracking-wide text-gray-700">
                  E-mail *
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={fieldClassName}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-light tracking-wide text-gray-700">
                  Telefone
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={fieldClassName}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="font-light tracking-wide text-gray-700">
                  Mensagem *
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`${fieldClassName} min-h-32 resize-none`}
                  placeholder="Como podemos ajudá-la? Compartilhe seus interesses, dúvidas ou sugestões..."
                />
              </div>

              <Button
                type="submit"
                className="h-auto w-full gap-3 rounded-none bg-black py-4 font-light tracking-wide text-white hover:bg-gray-800"
              >
                <Send className="size-5" />
                Enviar Mensagem
              </Button>

              <p className="text-center text-sm font-light text-gray-500">* Campos obrigatórios</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
