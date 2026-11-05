import React from 'react';
import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo.png';

export default function BrandLogo({ size = 'md', showTagline = true, to = '/', className = '' }) {
  // Sizing definitions
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  // Logo icon lebih besar sesuai permintaan
  const iconHeight = isSm ? 'h-9' : isLg ? 'h-13 sm:h-14' : 'h-11 sm:h-12';
  const titleSize = isSm ? 'text-xl' : isLg ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-[26px]';
  const taglineSize = isSm ? 'text-[7.5px]' : isLg ? 'text-[10px] sm:text-[11px]' : 'text-[8.5px] sm:text-[9.5px]';

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-3 group select-none ${className}`}
    >
      {/* DT ICON (DIBESARKAN) */}
      <img
        src={logoIcon}
        alt="Logo DT"
        className={`${iconHeight} w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-200`}
      />

      {/* TYPOGRAPHY BRANDING (Sejajar dengan tulisan menu Beranda) */}
      <div className="flex flex-col items-center justify-center pt-1">
        {/* TEXT: DestinaTaste (Optical center lurus dengan menu navigasi) */}
        <div
          className={`font-black ${titleSize} tracking-tight leading-none text-center font-['Nunito',sans-serif] w-full`}
        >
          <span className="text-[#1e4b2d]">Destina</span>
          <span className="text-[#ea7814]">Taste</span>
        </div>

        {/* SUBTITLE: — Explore • Discover • Enjoy — (Agak mepet, strip jelas, panjang sama persis) */}
        {showTagline && (
          <div
            className={`w-full flex items-center justify-between gap-1.5 mt-[3px] text-[#1e4b2d] font-bold ${taglineSize}`}
          >
            {/* Garis strip kiri */}
            <span className="flex-1 h-[1.8px] bg-[#1e4b2d] rounded-full"></span>

            {/* Teks Explore • Discover • Enjoy */}
            <span className="whitespace-nowrap px-1 tracking-[0.05em] font-extrabold font-['Nunito',sans-serif]">
              Explore • Discover • Enjoy
            </span>

            {/* Garis strip kanan */}
            <span className="flex-1 h-[1.8px] bg-[#1e4b2d] rounded-full"></span>
          </div>
        )}
      </div>
    </Link>
  );
}
