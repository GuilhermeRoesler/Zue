import { useState } from 'react';
import { Filter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'feminino', label: 'Feminino' },
  { id: 'masculino', label: 'Masculino' },
  { id: 'lancamentos', label: 'Lançamentos' },
];

const products = [
  { id: 1, name: 'Blazer Estruturado Premium', category: 'feminino', price: 'Consulte', image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 2, name: 'Vestido Midi Elegante', category: 'feminino', price: 'Consulte', image: 'https://images.pexels.com/photos/7679471/pexels-photo-7679471.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 3, name: 'Conjunto Sofisticado', category: 'feminino', price: 'Consulte', image: 'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 4, name: 'Camisa Social Premium', category: 'masculino', price: 'Consulte', image: 'https://images.pexels.com/photos/6764042/pexels-photo-6764042.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 5, name: 'Blusa Feminina Exclusiva', category: 'feminino', price: 'Consulte', image: 'https://images.pexels.com/photos/7679868/pexels-photo-7679868.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 6, name: 'Terno Masculino Sob Medida', category: 'masculino', price: 'Consulte', image: 'https://images.pexels.com/photos/6311386/pexels-photo-6311386.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 7, name: 'Vestido Longo Elegante', category: 'lancamentos', price: 'Consulte', image: 'https://images.pexels.com/photos/7679654/pexels-photo-7679654.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 8, name: 'Conjunto Feminino Moderno', category: 'lancamentos', price: 'Consulte', image: 'https://images.pexels.com/photos/7679607/pexels-photo-7679607.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

const ProductCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const handleWhatsAppClick = (productName: string) => {
    const message = encodeURIComponent(
      `Olá! Gostaria de consultar a disponibilidade do produto: ${productName}`
    );
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1
            className="mb-6 text-4xl font-light tracking-wide text-black md:text-5xl"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Catálogo
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light text-gray-600">
            Explore nossa coleção de peças cuidadosamente selecionadas para expressar sua personalidade única.
          </p>
        </div>

        <div className="mb-12">
          <div className="hidden justify-center space-x-8 md:flex">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'h-auto rounded-none border-b px-4 pb-2 text-sm font-light tracking-wide hover:bg-transparent',
                  selectedCategory === category.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                )}
              >
                {category.label}
              </Button>
            ))}
          </div>

          <div className="flex justify-center md:hidden">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="h-auto gap-2 rounded-none border-black px-6 py-3 font-light tracking-wide text-black hover:bg-transparent"
                >
                  <Filter className="size-4" />
                  Filtrar
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="gap-0 rounded-none bg-white p-0" showCloseButton={false}>
                <SheetHeader className="sr-only">
                  <SheetTitle>Filtrar categorias</SheetTitle>
                </SheetHeader>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setIsFilterOpen(false);
                    }}
                    className={cn(
                      'h-auto w-full justify-start rounded-none px-6 py-4 text-sm font-light tracking-wide',
                      selectedCategory === category.id
                        ? 'bg-gray-50 text-black'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    )}
                  >
                    {category.label}
                  </Button>
                ))}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer gap-0 rounded-none bg-transparent py-0 ring-0"
            >
              <div className="mb-6 aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <CardHeader className="items-center px-0 text-center">
                <CardTitle className="text-lg font-light tracking-wide text-black">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-sm font-light text-gray-600">
                  {product.price}
                </CardDescription>
              </CardHeader>

              <CardFooter className="justify-center rounded-none border-0 bg-transparent px-0 pt-4">
                <Button
                  onClick={() => handleWhatsAppClick(product.name)}
                  className="h-auto gap-2 rounded-none bg-black px-6 py-2 font-light tracking-wide text-white hover:bg-gray-800"
                >
                  <MessageCircle className="size-4" />
                  <span className="text-sm">Consultar</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg font-light text-gray-600">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
