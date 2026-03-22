const svgs = {
  // ── Activiteiten ───────────────────────────────────────────────────────────
  wandelen: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#dcedc8"/>
      <ellipse cx="150" cy="200" rx="200" ry="100" fill="#c5e1a5"/>
      <path d="M0 145 Q50 105 100 125 Q150 145 200 100 Q250 60 300 90 L300 180 L0 180Z" fill="#81c784"/>
      <path d="M0 165 Q60 140 120 155 Q180 170 240 140 Q270 125 300 140 L300 180 L0 180Z" fill="#52b788"/>
      <circle cx="235" cy="38" r="24" fill="#ffe082"/>
      <path d="M235 14 L235 8 M257 22 L263 16 M263 38 L269 38 M257 54 L263 60 M213 22 L207 16 M207 38 L201 38" stroke="#ffd54f" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="95" cy="112" r="7" fill="#2d6a4f"/>
      <line x1="95" y1="119" x2="90" y2="140" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round"/>
      <line x1="95" y1="119" x2="100" y2="140" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round"/>
      <line x1="93" y1="128" x2="85" y2="122" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round"/>
      <line x1="80" y1="130" x2="95" y2="119" stroke="#5d4037" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  fietsen: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#e3f2fd"/>
      <path d="M0 130 Q75 105 150 120 Q225 135 300 115 L300 180 L0 180Z" fill="#bbdefb"/>
      <path d="M0 158 Q80 143 160 152 Q220 158 300 145 L300 180 L0 180Z" fill="#90caf9"/>
      <circle cx="100" cy="105" r="34" fill="none" stroke="#1565c0" strokeWidth="6"/>
      <circle cx="100" cy="105" r="5" fill="#1565c0"/>
      <circle cx="200" cy="105" r="34" fill="none" stroke="#1565c0" strokeWidth="6"/>
      <circle cx="200" cy="105" r="5" fill="#1565c0"/>
      <line x1="100" y1="105" x2="145" y2="62" stroke="#1976d2" strokeWidth="5" strokeLinecap="round"/>
      <line x1="145" y1="62" x2="200" y2="105" stroke="#1976d2" strokeWidth="5" strokeLinecap="round"/>
      <line x1="145" y1="62" x2="155" y2="105" stroke="#1976d2" strokeWidth="4" strokeLinecap="round"/>
      <line x1="155" y1="105" x2="200" y2="105" stroke="#1976d2" strokeWidth="4" strokeLinecap="round"/>
      <line x1="100" y1="105" x2="155" y2="105" stroke="#1976d2" strokeWidth="4" strokeLinecap="round"/>
      <ellipse cx="145" cy="58" rx="14" ry="5" fill="#1565c0"/>
    </svg>
  ),

  water: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#b3e5fc"/>
      <circle cx="245" cy="42" r="28" fill="#fff9c4"/>
      <ellipse cx="60" cy="25" rx="30" ry="12" fill="white" opacity="0.7"/>
      <ellipse cx="180" cy="18" rx="40" ry="14" fill="white" opacity="0.6"/>
      <path d="M0 95 Q37 75 75 95 Q112 115 150 95 Q187 75 225 95 Q262 115 300 95 L300 180 L0 180Z" fill="#4fc3f7"/>
      <path d="M0 120 Q37 105 75 120 Q112 135 150 120 Q187 105 225 120 Q262 135 300 120 L300 180 L0 180Z" fill="#0288d1"/>
      <path d="M0 148 Q37 135 75 148 Q112 161 150 148 Q187 135 225 148 Q262 161 300 148 L300 180 L0 180Z" fill="#01579b"/>
    </svg>
  ),

  kastelen: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#efebe9"/>
      <rect x="0" y="148" width="300" height="32" fill="#bcaaa4"/>
      <rect x="40" y="115" width="220" height="65" fill="#a1887f"/>
      <rect x="110" y="42" width="80" height="106" fill="#8d6e63"/>
      <rect x="110" y="28" width="13" height="18" fill="#8d6e63"/>
      <rect x="128" y="28" width="12" height="18" fill="#8d6e63"/>
      <rect x="146" y="28" width="12" height="18" fill="#8d6e63"/>
      <rect x="164" y="28" width="13" height="18" fill="#8d6e63"/>
      <rect x="137" y="72" width="26" height="30" rx="13" fill="#4e342e"/>
      <rect x="133" y="148" width="34" height="30" rx="17" fill="#4e342e"/>
      <rect x="50" y="75" width="50" height="105" fill="#a1887f"/>
      <rect x="50" y="62" width="11" height="16" fill="#a1887f"/>
      <rect x="65" y="62" width="10" height="16" fill="#a1887f"/>
      <rect x="79" y="62" width="11" height="16" fill="#a1887f"/>
      <rect x="200" y="75" width="50" height="105" fill="#a1887f"/>
      <rect x="200" y="62" width="11" height="16" fill="#a1887f"/>
      <rect x="215" y="62" width="10" height="16" fill="#a1887f"/>
      <rect x="229" y="62" width="11" height="16" fill="#a1887f"/>
      <rect x="62" y="105" width="20" height="26" rx="10" fill="#4e342e"/>
      <rect x="218" y="105" width="20" height="26" rx="10" fill="#4e342e"/>
    </svg>
  ),

  eten: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#fff8e1"/>
      <rect x="0" y="148" width="300" height="32" fill="#ffe082"/>
      <ellipse cx="152" cy="38" rx="22" ry="10" fill="#c8963e" opacity="0.85"/>
      <path d="M130 38 Q130 95 145 115 L159 115 Q174 95 174 38Z" fill="#c8963e" opacity="0.75"/>
      <line x1="152" y1="115" x2="152" y2="145" stroke="#c8963e" strokeWidth="8" strokeLinecap="round"/>
      <line x1="136" y1="145" x2="168" y2="145" stroke="#c8963e" strokeWidth="7" strokeLinecap="round"/>
      <line x1="96" y1="30" x2="96" y2="148" stroke="#5d4037" strokeWidth="6" strokeLinecap="round"/>
      <line x1="84" y1="30" x2="84" y2="72" stroke="#5d4037" strokeWidth="4" strokeLinecap="round"/>
      <line x1="108" y1="30" x2="108" y2="72" stroke="#5d4037" strokeWidth="4" strokeLinecap="round"/>
      <path d="M84 72 Q96 84 108 72" fill="#5d4037"/>
      <line x1="204" y1="30" x2="204" y2="148" stroke="#5d4037" strokeWidth="6" strokeLinecap="round"/>
      <path d="M204 30 Q224 40 224 62 Q224 80 204 88" fill="#9e9e9e" stroke="#9e9e9e" strokeWidth="2"/>
    </svg>
  ),

  overig: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#f5f0e8"/>
      <circle cx="150" cy="90" r="58" fill="none" stroke="#c4b99a" strokeWidth="2"/>
      <circle cx="150" cy="90" r="42" fill="none" stroke="#ddd5c0" strokeWidth="1"/>
      <circle cx="150" cy="90" r="9" fill="#c8963e"/>
      <polygon points="150,32 143,64 157,64" fill="#2d6a4f"/>
      <polygon points="150,148 143,116 157,116" fill="#c4b99a"/>
      <polygon points="208,90 176,83 176,97" fill="#c4b99a"/>
      <polygon points="92,90 124,83 124,97" fill="#c4b99a"/>
      <text x="150" y="27" textAnchor="middle" fontSize="11" fill="#2d6a4f" fontFamily="sans-serif" fontWeight="bold">N</text>
      <text x="150" y="163" textAnchor="middle" fontSize="11" fill="#9e9e9e" fontFamily="sans-serif">S</text>
      <text x="220" y="94" textAnchor="middle" fontSize="11" fill="#9e9e9e" fontFamily="sans-serif">E</text>
      <text x="80" y="94" textAnchor="middle" fontSize="11" fill="#9e9e9e" fontFamily="sans-serif">O</text>
    </svg>
  ),

  // ── Evenementen ────────────────────────────────────────────────────────────
  festival: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#fce4ec"/>
      <line x1="20" y1="45" x2="280" y2="30" stroke="#bdbdbd" strokeWidth="2"/>
      <polygon points="30,45 55,45 42,75" fill="#e91e63"/>
      <polygon points="65,43 90,42 77,72" fill="#ff9800"/>
      <polygon points="100,41 125,40 112,70" fill="#ffeb3b"/>
      <polygon points="135,39 160,38 147,68" fill="#4caf50"/>
      <polygon points="170,38 195,37 182,67" fill="#2196f3"/>
      <polygon points="205,37 230,36 217,66" fill="#9c27b0"/>
      <polygon points="240,36 265,35 252,65" fill="#e91e63"/>
      <ellipse cx="150" cy="130" rx="80" ry="35" fill="#f8bbd0" opacity="0.7"/>
      <text x="150" y="138" textAnchor="middle" fontSize="26" fontFamily="sans-serif">🎪</text>
    </svg>
  ),

  muziek: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#ede7f6"/>
      <rect x="0" y="150" width="300" height="30" fill="#d1c4e9"/>
      <line x1="130" y1="40" x2="200" y2="28" stroke="#7b1fa2" strokeWidth="4"/>
      <line x1="130" y1="40" x2="130" y2="118" stroke="#7b1fa2" strokeWidth="4"/>
      <line x1="200" y1="28" x2="200" y2="106" stroke="#7b1fa2" strokeWidth="4"/>
      <ellipse cx="118" cy="120" rx="14" ry="10" fill="#7b1fa2" transform="rotate(-20 118 120)"/>
      <ellipse cx="188" cy="108" rx="14" ry="10" fill="#9c27b0" transform="rotate(-20 188 108)"/>
      <circle cx="90" cy="80" r="7" fill="#ce93d8"/>
      <line x1="90" y1="73" x2="90" y2="48" stroke="#ce93d8" strokeWidth="3"/>
      <line x1="90" y1="48" x2="104" y2="44" stroke="#ce93d8" strokeWidth="3"/>
      <circle cx="218" cy="65" r="7" fill="#ce93d8"/>
      <line x1="218" y1="58" x2="218" y2="33" stroke="#ce93d8" strokeWidth="3"/>
      <line x1="218" y1="33" x2="232" y2="29" stroke="#ce93d8" strokeWidth="3"/>
    </svg>
  ),

  markt: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#fff9c4"/>
      <rect x="0" y="140" width="300" height="40" fill="#f5deb3"/>
      <rect x="18" y="85" width="80" height="55" fill="#fff"/>
      <path d="M8 90 Q58 65 108 90Z" fill="#e53935"/>
      <rect x="55" y="110" width="22" height="30" fill="#c8963e"/>
      <rect x="118" y="85" width="80" height="55" fill="#fff"/>
      <path d="M108 90 Q158 65 208 90Z" fill="#43a047"/>
      <rect x="155" y="110" width="22" height="30" fill="#c8963e"/>
      <rect x="218" y="85" width="70" height="55" fill="#fff"/>
      <path d="M208 90 Q248 65 288 90Z" fill="#1976d2"/>
      <rect x="248" y="110" width="22" height="30" fill="#c8963e"/>
      <circle cx="70" cy="118" r="9" fill="#ff7043"/>
      <circle cx="85" cy="122" r="7" fill="#ff7043"/>
      <circle cx="160" cy="115" r="8" fill="#66bb6a"/>
      <circle cx="175" cy="120" r="10" fill="#66bb6a"/>
    </svg>
  ),

  sport: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#e8f5e9"/>
      <path d="M0 155 Q75 130 150 145 Q225 160 300 140 L300 180 L0 180Z" fill="#a5d6a7"/>
      <circle cx="155" cy="58" r="12" fill="#2d6a4f"/>
      <line x1="155" y1="70" x2="148" y2="105" stroke="#2d6a4f" strokeWidth="5" strokeLinecap="round"/>
      <line x1="148" y1="105" x2="130" y2="130" stroke="#2d6a4f" strokeWidth="4" strokeLinecap="round"/>
      <line x1="148" y1="105" x2="168" y2="128" stroke="#2d6a4f" strokeWidth="4" strokeLinecap="round"/>
      <line x1="155" y1="82" x2="135" y2="95" stroke="#2d6a4f" strokeWidth="4" strokeLinecap="round"/>
      <line x1="155" y1="82" x2="175" y2="75" stroke="#2d6a4f" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),

  natuur: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#e8f5e9"/>
      <rect x="0" y="148" width="300" height="32" fill="#a5d6a7"/>
      <circle cx="150" cy="62" r="52" fill="#43a047"/>
      <circle cx="108" cy="80" r="35" fill="#388e3c"/>
      <circle cx="192" cy="80" r="35" fill="#388e3c"/>
      <circle cx="150" cy="42" r="32" fill="#66bb6a"/>
      <rect x="143" y="112" width="14" height="40" fill="#5d4037"/>
      <circle cx="58" cy="105" r="26" fill="#52b788"/>
      <circle cx="242" cy="105" r="26" fill="#52b788"/>
      <rect x="53" y="130" width="10" height="22" fill="#5d4037"/>
      <rect x="237" y="130" width="10" height="22" fill="#5d4037"/>
      <circle cx="235" cy="35" r="20" fill="#fff9c4"/>
    </svg>
  ),

  cultuur: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#fff3e0"/>
      <rect x="0" y="152" width="300" height="28" fill="#ffe0b2"/>
      <rect x="95" y="42" width="8" height="105" fill="#795548"/>
      <rect x="197" y="42" width="8" height="105" fill="#795548"/>
      <rect x="87" y="36" width="126" height="8" fill="#795548"/>
      <rect x="85" y="138" width="130" height="12" fill="#795548"/>
      <rect x="100" y="55" width="100" height="75" fill="#fff8f0"/>
      <ellipse cx="150" cy="75" rx="22" ry="22" fill="#ffcc80"/>
      <ellipse cx="150" cy="75" rx="15" ry="15" fill="#ffa726"/>
      <ellipse cx="150" cy="75" rx="8" ry="8" fill="#ff7043"/>
      <path d="M118 108 Q150 90 182 108" stroke="#4caf50" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <line x1="150" y1="36" x2="150" y2="20" stroke="#795548" strokeWidth="5" strokeLinecap="round"/>
      <polygon points="150,10 144,20 156,20" fill="#c8963e"/>
    </svg>
  ),
};

export default function PlaceholderSVG({ type }) {
  const svg = svgs[type] || svgs.overig;
  return (
    <div className="card-placeholder" aria-hidden="true">
      {svg}
    </div>
  );
}
