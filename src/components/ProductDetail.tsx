import React, { useState } from 'react';
import { ShoppingBag, Ruler, X, ArrowLeft, Heart, Check, HelpCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onSelectProduct: (p: Product) => void;
}

export default function ProductDetail({
  product,
  relatedProducts,
  onBack,
  onAddToCart,
  onSelectProduct,
}: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Nude Elegante');
  const [activeImage, setActiveImage] = useState(product.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Elegant Interactive Zoom on Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      display: 'block',
      backgroundSize: '250%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2500);
  };

  return (
    <div id={`product-detail-${product.id}`} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Return Navigation Breadcrumb */}
      <button
        id="detail-back-button"
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-stone-500 hover:text-luxury text-xs uppercase tracking-luxury mb-8 transition-colors"
      >
        <ArrowLeft size={16} className="text-luxury" />
        <span>Voltar à Coleção</span>
      </button>

      {/* Product Information Core Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left: Professional Visual Gallery with Interactive Zoom */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Thumbnails Sidebar - Desktop */}
          <div className="hidden sm:flex sm:flex-col sm:col-span-2 space-y-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                id={`thumb-image-${idx}`}
                onClick={() => setActiveImage(img)}
                className={`aspect-square border bg-cream-soft overflow-hidden relative rounded-none transition ${activeImage === img ? 'border-luxury shadow-md ring-1 ring-luxury/50' : 'border-atelier-line hover:border-luxury/55'}`}
                style={{ borderColor: activeImage === img ? '#C9A076' : '#EFE6DC' }}
              >
                <img
                  src={img}
                  alt={`${product.name} visual ${idx}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Large Main Stage Image with Zoom Refinement */}
          <div className="sm:col-span-10 relative aspect-[3/4] bg-[#FAF9F6] border border-atelier-line rounded-none overflow-hidden">
            <div
              id="zoom-hover-stage"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-full cursor-zoom-in relative"
            >
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Floating Magnified Overlay Mirror */}
              <div
                id="zoom-magnifier-lens"
                className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                style={zoomStyle}
              />
            </div>

            {/* Quick Badge overlay */}
            {product.promoPrice && product.promoPrice < product.price && (
              <span id="product-promo-detail-badge" className="absolute top-4 left-4 bg-luxury text-luxe-dark text-[9px] tracking-luxury uppercase font-sans font-medium px-2.5 py-1.5 border border-white/20 shadow-lg rounded-none">
                Oferta Exclusiva
              </span>
            )}
          </div>

          {/* Mobile Thumbnails Row */}
          <div className="flex sm:hidden space-x-2.5 overflow-x-auto pt-2 pb-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                id={`thumb-image-mobile-${idx}`}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 shrink-0 aspect-square border overflow-hidden rounded-none ${activeImage === img ? 'border-luxury' : 'border-atelier-line'}`}
              >
                <img
                  src={img}
                  alt="mobile thumb"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Premium Detail Checkout Specifications */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="space-y-2 border-b border-atelier-line pb-5">
            <div className="text-[10px] uppercase tracking-luxury text-neutral-500 font-sans">
              {product.brand} &bull; SKU: {product.sku}
            </div>
            <h1 id="detail-product-name" className="text-2xl sm:text-3xl font-serif text-luxe-dark tracking-wide font-light uppercase">
              {product.name}
            </h1>

            {/* Pricing Section with Luxury Installments */}
            <div className="space-y-1 pt-2">
              <div className="flex items-baseline space-x-3.5">
                {product.promoPrice ? (
                  <>
                    <span id="detail-promo-price" className="text-2xl sm:text-3xl font-sans font-medium text-luxury">
                      R$ {product.promoPrice.toFixed(2)}
                    </span>
                    <span id="detail-regular-price-old" className="text-sm font-sans text-stone-400 line-through">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span id="detail-regular-price" className="text-2xl sm:text-3xl font-sans font-light text-luxe-dark">
                    R$ {product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-[10.5px] uppercase tracking-wider text-rose-800/80 font-sans mt-1">
                Ou até <span className="font-semibold text-luxe-dark">6x de R$ {((product.promoPrice || product.price) / 6).toFixed(2)}</span> sem juros no cartão
              </p>
            </div>
          </div>

          {/* Description Block */}
          <p id="detail-description" className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light text-justify">
            {product.description}
          </p>

          {/* Colors Selection Grid */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase tracking-luxury text-luxury font-sans block">
              Cor Escolhida: <span className="text-luxe-dark font-medium">{selectedColor}</span>
            </span>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((color) => {
                const colorMap: { [key: string]: string } = {
                  'Rosé Gold': 'bg-[#E3C6B3]',
                  'Off White': 'bg-[#FAF9F5] border border-atelier-line',
                  'Champagne': 'bg-[#EADBC8]',
                  'Preto Premium': 'bg-[#1A1A1A]',
                  'Nude Elegante': 'bg-[#E4D1B9]',
                  'Preto': 'bg-[#1A1A1A]',
                  'Cru': 'bg-[#EFEAE2]',
                  'Azul': 'bg-blue-900',
                  'Verde': 'bg-emerald-900'
                };
                const bgClass = colorMap[color] || 'bg-stone-400';
                return (
                  <button
                    key={color}
                    id={`detail-color-selector-${color.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center relative border transition-all ${selectedColor === color ? 'border-luxury scale-105 shadow-md' : 'border-atelier-line hover:border-luxury/60'}`}
                    title={color}
                  >
                    <span className={`w-5 h-5 rounded-full ${bgClass} block`} />
                    {selectedColor === color && (
                      <Check size={10} className="absolute text-[#FAF9F6] stroke-[4] drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selections and Measurement Toggles */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-luxury text-luxury font-sans block">
                Escolha o Tamanho
              </span>
              <button
                id="open-size-helper-btn"
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center space-x-1.5 text-[10px] uppercase tracking-luxury text-luxury hover:text-luxe-dark transition-colors font-sans border-b border-luxury/40 pb-0.5"
              >
                <Ruler size={13} className="text-luxury" />
                <span>Tabela de Medidas</span>
              </button>
            </div>
            
            <div className="flex gap-2.5">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  id={`detail-size-selector-${sz}`}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-12 h-12 flex items-center justify-center font-sans text-xs border rounded-none transition-all duration-200 ${selectedSize === sz ? 'bg-luxe-dark text-white border-luxury' : 'border-atelier-line text-stone-700 hover:border-luxury'}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-4 flex space-x-4">
            <button
              id="detail-action-add-to-cart"
              disabled={product.stock <= 0}
              onClick={handleAddToCartClick}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-xs uppercase tracking-luxury font-sans font-medium rounded-none transition duration-300 shadow-xl ${
                product.stock <= 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-300'
                  : addedSuccess
                    ? 'bg-emerald-600 border border-emerald-500 text-white'
                    : 'bg-luxe-dark hover:bg-luxury hover:text-luxe-dark border border-luxury text-white active:scale-[0.98]'
              }`}
            >
              <ShoppingBag size={15} />
              <span>
                {product.stock <= 0 
                  ? 'Sem Estoque' 
                  : addedSuccess 
                    ? 'Adicionado com sucesso!' 
                    : 'Adicionar ao Carrinho'}
              </span>
            </button>

            <button
              id="detail-action-favorite"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-3.5 border rounded-none flex items-center justify-center transition-all duration-200 ${isFavorite ? 'border-luxury bg-cream-soft text-luxury shadow-lg' : 'border-atelier-line text-[#C2C2C2] hover:text-luxury hover:border-luxury'}`}
              aria-label="Favoritar"
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'text-luxury' : ''} />
            </button>
          </div>

          {/* Express Logistics Details */}
          <div className="border-t border-atelier-line pt-5 space-y-2.5 text-[11px] text-stone-500 font-light font-serif">
            <div>&bull; Envio nacional expresso com embalagem exclusiva perfumada para presente.</div>
            <div>&bull; Disponível para retirada física em Ubá - MG, acompanhado de atendimento premium.</div>
            <div>&bull; Facilidade luxuosa: parcele suas compras do Pix ao cartão.</div>
          </div>
        </div>
      </div>

      {/* Related Premium Products Showcase */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24 border-t border-atelier-line pt-12 animate-fadeIn">
          <h2 className="text-xl sm:text-2xl font-serif text-luxe-dark tracking-luxury text-center uppercase mb-8 font-light">
            Você Também Vai Amar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                id={`related-grid-item-${p.id}`}
                onClick={() => {
                  onSelectProduct(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer space-y-3 p-2 hover:bg-white border border-transparent hover:border-atelier-line transition duration-300"
              >
                <div className="aspect-[3/4] bg-[#FAF9F6] overflow-hidden relative border border-atelier-line rounded-none">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-103"
                  />
                  {p.promoPrice && (
                    <span className="absolute top-2 left-2 bg-luxury text-luxe-dark text-[8px] uppercase tracking-luxury font-medium px-2 py-0.5 border border-white/20 rounded-none shadow-md">
                      REDUÇÃO
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xs font-sans font-light text-luxe-dark group-hover:text-luxury transition-colors truncate">
                    {p.name}
                  </h3>
                  <div className="flex gap-2 items-baseline justify-center mt-1">
                    {p.promoPrice ? (
                      <>
                        <span className="text-[11px] text-luxury font-medium">R$ {p.promoPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-stone-400 line-through">R$ {p.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-[11px] text-luxe-dark font-light">R$ {p.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elegantly Floating Size Guide Drawer (Tabela de Medidas Modal) */}
      {sizeGuideOpen && (
        <div id="size-guide-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-cream-soft rounded-none shadow-3xl max-w-lg w-full overflow-hidden border border-atelier-line animate-slideUp">
            <div className="bg-luxe-dark border-b border-atelier-line text-stone-100 p-5 flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-luxury text-white">
                Tabela de Medidas Usepeah
              </h3>
              <button
                id="close-size-guide-modal"
                onClick={() => setSizeGuideOpen(false)}
                className="text-stone-400 hover:text-luxury transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-stone-600 text-xs font-light mb-4 leading-relaxed font-serif text-justify">
                Nossas modelagens são pensadas para vestir com maestria e sutileza. Siga nosso guia de medidas aproximadas (em centímetros) para escolher seu encaixe perfeito.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-atelier-line text-luxury uppercase tracking-luxury font-medium">
                      <th className="py-2.5 px-3">Tamanho</th>
                      <th className="py-2.5 px-3">Busto</th>
                      <th className="py-2.5 px-3">Cintura</th>
                      <th className="py-2.5 px-3">Quadril</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-atelier-line text-[#1A1A1A] font-serif">
                    <tr>
                      <td className="py-3 px-3 font-semibold">P (36-38)</td>
                      <td className="py-3 px-3">84 - 88 cm</td>
                      <td className="py-3 px-3">66 - 70 cm</td>
                      <td className="py-3 px-3">94 - 98 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">M (40)</td>
                      <td className="py-3 px-3">89 - 93 cm</td>
                      <td className="py-3 px-3">71 - 75 cm</td>
                      <td className="py-3 px-3">99 - 103 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">G (42)</td>
                      <td className="py-3 px-3">94 - 98 cm</td>
                      <td className="py-3 px-3">76 - 80 cm</td>
                      <td className="py-3 px-3">104 - 108 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">GG (44)</td>
                      <td className="py-3 px-3">99 - 103 cm</td>
                      <td className="py-3 px-3">81 - 85 cm</td>
                      <td className="py-3 px-3">109 - 113 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 bg-white p-4 border border-atelier-line text-[10.5px] text-neutral-500 leading-relaxed font-light">
                * Caso suas medidas fiquem entre dois tamanhos, recomendamos selecionar o maior para que possa receber ajustes de alfaiataria caso sinta necessidade de maior amplitude.
              </div>
            </div>
            <div className="bg-white/50 px-6 py-4 flex justify-end border-t border-atelier-line">
              <button
                id="close-size-guide-modal-bottom"
                onClick={() => setSizeGuideOpen(false)}
                className="bg-luxe-dark border border-luxury text-white hover:bg-luxury hover:text-luxe-dark rounded-none px-6 py-2.5 text-xs uppercase tracking-luxury font-medium transition duration-300"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
