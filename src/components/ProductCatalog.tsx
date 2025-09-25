import React, { useState } from 'react';
import { Filter, MessageCircle } from 'lucide-react';

const ProductCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'feminino', label: 'Feminino' },
    { id: 'masculino', label: 'Masculino' },
    { id: 'lancamentos', label: 'Lançamentos' }
  ];

  const products = [
    { id: 1, name: 'Blazer Estruturado Premium', category: 'feminino', price: 'Consulte', image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 2, name: 'Vestido Midi Elegante', category: 'feminino', price: 'Consulte', image: 'https://images.pexels.com/photos/7679471/pexels-photo-7679471.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 3, name: 'Conjunto Sofisticado', category: 'feminino', price: 'Consulte', image: 'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 4, name: 'Camisa Social Premium', category: 'masculino', price: 'Consulte', image: 'https://images.pexels.com/photos/6764042/pexels-photo-6764042.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 5, name: 'Blusa Feminina Exclusiva', category: 'feminino', price: 'Consulte', image: 'https://images.pexels.com/photos/7679868/pexels-photo-7679868.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 6, name: 'Terno Masculino Sob Medida', category: 'masculino', price: 'Consulte', image: 'https://images.pexels.com/photos/6311386/pexels-photo-6311386.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 7, name: 'Vestido Longo Elegante', category: 'lancamentos', price: 'Consulte', image: 'https://images.pexels.com/photos/7679654/pexels-photo-7679654.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 8, name: 'Conjunto Feminino Moderno', category: 'lancamentos', price: 'Consulte', image: 'https://images.pexels.com/photos/7679607/pexels-photo-7679607.jpeg?auto=compress&cs=tinysrgb&w=800' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleWhatsAppClick = (productName: string) => {
    const message = encodeURIComponent(`Olá! Gostaria de consultar a disponibilidade do produto: ${productName}`);
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-6 tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            Catálogo
          </h1>
          <p className="text-gray-600 font-light text-lg max-w-2xl mx-auto">
            Explore nossa coleção de peças cuidadosamente selecionadas para expressar sua personalidade única.
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-12">
          {/* Desktop Filters */}
          <div className="hidden md:flex justify-center space-x-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`pb-2 px-4 text-sm font-light tracking-wide transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'text-black border-b border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Mobile Filter Button */}
          <div className="md:hidden flex justify-center">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 text-black border border-black px-6 py-3"
            >
              <Filter className="w-4 h-4" />
              <span className="font-light tracking-wide">Filtrar</span>
            </button>
          </div>

          {/* Mobile Filter Dropdown */}
          {isFilterOpen && (
            <div className="md:hidden mt-4 bg-white border border-gray-200 rounded-lg shadow-lg">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 text-sm font-light tracking-wide transition-colors duration-300 ${
                    selectedCategory === category.id
                      ? 'text-black bg-gray-50'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="aspect-[3/4] bg-gray-100 mb-6 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-light text-black mb-2 tracking-wide">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm font-light mb-4">
                  {product.price}
                </p>
                <button
                  onClick={() => handleWhatsAppClick(product.name)}
                  className="group bg-black text-white px-6 py-2 flex items-center gap-2 mx-auto hover:bg-gray-800 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-light tracking-wide text-sm">Consultar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 font-light text-lg">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;