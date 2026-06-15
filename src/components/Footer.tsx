import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, Instagram, Disc, Play } from 'lucide-react';
import { SocialConfig } from '../types';

interface FooterProps {
  socials: SocialConfig;
  onAdminClick: () => void;
}

export default function Footer({ socials, onAdminClick }: FooterProps) {
  // Graceful defaults if socials not fully customized
  const igLink = socials?.instagram || 'https://instagram.com/usepeah';
  const fbLink = socials?.facebook || 'https://facebook.com/usepeah';
  const waLink = socials?.whatsapp || 'https://wa.me/553299564966';
  const piLink = socials?.pinterest || 'https://pinterest.com/usepeah';
  const ttLink = socials?.tiktok || 'https://tiktok.com/@usepeah';

  return (
    <footer id="store-footer" className="bg-luxe-dark text-neutral-400 font-sans border-t border-atelier-line mt-auto">
      {/* Editorial Slogan Hero Row */}
      <div className="border-b border-stone-850 py-10 text-center">
        <h2 className="text-[#FAF9F6] font-serif italic text-xl md:text-2xl tracking-widest max-w-2xl mx-auto px-4">
          "Moda com alma, amor com propósito, coragem com estilo."
        </h2>
        <p className="text-[10px] tracking-luxury uppercase text-luxury mt-2 font-sans font-light">
          Usepeah &copy; {new Date().getFullYear()} &bull; Ubá - MG
        </p>
      </div>

      {/* Main Multi-Column Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* About column */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-white font-sans">
            A USEPEAH
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            Nascemos em Ubá, Minas Gerais, com o desejo profundo de vestir mulheres com extrema elegância, sofisticação e alma. Nossas criações primam por modelagens impecáveis e tecidos premium.
          </p>
          <div className="flex space-x-3.5 pt-2">
            <a href={igLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-stone-900 text-luxury hover:text-white hover:bg-luxury/20 border border-luxury/30 transition duration-300" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-stone-900 text-luxury hover:text-white hover:bg-luxury/20 border border-luxury/30 transition duration-300" aria-label="WhatsApp">
              <Phone size={16} />
            </a>
            <a href={piLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-stone-900 text-luxury hover:text-white hover:bg-luxury/20 border border-luxury/30 transition duration-300" aria-label="Pinterest">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Categories helper list */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-white font-sans">
            Coleções
          </h3>
          <ul className="text-xs space-y-2.5 font-light">
            <li><span className="hover:text-luxury transition-colors duration-200 cursor-pointer">Vestidos de Seda</span></li>
            <li><span className="hover:text-luxury transition-colors duration-200 cursor-pointer">Alfaiataria Premium</span></li>
            <li><span className="hover:text-luxury transition-colors duration-200 cursor-pointer">Conjuntos Versáteis</span></li>
            <li><span className="hover:text-luxury transition-colors duration-200 cursor-pointer">Blusas em Crepe</span></li>
          </ul>
        </div>

        {/* Customer Care column */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-white font-sans">
            Atendimento
          </h3>
          <ul className="text-xs space-y-2.5 font-light">
            <li>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-luxury transition-colors duration-200 flex items-center space-x-2">
                <span>Personal Shopper WhatsApp</span>
                <ExternalLink size={11} className="text-luxury" />
              </a>
            </li>
            <li><span className="cursor-pointer hover:text-luxury transition-colors duration-200">Política de Troca</span></li>
            <li><span className="cursor-pointer hover:text-luxury transition-colors duration-200">Guia de Medidas</span></li>
            <li><span className="cursor-pointer hover:text-luxury transition-colors duration-200">Sobre o Envio</span></li>
          </ul>
        </div>

        {/* Physical Store details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-white font-sans">
            Loja Física
          </h3>
          <ul className="text-xs space-y-3 font-light text-neutral-400">
            <li className="flex items-start space-x-2">
              <MapPin size={16} className="text-luxury shrink-0 mt-0.5" />
              <span>
                Avenida Olegário Maciel, 295, Bairro Industrial, Ubá - MG, CEP 36502-000
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone size={14} className="text-luxury shrink-0" />
              <span>(32) 99564-9966 (WhatsApp)</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail size={14} className="text-luxury shrink-0" />
              <span>atendimento@usepeah.com.br</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom / Ground Section */}
      <div className="bg-stone-950 border-t border-stone-900 py-6 text-center text-[11px] text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} USEPEAH. Todos os direitos reservados. CNPJ: 99.999.999/0001-99.
          </div>
          {/* Subtle Invisible Administrative Access Point */}
          <button
            id="admin-hidden-trigger"
            onClick={onAdminClick}
            className="text-[10px] text-neutral-600 hover:text-luxury tracking-luxury font-sans uppercase focus:outline-none transition active:scale-95"
          >
            Área Administrativa
          </button>
        </div>
      </div>
    </footer>
  );
}
