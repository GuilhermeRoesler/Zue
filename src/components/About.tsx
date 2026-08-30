import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const values = [
  {
    title: 'Qualidade Excepcional',
    description:
      'Trabalhamos apenas com materiais premium e fornecedores que compartilham nosso compromisso com a excelência em cada detalhe.',
  },
  {
    title: 'Design Atemporal',
    description:
      'Criamos peças que transcendem as estações, focando em silhuetas elegantes e cortes precisos que valorizam a feminilidade.',
  },
  {
    title: 'Exclusividade',
    description:
      'Oferecemos coleções limitadas para garantir que nossas clientes tenham acesso a peças verdadeiramente especiais e únicas.',
  },
  {
    title: 'Atendimento Personalizado',
    description:
      'Cada cliente recebe atenção individual para encontrar peças que complementem perfeitamente seu estilo pessoal.',
  },
];

const policies = [
  {
    letter: 'E',
    title: 'Entrega',
    description: 'Retirada na loja com horário agendado. Atendimento personalizado para cada cliente.',
  },
  {
    letter: 'T',
    title: 'Trocas',
    description: '30 dias para trocas. Peças em perfeito estado com etiquetas originais.',
  },
  {
    letter: 'P',
    title: 'Pagamento',
    description: 'Pix, cartão de crédito e débito. Negociação via WhatsApp para sua comodidade.',
  },
];

const About = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre a Zue.');
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h1
            className="mb-6 text-4xl font-light tracking-wide text-black md:text-5xl"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Nossa História
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light text-gray-600">
            Uma jornada dedicada à celebração da elegância feminina através de peças únicas e atemporais.
          </p>
        </div>

        <div className="mb-20 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2
                className="mb-6 text-3xl font-light text-black"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                A Essência da Zue
              </h2>
              <p className="mb-6 font-light leading-relaxed text-gray-600">
                Nasceu do desejo de criar peças que transcendessem as tendências passageiras, focando na elegância atemporal e na qualidade excepcional. Nossa marca é dedicada à mulher moderna que valoriza a sofisticação e busca expressar sua personalidade única através da moda.
              </p>
              <p className="font-light leading-relaxed text-gray-600">
                Cada peça é cuidadosamente selecionada e desenvolvida pensando na mulher contemporânea que aprecia a exclusividade e a atenção aos detalhes. Nossa filosofia se baseia na crença de que a verdadeira elegância está na simplicidade refinada.
              </p>
            </div>
          </div>

          <div className="lg:order-first">
            <div className="aspect-[4/5] overflow-hidden bg-gray-100">
              <img
                src="https://images.pexels.com/photos/7679613/pexels-photo-7679613.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Zue Fashion"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2
            className="mb-12 text-center text-3xl font-light tracking-wide text-black"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Nossos Valores
          </h2>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {values.map((value) => (
              <Card key={value.title} className="gap-0 rounded-none bg-transparent py-0 ring-0">
                <CardContent className="space-y-4 px-0">
                  <h3 className="text-xl font-light tracking-wide text-black">{value.title}</h3>
                  <p className="font-light leading-relaxed text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="-mx-4 mb-20 bg-gray-50 px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2
              className="mb-12 text-center text-3xl font-light tracking-wide text-black"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Política da Loja
            </h2>

            <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
              {policies.map((policy) => (
                <Card key={policy.letter} className="gap-0 rounded-none bg-transparent py-0 ring-0">
                  <CardContent className="px-0">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-gray-300">
                      <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {policy.letter}
                      </span>
                    </div>
                    <h3 className="mb-4 text-lg font-light tracking-wide text-black">{policy.title}</h3>
                    <p className="font-light leading-relaxed text-gray-600">{policy.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2
            className="mb-8 text-3xl font-light tracking-wide text-black"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Pronta para Descobrir sua Nova Peça Favorita?
          </h2>
          <Button
            onClick={handleWhatsAppClick}
            className="mx-auto h-auto gap-3 rounded-none bg-black px-8 py-4 font-light tracking-wide text-white hover:scale-105 hover:bg-gray-800"
          >
            <MessageCircle className="size-5" />
            Fale Conosco
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
