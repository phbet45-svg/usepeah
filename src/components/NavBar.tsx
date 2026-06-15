import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, HelpCircle } from 'lucide-react';
import { Category } from '../types';

interface NavBarProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (subcat: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function NavBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  cartCount,
  onOpenCart,
  searchTerm,
  setSearchTerm,
}: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(''); // Reset subcategory when switching major category
    setMobileMenuOpen(false);
  };

  const handleSubcategorySelect = (catId: string, sub: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(sub);
    setMobileMenuOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchTerm('');
    setMobileMenuOpen(false);
  };

  return (
    <header id="store-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-atelier-line transition-all">
      {/* Upper Announcement Bar / Editorial Line */}
      <div className="bg-luxe-dark text-stone-300 text-center py-2 px-4 text-[10px] tracking-luxury font-sans uppercase font-light">
        MODELOS EXCLUSIVOS &bull; ENVIAMOS PARA TODO O BRASIL &bull; 10% DE DESCONTO COM <span className="text-luxury font-medium tracking-wide">WELCOME10</span>
      </div>

      {/* Main Luxury Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between">
        {/* Left Side: Mobile Menu Toggler and Desktop Navigation Options */}
        <div className="flex items-center space-x-4 md:w-1/4">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-luxe-dark hover:text-luxury focus:outline-none"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop Categories dropdowns / links */}
          <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-luxury text-luxe-dark font-sans font-normal">
            <button
              id="nav-catalogo-all"
              onClick={handleClearFilters}
              className={`hover:text-luxury py-1 border-b transition-colors duration-300 ${!selectedCategory ? 'text-luxury border-b-luxury font-semibold' : 'border-transparent'}`}
            >
              Coleção Completa
            </button>
            {categories.map((cat) => (
              <div key={cat.id} className="relative group py-2">
                <button
                  id={`nav-cat-${cat.id}`}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`hover:text-luxury flex items-center transition-colors duration-300 ${selectedCategory === cat.id ? 'text-luxury border-b border-b-luxury font-semibold' : ''}`}
                >
                  {cat.name}
                </button>

                {/* Subcategories Dropped list on Hover */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-atelier-line shadow-2xl rounded opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 z-50 p-2">
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub}
                        id={`nav-subcat-${cat.id}-${sub.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => handleSubcategorySelect(cat.id, sub)}
                        className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-luxury text-stone-600 hover:bg-prestige-bg/50 hover:text-luxury rounded transition-all duration-200 ${selectedSubcategory === sub ? 'bg-prestige-bg text-luxury font-semibold' : ''}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Center: Premium Logo as requested */}
        <div className="flex justify-center flex-1 md:w-2/4">
          <button 
            id="nav-logo-btn"
            onClick={handleClearFilters} 
            className="flex flex-col items-center justify-center focus:outline-none focus:ring-0 group py-1.5 transition-all"
          >
            <span 
              id="top-logo-text" 
              className="text-xl sm:text-2xl md:text-3.5xl font-serif tracking-[0.35em] text-luxe-dark group-hover:text-luxury transition-colors duration-500 uppercase font-extralight select-none leading-none pt-1"
            >
              USEPEAH
            </span>
            <div className="w-0 group-hover:w-1/2 h-[1px] bg-luxury/60 transition-all duration-500 mt-2" />
          </button>
        </div>

        {/* Right Side: Search, WhatsApp Quick Contact, shopping bag */}
        <div className="flex items-center justify-end space-x-3 sm:space-x-5 md:w-1/4">
          {/* Custom Search field Toggle */}
          <div className="relative flex items-center">
            {searchOpen && (
              <input
                id="search-input-field"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar modelo..."
                className="w-32 sm:w-44 px-3 py-1.5 text-xs border border-atelier-line outline-none rounded bg-white font-sans text-luxe-dark transition-all placeholder-stone-400 mr-2 focus:border-luxury"
                autoFocus
              />
            )}
            <button
              id="search-toggle-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-luxe-dark hover:text-luxury transition-colors duration-200"
              aria-label="Buscar"
            >
              <Search size={19} />
            </button>
          </div>

          {/* Luxury WhatsApp Link */}
          <a
            id="header-wa-link"
            href="https://wa.me/553299564966"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex text-[10px] items-center tracking-luxury uppercase font-sans text-luxury hover:text-luxe-dark transition-colors duration-200"
          >
            Fale Conosco
          </a>

          {/* Cart Icon */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="p-2 text-luxe-dark hover:text-luxury transition-colors duration-200 relative flex items-center"
            aria-label="Carrinho"
          >
            <ShoppingBag size={20} className="stroke-[1.75]" />
            {cartCount > 0 && (
              <span 
                id="cart-badge"
                className="absolute -top-1 -right-1 bg-luxe-dark text-white border border-luxury text-[9px] font-sans font-medium w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="md:hidden bg-white border-t border-stone-100 p-4 absolute left-0 right-0 shadow-2xl z-40 animate-fadeIn">
          <div className="space-y-4">
            <button
              id="mobile-nav-all"
              onClick={handleClearFilters}
              className={`w-full text-left px-3 py-2.5 text-xs uppercase tracking-widest font-sans ${!selectedCategory ? 'bg-stone-50 text-stone-950 font-bold border-l-2 border-l-[#DBBBA0]' : 'text-stone-600'}`}
            >
              Coleção Completa
            </button>
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <button
                  id={`mobile-nav-cat-${cat.id}`}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-3 py-2.5 text-xs uppercase tracking-widest font-sans font-medium flex justify-between items-center ${selectedCategory === cat.id ? 'bg-stone-50 text-stone-950 font-bold border-l-2 border-l-[#DBBBA0]' : 'text-stone-600'}`}
                >
                  <span>{cat.name}</span>
                </button>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="pl-6 space-y-1">
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub}
                        id={`mobile-nav-subcat-${cat.id}-${sub.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => handleSubcategorySelect(cat.id, sub)}
                        className={`w-full text-left py-1.5 text-[10.5px] uppercase tracking-wider text-stone-500 hover:text-stone-950 block ${selectedSubcategory === sub ? 'text-[#BB8E72] font-semibold' : ''}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
