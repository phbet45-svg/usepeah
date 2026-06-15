import React, { useState, useEffect } from 'react';
import { Product, Category, StoreConfig, Banner } from '../types';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, MessageSquare, MapPin, Phone } from 'lucide-react';

interface StoreFrontProps {
  products: Product[];
  categories: Category[];
  config: StoreConfig;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (subcat: string) => void;
  onSelectProduct: (product: Product) => void;
  searchTerm: string;
}

export default function StoreFront({
  products,
  categories,
  config,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  onSelectProduct,
  searchTerm,
}: StoreFrontProps) {
  // Filters & Sorting state
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('popular'); // price-asc, price-desc, popular, recent
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Load configuration banners
  const mainBanners = config?.banners?.filter(b => b.type === 'main') || [];
  const promoBanners = config?.banners?.filter(b => b.type === 'promo') || [];

  // Automated Banner Auto-advance carousel
  useEffect(() => {
    if (mainBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % mainBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [mainBanners]);

  // Derived Filtered Products
  const filteredProducts = products.filter((p) => {
    // 1. Category check
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    // 2. Subcategory check
    if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;
    // 3. Search check
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(term);
      const matchesDesc = p.description.toLowerCase().includes(term);
      const matchesSku = p.sku.toLowerCase().includes(term);
      if (!matchesName && !matchesDesc && !matchesSku) return false;
    }
    // 4. Color check
    if (selectedColor && !p.colors.includes(selectedColor)) return false;
    // 5. Size check
    if (selectedSize && !p.sizes.includes(selectedSize)) return false;
    // 6. Max Price check
    const currentPrice = p.promoPrice || p.price;
    if (currentPrice > maxPrice) return false;

    return true;
  });

  // Sorting Products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const pA = a.promoPrice || a.price;
    const pB = b.promoPrice || b.price;
    if (sortBy === 'price-asc') return pA - pB;
    if (sortBy === 'price-desc') return pB - pA;
    if (sortBy === 'recent') return b.createdAt > a.createdAt ? 1 : -1;
    // Default or popular sorting
    return b.stock - a.stock; 
  });

  // Available Filter values extracted dynamically
  const uniqueColors = Array.from(new Set(products.flatMap((p) => p.colors)));
  const uniqueSizes = Array.from(new Set(products.flatMap((p) => p.sizes)));

  return (
    <div className="bg-cream-soft text-luxe-dark">
      {/* 1. Hero Fullscreen Visual Banner - Carousels */}
      {mainBanners.length > 0 && (
        <section id="hero-carousel" className="relative h-[80vh] sm:h-[90vh] lg:h-[95vh] bg-luxe-dark overflow-hidden">
          {mainBanners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${idx === activeBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              {/* Overlay shadow for text contrast */}
              <div className="absolute inset-0 bg-black/45 z-10" />
              <img
                src={banner.imageUrl}
                alt={banner.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scaling-slow"
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                <span className="text-[10px] tracking-supreme text-luxury uppercase font-sans mb-3 bg-black/40 px-4 py-1.5 border border-luxury/20 rounded-none backdrop-blur-[2px]">
                  USEPEAH LUXURY APPAREL
                </span>
                <h2 className="text-[#FAF9F6] font-serif text-3xl sm:text-5xl md:text-6xl tracking-widest font-light uppercase max-w-4xl leading-tight">
                  {banner.title}
                </h2>
                <p className="text-stone-300 text-xs sm:text-sm font-sans font-light tracking-luxury max-w-xl mt-4">
                  {banner.subtitle}
                </p>
                <button
                  id={`hero-action-btn-${idx}`}
                  onClick={() => {
                    const el = document.getElementById('catalog-products-stage');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-8 px-10 py-4 bg-luxe-dark border border-luxury text-white hover:bg-luxury hover:text-luxe-dark transition-all duration-300 text-xs uppercase tracking-luxury font-sans font-medium rounded-none shadow-xl"
                >
                  Conhecer Peças
                </button>
              </div>
            </div>
          ))}

          {/* Carousel indicators dots */}
          {mainBanners.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-2.5">
              {mainBanners.map((_, idx) => (
                <button
                  key={idx}
                  id={`carousel-dot-${idx}`}
                  onClick={() => setActiveBannerIdx(idx)}
                  className={`w-2 h-2 rounded-full border transition-all ${idx === activeBannerIdx ? 'bg-luxury border-luxury scale-125' : 'bg-transparent border-white/60 hover:bg-white/40'}`}
                  aria-label="ir para slide"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. Main Catalog Grid Display Section */}
      <section id="catalog-products-stage" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-fadeIn">
        {/* Dynamic Section Header depending on selected filters */}
        <div className="text-center mb-10 md:mb-16">
          <span className="text-[10px] tracking-luxury text-luxury uppercase font-sans font-light block mb-2">
            CONHEÇA AS CRIAÇÕES
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-luxe-dark font-extralight tracking-widest uppercase">
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.name 
              : 'Elegância em Detalhes'}
          </h2>
          {selectedSubcategory && (
            <p className="text-luxury text-[11px] uppercase tracking-luxury font-sans font-light mt-1">
              Filtro ativo: {selectedSubcategory}
            </p>
          )}
          {/* Ornamental dynamic golden details for high-fashion elegance */}
          <div className="flex items-center justify-center space-x-3.5 mt-4">
            <div className="w-14 h-[0.5px] bg-gradient-to-r from-transparent to-luxury/65" />
            <span className="text-xs text-luxury font-serif font-light flex items-center gap-1">✦ <span className="italic">ateliê</span> ✦</span>
            <div className="w-14 h-[0.5px] bg-gradient-to-l from-transparent to-luxury/65" />
          </div>
        </div>

        {/* Luxury circular Instagram highlights fashion collections list category switcher */}
        <div className="mb-14 select-none lg:mb-20">
          <div className="flex items-center justify-center space-x-6 sm:space-x-10 overflow-x-auto py-4 px-2 no-scrollbar scroll-smooth">
            {/* All Options */}
            <button
              id="switch-category-all"
              onClick={() => {
                setSelectedCategory('');
                setSelectedSubcategory('');
              }}
              className="flex flex-col items-center shrink-0 space-y-3 group focus:outline-none focus:ring-0"
            >
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] transition-all duration-700 ${!selectedCategory ? 'bg-gradient-to-tr from-luxury via-white to-luxury shadow-[0_0_15px_rgba(201,160,118,0.45)] scale-105' : 'bg-transparent group-hover:p-[1.5px] group-hover:bg-[#C9A076]/40'}`}>
                <div className="w-full h-full rounded-full overflow-hidden border border-white bg-neutral-900 relative">
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop"
                    alt="Coleção Completa"
                    className="w-full h-full object-cover transition duration-[1500ms] group-hover:scale-110 filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition duration-500" />
                </div>
              </div>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-luxury transition-colors duration-300 font-sans ${!selectedCategory ? 'text-luxury font-semibold' : 'text-stone-500 group-hover:text-luxury'}`}>
                Coleção Completa
              </span>
            </button>

            {categories.map((cat) => {
              // Custom Unsplash Luxury cover lookup for premium circles
              let coverUrl = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop"; // Vestidos
              if (cat.id === 'conjuntos') coverUrl = "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400&auto=format&fit=crop";
              if (cat.id === 'blusas-camisas') coverUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop";
              if (cat.id === 'alfaiataria') coverUrl = "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop";

              return (
                <button
                  key={cat.id}
                  id={`switch-category-${cat.id}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory('');
                  }}
                  className="flex flex-col items-center shrink-0 space-y-3 group focus:outline-none focus:ring-0"
                >
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] transition-all duration-700 ${selectedCategory === cat.id ? 'bg-gradient-to-tr from-luxury via-white to-luxury shadow-[0_0_15px_rgba(201,160,118,0.45)] scale-105' : 'bg-transparent group-hover:p-[1.5px] group-hover:bg-[#C9A076]/40'}`}>
                    <div className="w-full h-full rounded-full overflow-hidden border border-white bg-neutral-900 relative">
                      <img
                        src={coverUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover transition duration-[1500ms] group-hover:scale-110 filter brightness-95"
                      />
                      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition duration-500" />
                    </div>
                  </div>
                  <span className={`text-[10px] sm:text-[11px] uppercase tracking-luxury transition-colors duration-300 font-sans ${selectedCategory === cat.id ? 'text-luxury font-semibold' : 'text-stone-500 group-hover:text-luxury'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar Filter Controls Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-y border-atelier-line py-4 mb-8 gap-4 px-2">
          {/* Left Toolbar button */}
          <button
            id="filters-toggle-active-btn"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="flex items-center space-x-2.5 text-xs text-luxe-dark hover:text-luxury font-medium uppercase tracking-luxury transition-colors"
          >
            <SlidersHorizontal size={14} className="text-luxury" />
            <span>Filtros {showFiltersMobile ? 'Ocultar' : 'Exibir'}</span>
          </button>

          {/* Counts */}
          <div className="text-xs text-stone-500 font-light font-sans tracking-wide">
            Mostrando {sortedProducts.length} de {products.length} modelos
          </div>

          {/* Sort selection dropdown */}
          <div className="flex items-center space-x-2 text-xs text-luxe-dark">
            <ArrowUpDown size={14} className="text-luxury" />
            <select
              id="sort-select-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-luxe-dark hover:text-luxury outline-none cursor-pointer focus:ring-0 font-medium tracking-luxury uppercase text-[11px]"
            >
              <option value="popular">Destaques</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="recent">Lançamentos</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filter Sidebar - can toggle view */}
          {showFiltersMobile && (
            <aside id="side-filters-panel" className="lg:col-span-3 p-6 bg-white border border-atelier-line space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-luxury text-luxury font-medium">
                  Refinar Busca
                </h3>
                <button
                  id="clear-all-sidebar-filters"
                  onClick={() => {
                    setSelectedColor('');
                    setSelectedSize('');
                    setMaxPrice(1000);
                  }}
                  className="text-[10px] uppercase font-sans tracking-luxury text-stone-400 hover:text-luxe-dark"
                >
                  Limpar tudo
                </button>
              </div>

              {/* Price filter slide */}
              <div className="space-y-3">
                <span className="text-[11px] uppercase tracking-luxury text-luxe-dark font-medium">Faixa de Preço</span>
                <input
                  id="range-price-slider"
                  type="range"
                  min="50"
                  max="1200"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-luxury cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs font-sans text-stone-500">
                  <span>Até R$ {maxPrice}</span>
                </div>
              </div>

              {/* Unique Colors filtering */}
              {uniqueColors.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-luxury text-luxe-dark font-medium">Cores Disponíveis</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {uniqueColors.map((color) => (
                      <button
                        key={color}
                        id={`filter-color-chip-${color.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                        className={`px-3 py-1.5 text-[10px] font-sans border transition-all duration-200 ${selectedColor === color ? 'bg-luxe-dark text-[#FAF9F6] border-luxe-dark' : 'bg-white text-luxe-dark border-atelier-line hover:border-luxury'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Unique Sizes filtering */}
              {uniqueSizes.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-luxury text-luxury font-medium">Grade</span>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map((sz) => (
                      <button
                        key={sz}
                        id={`filter-size-chip-${sz}`}
                        onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                        className={`w-9 h-9 flex items-center justify-center text-xs border transition-all duration-200 ${selectedSize === sz ? 'bg-luxe-dark text-white border-luxe-dark' : 'bg-white text-stone-600 border-atelier-line hover:border-luxury'}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}

          {/* Catalog Grid output */}
          <div className={`${showFiltersMobile ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
            {sortedProducts.length === 0 ? (
              <div id="empty-catalog-fallback" className="text-center py-20 text-stone-400">
                <p className="text-sm">Nenhum modelo disponível com os filtros ativos.</p>
                <button
                  id="reset-filter-triggers"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                    setSelectedColor('');
                    setSelectedSize('');
                    setMaxPrice(1000);
                  }}
                  className="mt-4 px-8 py-3 bg-luxe-dark text-white border border-luxury hover:bg-luxury hover:text-luxe-dark transition-all duration-300 text-xs uppercase tracking-luxury font-sans rounded-none"
                >
                  Ver Coleção Completa
                </button>
              </div>
            ) : (
              <div id="product-grid-container" className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
                {sortedProducts.map((p) => (
                  <div
                    key={p.id}
                    id={`grid-product-card-${p.id}`}
                    onClick={() => onSelectProduct(p)}
                    className="group cursor-pointer flex flex-col space-y-4 border border-transparent hover:border-atelier-line p-3 transition-all duration-700 hover:bg-white bg-cream-soft/50 shadow-sm hover:shadow-xl"
                  >
                    {/* Visual box container */}
                    <div className="aspect-[3/4] bg-[#FAF9F6] overflow-hidden relative border border-atelier-line rounded-none">
                      {/* Product image with sleek zooming animation on desktop */}
                      <img
                        src={p.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop'}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-[1500ms] scale-100 group-hover:scale-[1.04]"
                      />

                      {/* Luxurious zoom-focus hover overlay */}
                      <div className="absolute inset-0 bg-luxe-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <span className="bg-[#FAF9F6] text-luxe-dark text-[10px] tracking-supreme uppercase font-sans py-3 px-5 border border-luxury/40 font-medium transition-all duration-500 transform translate-y-3 group-hover:translate-y-0 shadow-lg">
                          Ver Modelo
                        </span>
                      </div>

                      {/* Display Sale discount percentages tag if promo is active */}
                      {p.promoPrice && (
                        <div id={`tag-discount-${p.id}`} className="absolute top-3 left-3 bg-luxury text-luxe-dark text-[9px] font-sans tracking-luxury font-semibold px-2.5 py-1 uppercase shadow-lg rounded-none border border-white/20">
                          Oferta
                        </div>
                      )}

                      {/* Out of Stock warning */}
                      {p.stock <= 0 && (
                        <div id={`tag-outofstock-${p.id}`} className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="text-[10px] tracking-luxury uppercase text-luxe-dark border border-luxe-dark px-4 py-1.5 font-sans font-medium bg-white/95">
                            Sem estoque
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata specs */}
                    <div className="flex flex-col space-y-1.5 text-center">
                      <span className="text-[9px] uppercase tracking-luxury text-neutral-500 font-sans">
                        {p.subcategory || p.brand}
                      </span>
                      <h3 className="text-sm font-sans font-light text-luxe-dark tracking-wide hover:text-luxury transition-colors duration-200 truncate">
                        {p.name}
                      </h3>
                      <div className="flex flex-col space-y-0.5 items-center justify-center pt-0.5">
                        <div className="flex items-center space-x-2">
                          {p.promoPrice ? (
                            <>
                              <span className="text-sm font-sans font-medium text-luxury">
                                R$ {p.promoPrice.toFixed(2)}
                              </span>
                              <span className="text-xs font-sans text-stone-400 line-through">
                                R$ {p.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-sans font-light text-luxe-dark font-medium">
                              R$ {p.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {/* Premium installment guide helper */}
                        <span className="text-[9.5px] text-stone-400 font-sans tracking-wide">
                          6x de R$ {((p.promoPrice || p.price) / 6).toFixed(2)} sem juros
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Elegance Editorial Promo Banner Grid */}
      {promoBanners.length > 0 && (
        <section id="promo-banners-gallery" className="bg-[#FAF9F6] border-y border-atelier-line py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              {/* Promotion image banner */}
              <div className="md:col-span-7 aspect-[4/3] overflow-hidden rounded-none shadow-2xl relative group border border-atelier-line w-full">
                <img
                  src={promoBanners[0].imageUrl}
                  alt="Exclusive style promotion"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-[2000ms]"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
              <div className="md:col-span-5 space-y-6 max-w-lg">
                <span className="text-[11px] uppercase tracking-luxury font-sans text-luxury font-medium block">
                  Exclusividade Brasileira
                </span>
                <h3 className="text-3xl sm:text-5xl font-serif text-luxe-dark font-extralight tracking-wide leading-tight">
                  {promoBanners[0].title || 'A moda mineira moldada com cuidado e esmero'}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light font-serif italic text-justify">
                  {promoBanners[0].subtitle || 'Nossas coleções celebram o romantismo da mulher contemporânea. Do ateliê em Ubá, cada recorte, cada bainha invisível e cada botão é escolhido para durar gerações com beleza intacta.'}
                </p>
                <div className="pt-2">
                  <a
                    id="editorial-wa-link"
                    href="https://wa.me/553299564966"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 border border-luxe-dark text-luxe-dark hover:bg-luxury hover:text-luxe-dark hover:border-luxury px-10 py-4 transition-all duration-300 text-xs font-sans font-medium uppercase tracking-luxury rounded-none w-full sm:w-auto justify-center shadow-lg"
                  >
                    <span>Falar no Whatsapp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Elegant Client Testimonials & Social Proof (Depoimentos) */}
      <section id="testimonials-carousel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-cream-soft">
        <div className="text-center mb-16">
          <span className="text-[9px] uppercase tracking-luxury text-luxury block mb-2 font-sans">Feedback</span>
          <h2 className="text-2xl sm:text-4xl font-serif text-luxe-dark font-extralight tracking-widest uppercase">
            Depoimentos com Amor
          </h2>
          <div className="w-16 h-[1px] bg-luxury/50 inline-block mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white border border-atelier-line flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
            <p className="text-stone-600 text-xs italic leading-relaxed font-serif">
              "Fiquei perplexa com o acabamento da alfaiataria! O linho do blazer Charlotte é estruturado mas tem uma leveza e caimento incomparáveis. Já quero em todas as cores."
            </p>
            <div className="mt-6 pt-4 border-t border-stone-150 text-[10px] font-sans uppercase tracking-luxury text-luxury">
              &bull; Helena S., Belo Horizonte
            </div>
          </div>
          <div className="p-8 bg-white border border-atelier-line flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
            <p className="text-stone-600 text-xs italic leading-relaxed font-serif">
              "O atendimento pelo WhatsApp foi carinhoso e ágil. Me mandaram fotos adicionais das costuras ocultas do vestido de seda. A Usepeah é uma marca com propósito real!"
            </p>
            <div className="mt-6 pt-4 border-t border-stone-150 text-[10px] font-sans uppercase tracking-luxury text-luxury">
              &bull; Marianna L., Ubá - MG
            </div>
          </div>
          <div className="p-8 bg-white border border-atelier-line flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
            <p className="text-stone-600 text-xs italic leading-relaxed font-serif">
              "Simplesmente perfeito! Deu asas para mim em eventos executivos de alto gabarito. O design clean, sem adereços bobos, transmite exatamente o luxo minimalista."
            </p>
            <div className="mt-6 pt-4 border-t border-stone-150 text-[10px] font-sans uppercase tracking-luxury text-luxury">
              &bull; Cecília B., São Paulo
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimalist Digital Store Locator Map Area */}
      <section id="location-showroom-block" className="border-t border-atelier-line py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-luxe-dark font-sans">
            Conheça Nosso Showroom
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed max-w-xl mx-auto font-serif">
            Gostamos do contato físico e cafezinho mineiro passível de abraços! Venha visitar nosso showroom oficial de luxo em Ubá - MG.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto text-xs pt-4 font-sans uppercase tracking-luxury text-stone-700">
            <div className="flex flex-col items-center p-6 bg-cream-soft border border-atelier-line hover:border-luxury transition duration-300">
              <MapPin size={18} className="text-luxury mb-2" />
              <span className="text-center leading-normal">
                Avenida Olegário Maciel, 295<br />
                Bairro Industrial, Ubá - MG
              </span>
            </div>
            <div className="flex flex-col items-center p-6 bg-cream-soft border border-atelier-line hover:border-luxury transition duration-300">
              <Phone size={18} className="text-luxury mb-2" />
              <span className="text-center">
                Atendimento Rápido<br />
                (32) 99564-9966
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
