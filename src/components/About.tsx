import { Card, CardContent } from '@/components/ui/card';
import Reveal from '@/components/Reveal';

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
    description: 'Pix, cartão de crédito e débito. Atendimento presencial na loja.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-white pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-20 text-center">
          <h1
            className="mb-6 text-4xl font-light tracking-wide text-black md:text-5xl"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Nossa História
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light text-gray-600">
            Uma jornada dedicada à celebração da elegância feminina através de peças únicas e atemporais.
          </p>
        </Reveal>

        <div className="mb-20 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <Reveal delay={80} className="space-y-8">
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
          </Reveal>

          <Reveal delay={160} className="lg:order-first" variant="blur-up">
            <div className="aspect-[4/5] overflow-hidden bg-gray-100">
              <img
                src="https://images.pexels.com/photos/7679613/pexels-photo-7679613.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Zue Fashion"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
          </Reveal>
        </div>

        <div className="mb-20">
          <Reveal>
            <h2
              className="mb-12 text-center text-3xl font-light tracking-wide text-black"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Nossos Valores
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 90}>
                <Card className="gap-0 rounded-none bg-transparent py-0 ring-0">
                  <CardContent className="space-y-4 px-0">
                    <h3 className="text-xl font-light tracking-wide text-black">
                      {value.title}
                    </h3>
                    <p className="font-light leading-relaxed text-gray-600">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="-mx-4 bg-gray-50 px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <h2
                className="mb-12 text-center text-3xl font-light tracking-wide text-black"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Política da Loja
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
              {policies.map((policy, index) => (
                <Reveal key={policy.letter} delay={index * 100}>
                  <Card className="group gap-0 rounded-none bg-transparent py-0 ring-0">
                    <CardContent className="px-0">
                      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-gray-300 transition-colors duration-500 group-hover:border-black">
                        <span
                          className="text-2xl"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          {policy.letter}
                        </span>
                      </div>
                      <h3 className="mb-4 text-lg font-light tracking-wide text-black">
                        {policy.title}
                      </h3>
                      <p className="font-light leading-relaxed text-gray-600">
                        {policy.description}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
