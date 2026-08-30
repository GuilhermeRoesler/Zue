import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface HeroProps {
  onNavigate: (section: string) => void;
}

const launchImages = [
  'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7679471/pexels-photo-7679471.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const brandValues = [
  {
    letter: 'Q',
    title: 'Qualidade Premium',
    description: 'Peças confeccionadas com os melhores materiais e acabamento impecável.',
  },
  {
    letter: 'E',
    title: 'Exclusividade',
    description: 'Coleções limitadas para mulheres que buscam peças únicas e especiais.',
  },
  {
    letter: 'S',
    title: 'Sofisticação',
    description: 'Design atemporal que transcende tendências e valoriza a elegância feminina.',
  },
];

const Hero = ({ onNavigate }: HeroProps) => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de conhecer a nova coleção da Zue.');
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white">
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-gray-50 to-white" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1
            className="mb-6 text-5xl font-light tracking-wide text-black md:text-7xl"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Elegância
            <br />
            <span className="italic font-normal">Atemporal</span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-gray-600 md:text-xl">
            Descubra peças exclusivas que celebram a feminilidade moderna com sofisticação e estilo únicos.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Button
              onClick={handleWhatsAppClick}
              className="h-auto gap-3 rounded-none bg-black px-8 py-4 font-light tracking-wide text-white hover:scale-105 hover:bg-gray-800"
            >
              <MessageCircle className="size-5" />
              Conheça Nossa Coleção
              <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigate('catalog')}
              className="h-auto gap-3 rounded-none border-black bg-transparent px-8 py-4 font-light tracking-wide text-black hover:bg-black hover:text-white"
            >
              Ver Catálogo
              <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 transform">
          <div className="h-12 w-px bg-gray-300" />
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2
              className="mb-4 text-4xl font-light text-black md:text-5xl"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Lançamentos
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-light text-gray-600">
              As mais recentes adições à nossa coleção, cuidadosamente selecionadas para mulheres que valorizam qualidade e elegância.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {launchImages.map((image, index) => (
              <Card
                key={image}
                className="group cursor-pointer gap-0 rounded-none bg-transparent py-0 ring-0"
              >
                <div className="mb-6 aspect-[3/4] overflow-hidden bg-gray-200">
                  <img
                    src={image}
                    alt={`Lançamento ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardHeader className="items-center px-0 text-center">
                  <CardTitle className="text-lg font-light tracking-wide text-black">
                    Peça Exclusiva {(index + 1).toString().padStart(2, '0')}
                  </CardTitle>
                  <CardDescription className="text-sm font-light text-gray-600">
                    Coleção Primavera/Verão 2025
                  </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center rounded-none border-0 bg-transparent px-0 pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleWhatsAppClick}
                    className="h-auto rounded-none border-b border-transparent px-0 font-light tracking-wide text-sm text-black hover:border-black hover:bg-transparent"
                  >
                    Consultar Disponibilidade
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {brandValues.map((value) => (
              <Card
                key={value.letter}
                className="gap-0 rounded-none bg-transparent py-0 text-center ring-0"
              >
                <CardContent className="px-0">
                  <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-gray-300">
                    <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {value.letter}
                    </span>
                  </div>
                  <h3 className="mb-4 text-xl font-light tracking-wide text-black">{value.title}</h3>
                  <p className="font-light leading-relaxed text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
