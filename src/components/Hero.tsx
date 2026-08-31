import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Reveal from '@/components/Reveal';
import TextReveal from '@/components/TextReveal';

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

const Hero = () => {
  return (
    <div className="bg-white">
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-gray-50 to-white" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] motion-safe:animate-zue-wave"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 45%, rgb(0 0 0 / 0.04), transparent 70%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p
            className="mb-8 text-sm font-light tracking-[0.4em] text-gray-500 uppercase motion-safe:animate-fadeIn"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Zue
          </p>

          <h1
            className="mb-6 text-5xl font-light tracking-wide text-black md:text-7xl"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            <TextReveal text="Elegância" delay={120} as="span" className="block" />
            <span className="mt-1 block italic font-normal">
              <TextReveal text="Atemporal" delay={320} as="span" />
            </span>
          </h1>

          <Reveal delay={480} variant="fade">
            <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-gray-600 md:text-xl">
              Descubra peças exclusivas que celebram a feminilidade moderna com sofisticação e estilo únicos.
            </p>
          </Reveal>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="h-12 w-px origin-top bg-gray-300 motion-safe:animate-zue-line" />
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 text-center">
            <h2
              className="mb-4 text-4xl font-light text-black md:text-5xl"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Lançamentos
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-light text-gray-600">
              As mais recentes adições à nossa coleção, cuidadosamente selecionadas para mulheres que valorizam qualidade e elegância.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {launchImages.map((image, index) => (
              <Reveal key={image} delay={index * 120}>
                <Card className="group gap-0 rounded-none bg-transparent py-0 ring-0">
                  <div className="mb-6 aspect-[3/4] overflow-hidden bg-gray-200">
                    <img
                      src={image}
                      alt={`Lançamento ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <CardHeader className="items-center px-0 text-center">
                    <CardTitle className="text-lg font-light tracking-wide text-black transition-colors duration-300 group-hover:text-gray-700">
                      Peça Exclusiva {(index + 1).toString().padStart(2, '0')}
                    </CardTitle>
                    <CardDescription className="text-sm font-light tracking-wide text-gray-600">
                      Coleção Primavera/Verão 2025
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {brandValues.map((value, index) => (
              <Reveal key={value.letter} delay={index * 100}>
                <Card className="group gap-0 rounded-none bg-transparent py-0 text-center ring-0">
                  <CardContent className="px-0">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-gray-300 transition-colors duration-500 group-hover:border-black group-hover:bg-black group-hover:text-white">
                      <span
                        className="text-2xl transition-transform duration-500 group-hover:scale-110"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {value.letter}
                      </span>
                    </div>
                    <h3 className="mb-4 text-xl font-light tracking-wide text-black">
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
      </section>
    </div>
  );
};

export default Hero;
