// Original self-contained SVG artwork for every List 14 scene, plus the Professor Potato mascot.
// Hand-written for WordWild: no external images, fonts, CDNs or copyrighted characters.
// Scenes never print the target word. Tiny bits of text in art are only things like numbers or "psst".

const eye = (x, y, r = 9, dx = 0, dy = 0) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="${x + dx}" cy="${y + dy}" r="${r * 0.45}" fill="#222"/>`;
let gradientCount = 0; // each SVG needs its own gradient id: ids are document-global, so a shared "sky" would repaint every scene
const bg = (a, b, ground = "#7ac74f") => { const id = "sky" + ++gradientCount; return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
   <rect width="400" height="300" fill="url(#${id})"/>${ground ? `<rect y="235" width="400" height="65" fill="${ground}"/>` : ""}`; };
const star = (x, y, s = 1, c = "#ffe14d") => `<polygon transform="translate(${x} ${y}) scale(${s})" points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3" fill="${c}" stroke="#d9a400" stroke-width="1"/>`;
const T = (x, y, s, size = 20, fill = "#222", anchor = "middle", weight = 800) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${s}</text>`;

const SCENES = {
  supper: () => bg("#ffb35c", "#ff8a3d", "#c98b52") + `
    <rect x="30" y="200" width="340" height="22" rx="8" fill="#8d5524"/><rect x="60" y="222" width="18" height="70" fill="#6d3f19"/><rect x="322" y="222" width="18" height="70" fill="#6d3f19"/>
    <polygon points="70,170 20,215 82,205" fill="#3fa34d"/><ellipse cx="120" cy="165" rx="62" ry="48" fill="#4cbb5a" stroke="#1d6b2b" stroke-width="3"/>
    <circle cx="155" cy="110" r="36" fill="#4cbb5a" stroke="#1d6b2b" stroke-width="3"/><g fill="#2e8c3b"><polygon points="105,125 118,100 128,127"/><polygon points="130,120 145,92 152,122"/></g>
    ${eye(146, 104, 9, 3)}${eye(170, 104, 9, 3)}<path d="M146 132 q12 -10 26 0" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M205 178 h140 a70 62 0 0 1 -140 0z" fill="#fff" stroke="#555" stroke-width="3"/><ellipse cx="275" cy="178" rx="70" ry="12" fill="#ff7a4d"/>
    <g transform="rotate(-18 280 150)"><rect x="240" y="120" width="86" height="16" rx="8" fill="#2d7dd2"/><circle cx="256" cy="144" r="8" fill="#333"/><circle cx="310" cy="144" r="8" fill="#333"/></g>
    <path d="M250 105 q-10 -18 0 -30 M285 108 q10 -18 0 -30" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`,

  number: () => bg("#1f2a6b", "#3b4fb8", "#2b3a80") + `${star(40, 40, 1.2)}${star(350, 60)}${star(300, 25, .8)}${star(90, 90, .7)}
    <rect x="40" y="190" width="320" height="60" rx="14" fill="#ff7aa8"/><rect x="40" y="180" width="320" height="30" rx="12" fill="#ffd1e1"/>
    <g fill="#fff" stroke="#9aa" stroke-width="3"><circle cx="150" cy="165" r="38"/><circle cx="120" cy="150" r="24"/><circle cx="185" cy="148" r="24"/><circle cx="150" cy="135" r="24"/></g>
    <circle cx="150" cy="160" r="22" fill="#3a3a3a"/>${eye(142, 155, 7, 2)}${eye(160, 155, 7, 2)}<path d="M142 172 q8 6 16 0" stroke="#fff" stroke-width="3" fill="none"/>
    ${T(70, 90, "1", 34, "#ffe14d")}${T(120, 60, "2", 34, "#7be0ff")}${T(185, 50, "3", 34, "#ff9ad5")}${T(250, 70, "4", 34, "#9dff7a")}${T(300, 110, "?", 46, "#fff")}`,

  over: () => bg("#10163f", "#2a2f7a", null) + `${star(50, 50)}${star(330, 40, .8)}${star(110, 120, .6)}${star(360, 200, .9)}
    <circle cx="270" cy="110" r="72" fill="#fff3a8" stroke="#e8c84a" stroke-width="4"/><circle cx="245" cy="95" r="12" fill="#f0dd7a"/><circle cx="295" cy="130" r="16" fill="#f0dd7a"/><circle cx="285" cy="80" r="8" fill="#f0dd7a"/>
    <g transform="rotate(-14 150 175)"><ellipse cx="150" cy="180" rx="62" ry="34" fill="#fff" stroke="#222" stroke-width="3"/><ellipse cx="130" cy="176" rx="16" ry="12" fill="#222"/><ellipse cx="170" cy="190" rx="14" ry="10" fill="#222"/>
    <circle cx="215" cy="165" r="24" fill="#fff" stroke="#222" stroke-width="3"/><ellipse cx="238" cy="172" rx="12" ry="9" fill="#ffb3c6"/>${eye(212, 158, 6, 2)}
    <g stroke="#222" stroke-width="7" stroke-linecap="round"><path d="M110 205 l-10 34"/><path d="M135 212 l-6 34"/><path d="M170 212 l6 34"/><path d="M195 205 l14 30"/></g></g>
    <rect x="270" y="215" width="86" height="40" rx="6" fill="#fff" stroke="#888" stroke-width="2" transform="rotate(8 313 235)"/><rect x="278" y="225" width="48" height="6" fill="#ccc" transform="rotate(8 313 235)"/>`,

  ladder: () => bg("#8fd6ff", "#d6f1ff", "#7ac74f") + `
    <g stroke="#7a4a1a" stroke-width="10" stroke-linecap="round"><line x1="240" y1="245" x2="300" y2="30"/><line x1="320" y1="245" x2="360" y2="30"/></g>
    <g stroke="#a86a2a" stroke-width="8" stroke-linecap="round"><line x1="246" y1="215" x2="326" y2="215"/><line x1="256" y1="170" x2="334" y2="170"/><line x1="268" y1="125" x2="342" y2="125"/><line x1="280" y1="80" x2="350" y2="80"/></g>
    <rect x="110" y="120" width="44" height="130" rx="18" fill="#ffd14a" stroke="#b9871a" stroke-width="3"/><ellipse cx="130" cy="95" rx="40" ry="30" fill="#ffd14a" stroke="#b9871a" stroke-width="3"/>
    <g fill="#c98a1a"><circle cx="128" cy="150" r="8"/><circle cx="140" cy="190" r="9"/><circle cx="120" cy="215" r="7"/></g>
    <rect x="104" y="42" width="52" height="64" rx="22" fill="#ffd14a" stroke="#b9871a" stroke-width="3"/><g fill="#c98a1a"><rect x="116" y="30" width="6" height="14"/><rect x="136" y="30" width="6" height="14"/></g>
    <rect x="108" y="64" width="22" height="14" rx="5" fill="#111"/><rect x="134" y="64" width="22" height="14" rx="5" fill="#111"/><rect x="128" y="68" width="8" height="4" fill="#111"/>
    <path d="M118 92 q14 10 28 0" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>`,

  sister: () => bg("#ffc2dd", "#ffe3ef", "#d9a066") + `
    <rect x="215" y="170" width="150" height="14" rx="4" fill="#8d5524"/><rect x="225" y="184" width="10" height="60" fill="#6d3f19"/><rect x="345" y="184" width="10" height="60" fill="#6d3f19"/>
    <rect x="250" y="150" width="46" height="20" fill="#fff" stroke="#555" transform="rotate(-6 273 160)"/><rect x="300" y="152" width="40" height="18" fill="#fff" stroke="#555" transform="rotate(5 320 160)"/>
    <circle cx="312" cy="120" r="26" fill="#ff9a3c" stroke="#a85a10" stroke-width="3"/><circle cx="292" cy="98" r="9" fill="#ff9a3c" stroke="#a85a10" stroke-width="3"/><circle cx="332" cy="98" r="9" fill="#ff9a3c" stroke="#a85a10" stroke-width="3"/>${eye(303, 118, 6, 2)}${eye(322, 118, 6, 2)}<circle cx="313" cy="130" r="4" fill="#d6527a"/>
    <rect x="80" y="140" width="70" height="100" rx="24" fill="#6a5acd"/><circle cx="115" cy="110" r="36" fill="#ffd6b3" stroke="#a8714a" stroke-width="3"/><path d="M78 105 q10 -44 70 -28 q14 18 6 40 q-4 -20 -26 -24 q-34 2 -50 12z" fill="#5b3a1a"/>
    ${eye(102, 112, 7, 2)}${eye(128, 112, 7, 2)}<path d="M100 130 q16 14 32 0" stroke="#c0392b" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M150 160 l70 -12" stroke="#ffd6b3" stroke-width="12" stroke-linecap="round"/><rect x="214" y="138" width="42" height="7" rx="3" fill="#ffd34d" transform="rotate(-14 235 142)"/>`,

  spider: () => bg("#e8d5ff", "#f6eeff", "#b58a5a") + `
    <rect x="20" y="190" width="360" height="30" rx="6" fill="#8d5524"/>
    <g fill="#ff7a59" stroke="#b33a1f" stroke-width="2"><rect x="30" y="140" width="60" height="44"/><rect x="40" y="100" width="60" height="40"/><rect x="310" y="140" width="60" height="44"/><rect x="300" y="100" width="60" height="40"/></g>
    <g stroke="#3a1a5a" stroke-width="6" stroke-linecap="round" fill="none"><path d="M180 120 q-40 -30 -70 10"/><path d="M180 130 q-50 0 -80 40"/><path d="M185 140 q-40 20 -60 60"/><path d="M195 145 q-20 20 -30 55"/>
      <path d="M220 120 q40 -30 70 10"/><path d="M220 130 q50 0 80 40"/><path d="M215 140 q40 20 60 60"/><path d="M205 145 q20 20 30 55"/></g>
    <circle cx="200" cy="115" r="46" fill="#8e44ad" stroke="#4a1a6a" stroke-width="4"/>${eye(182, 105, 11, 3)}${eye(218, 105, 11, 3)}<path d="M182 132 q18 14 36 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g fill="#222"><ellipse cx="96" cy="206" rx="14" ry="7"/><ellipse cx="118" cy="214" rx="14" ry="7"/><ellipse cx="282" cy="214" rx="14" ry="7"/><ellipse cx="304" cy="206" rx="14" ry="7"/></g>`,

  soccer: () => bg("#9ee0ff", "#d3f2ff", "#3fae49") + `
    <g stroke="#fff" stroke-width="4" fill="none"><rect x="60" y="60" width="280" height="170"/><path d="M60 100 h280 M60 140 h280 M60 180 h280 M110 60 v170 M160 60 v170 M210 60 v170 M260 60 v170 M310 60 v170" stroke-width="1.5" opacity=".7"/></g>
    <g stroke="#e0661a" stroke-width="9" stroke-linecap="round" fill="none"><path d="M200 175 q-60 -10 -90 -60"/><path d="M200 175 q-70 20 -100 -10"/><path d="M205 180 q-60 40 -80 40"/><path d="M215 182 q-20 40 -10 50"/><path d="M225 180 q60 -10 90 -60"/><path d="M225 175 q70 20 100 -10"/><path d="M222 182 q60 30 80 40"/><path d="M212 186 q20 36 40 48"/></g>
    <g fill="#fff" stroke="#c44" stroke-width="3"><circle cx="108" cy="112" r="12"/><circle cx="320" cy="115" r="12"/><circle cx="98" cy="162" r="12"/><circle cx="330" cy="164" r="12"/></g>
    <ellipse cx="214" cy="140" rx="50" ry="46" fill="#ff8a3c" stroke="#c24f08" stroke-width="3"/>${eye(196, 130, 11, 3)}${eye(232, 130, 11, 3)}<path d="M198 158 q16 12 32 0" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="340" cy="60" r="20" fill="#fff" stroke="#222" stroke-width="3"/><polygon points="340,50 349,57 346,68 334,68 331,57" fill="#222"/>`,

  thunder: () => bg("#4a5568", "#2d3748", null) + `
    <g fill="#9aa5b5" stroke="#5a6678" stroke-width="3"><circle cx="150" cy="95" r="45"/><circle cx="205" cy="75" r="55"/><circle cx="260" cy="100" r="42"/><rect x="130" y="95" width="150" height="40" rx="20"/></g>
    <path d="M178 82 l20 8 M232 82 l-20 8" stroke="#222" stroke-width="5" stroke-linecap="round"/>${eye(190, 100, 10, 0, 2)}${eye(225, 100, 10, 0, 2)}<path d="M195 125 q12 -8 24 0" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>
    <polygon points="210,140 180,200 205,200 188,255 245,180 218,180 238,140" fill="#ffe14d" stroke="#e0a800" stroke-width="3"/>
    <ellipse cx="90" cy="215" rx="46" ry="14" fill="#c0392b" stroke="#7a1f14" stroke-width="3"/><rect x="44" y="215" width="92" height="40" fill="#e74c3c" stroke="#7a1f14" stroke-width="3"/><ellipse cx="90" cy="255" rx="46" ry="14" fill="#c0392b" stroke="#7a1f14" stroke-width="3"/>
    <g stroke="#ffe3b0" stroke-width="7" stroke-linecap="round"><path d="M130 180 l-34 36"/><path d="M60 175 l24 38"/></g>${T(330, 220, "BOOM!", 40, "#ffe14d")}`,

  tiger: () => bg("#b497ff", "#d9c9ff", "#7a5cc7") + `
    <ellipse cx="110" cy="240" rx="60" ry="14" fill="#6a4cb3"/><rect x="250" y="190" width="100" height="44" rx="18" fill="#fff" stroke="#999" stroke-width="3"/>
    <ellipse cx="200" cy="190" rx="80" ry="62" fill="#ff9a2c" stroke="#b85a00" stroke-width="3"/>
    <g fill="#5a2f6b"><rect x="130" y="160" width="140" height="14" rx="7" opacity=".85"/><rect x="125" y="190" width="150" height="14" rx="7" opacity=".85"/><rect x="135" y="220" width="130" height="14" rx="7" opacity=".85"/></g>
    <circle cx="200" cy="105" r="52" fill="#ff9a2c" stroke="#b85a00" stroke-width="3"/><circle cx="160" cy="62" r="16" fill="#ff9a2c" stroke="#b85a00" stroke-width="3"/><circle cx="240" cy="62" r="16" fill="#ff9a2c" stroke="#b85a00" stroke-width="3"/>
    <g stroke="#222" stroke-width="5" stroke-linecap="round"><path d="M176 62 l8 14"/><path d="M224 62 l-8 14"/><path d="M148 100 l16 4"/><path d="M252 100 l-16 4"/></g>
    ${eye(182, 100, 11, 2)}${eye(218, 100, 11, 2)}<ellipse cx="200" cy="124" rx="22" ry="16" fill="#fff"/><circle cx="200" cy="118" r="6" fill="#d6527a"/><path d="M190 130 q10 8 20 0" stroke="#222" stroke-width="3" fill="none"/>`,

  chapter: () => bg("#8be0ff", "#c9f3ff", "#e8c37a") + `
    <circle cx="200" cy="150" r="105" fill="#bfeaff" fill-opacity=".55" stroke="#5aa8d6" stroke-width="5"/><path d="M110 150 q90 40 180 0 a105 105 0 0 1 -180 0" fill="#7ccdf2" fill-opacity=".6"/>
    <ellipse cx="170" cy="130" rx="42" ry="28" fill="#ff8a1f" stroke="#b34f00" stroke-width="3"/><polygon points="130,130 100,108 100,152" fill="#ff8a1f" stroke="#b34f00" stroke-width="3"/>${eye(188, 122, 9, 3)}<path d="M192 140 q8 6 14 0" stroke="#222" stroke-width="3" fill="none"/>
    <g transform="rotate(-10 250 160)"><rect x="215" y="135" width="70" height="52" fill="#c0392b" stroke="#7a1f14" stroke-width="3"/><rect x="222" y="142" width="56" height="38" fill="#fff6dc"/><path d="M226 152 h44 M226 162 h36 M226 172 h40" stroke="#bba" stroke-width="3"/><path d="M285 150 q14 6 6 22" stroke="#fff6dc" stroke-width="5" fill="none"/></g>
    <g fill="#fff" fill-opacity=".8" stroke="#5aa8d6" stroke-width="2"><circle cx="230" cy="110" r="10"/><circle cx="262" cy="92" r="7"/><circle cx="215" cy="78" r="5"/><circle cx="280" cy="125" r="6"/></g>`,

  afternoon: () => bg("#ffd27a", "#ff9a5c", "#8a6a3a") + `
    <circle cx="320" cy="205" r="55" fill="#fff3a8" stroke="#ffb400" stroke-width="5"/><g stroke="#ffb400" stroke-width="6" stroke-linecap="round"><path d="M320 125 v-18 M375 150 l12 -10 M262 150 l-12 -10"/></g>
    <rect x="20" y="70" width="360" height="22" rx="10" fill="#7a4a1a"/>
    <ellipse cx="170" cy="150" rx="62" ry="40" fill="#a1744a" stroke="#5a3a1a" stroke-width="3"/><g stroke="#5a3a1a" stroke-width="7" stroke-linecap="round"><path d="M120 110 l-10 -18 M150 106 l-4 -16 M200 106 l4 -16 M225 112 l10 -16"/></g>
    <ellipse cx="210" cy="150" rx="38" ry="30" fill="#d9b48a" stroke="#5a3a1a" stroke-width="3"/><ellipse cx="195" cy="144" rx="13" ry="9" fill="#4a2f1a"/><ellipse cx="228" cy="144" rx="13" ry="9" fill="#4a2f1a"/><circle cx="197" cy="144" r="4" fill="#fff"/><circle cx="226" cy="144" r="4" fill="#fff"/>
    <path d="M200 162 q10 8 20 0" stroke="#222" stroke-width="3" fill="none"/><ellipse cx="210" cy="156" rx="6" ry="4" fill="#222"/>
    <path d="M262 100 h100 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-60 l-14 16 v-16 h-26 a10 10 0 0 1 -10 -10 v-30 a10 10 0 0 1 10 -10z" fill="#fff" stroke="#555" stroke-width="3"/>${T(312, 134, "good mor...", 17, "#444")}`,

  scattering: () => bg("#ffe4b8", "#ffcf8a", "#b07a46") + `
    <rect x="20" y="150" width="130" height="90" rx="18" fill="#2aa198" stroke="#146a63" stroke-width="3"/><rect x="10" y="150" width="30" height="95" rx="12" fill="#1f8a82"/><rect x="130" y="150" width="30" height="95" rx="12" fill="#1f8a82"/>
    <rect x="330" y="80" width="10" height="150" fill="#666"/><path d="M310 80 h50 l-10 -34 h-30z" fill="#ffe14d" stroke="#c9a400" stroke-width="3"/>
    <path d="M250 150 q60 -70 20 -100 q-50 20 -20 100" fill="#b5651d" stroke="#6d3b0e" stroke-width="3"/><ellipse cx="225" cy="190" rx="38" ry="44" fill="#b5651d" stroke="#6d3b0e" stroke-width="3"/><circle cx="205" cy="145" r="28" fill="#b5651d" stroke="#6d3b0e" stroke-width="3"/>
    <circle cx="190" cy="122" r="9" fill="#b5651d" stroke="#6d3b0e" stroke-width="3"/>${eye(198, 142, 8, 2)}${eye(220, 142, 8, 2)}<path d="M200 160 q10 6 20 0" stroke="#222" stroke-width="3" fill="none"/>
    <g fill="#8b5a2b" stroke="#4a2f1a" stroke-width="2"><ellipse cx="120" cy="100" rx="9" ry="12"/><ellipse cx="80" cy="130" rx="9" ry="12"/><ellipse cx="290" cy="215" rx="9" ry="12"/><ellipse cx="350" cy="190" rx="9" ry="12"/><ellipse cx="150" cy="60" rx="9" ry="12"/><ellipse cx="60" cy="70" rx="9" ry="12"/><ellipse cx="300" cy="40" rx="9" ry="12"/><ellipse cx="160" cy="260" rx="9" ry="12"/></g>
    <g stroke="#b07a46" stroke-width="3" stroke-linecap="round" opacity=".7"><path d="M180 150 l-40 -20 M178 160 l-60 8 M185 170 l-40 40"/></g>`,

  whispered: () => bg("#d9f0ff", "#f0f9ff", "#c9b28a") + `
    <polygon points="260,250 380,250 330,150" fill="#ffd34d" stroke="#c99a00" stroke-width="3" transform="rotate(-14 320 220)"/><g fill="#e0a800" transform="rotate(-14 320 220)"><circle cx="330" cy="215" r="8"/><circle cx="305" cy="235" r="6"/><circle cx="350" cy="238" r="7"/></g>
    <ellipse cx="150" cy="200" rx="50" ry="42" fill="#b8bfc9" stroke="#6d7684" stroke-width="3"/><circle cx="130" cy="150" r="32" fill="#b8bfc9" stroke="#6d7684" stroke-width="3"/>
    <circle cx="106" cy="122" r="22" fill="#ffb3c6" stroke="#6d7684" stroke-width="3"/><circle cx="154" cy="116" r="22" fill="#ffb3c6" stroke="#6d7684" stroke-width="3"/>${eye(120, 148, 8, 3)}${eye(142, 146, 8, 3)}<circle cx="156" cy="162" r="6" fill="#d6527a"/>
    <path d="M148 172 q14 6 26 -2" stroke="#222" stroke-width="3" fill="none"/><path d="M176 170 q40 -10 76 14" stroke="#b8bfc9" stroke-width="12" stroke-linecap="round" fill="none"/>
    ${T(215, 150, "psst...", 18, "#555", "middle", 700)}<path d="M170 160 q20 -12 36 -6" stroke="#9aa" stroke-width="2" fill="none" stroke-dasharray="3 5"/>`,

  understand: () => bg("#d7e3ff", "#eef3ff", "#9aa8c7") + `
    <rect x="130" y="206" width="150" height="34" rx="6" fill="#e74c3c" stroke="#7a1f14" stroke-width="3"/><rect x="138" y="212" width="134" height="22" fill="#fff6dc"/><path d="M146 220 h110" stroke="#bba" stroke-width="3"/>
    <rect x="155" y="120" width="100" height="90" rx="14" fill="#b9c2d0" stroke="#566" stroke-width="3"/><rect x="170" y="62" width="70" height="60" rx="14" fill="#cfd6e2" stroke="#566" stroke-width="3"/>
    <line x1="205" y1="62" x2="205" y2="36" stroke="#566" stroke-width="4"/><circle cx="205" cy="32" r="8" fill="#ff5a5a"/>
    ${eye(188, 88, 11, 2)}${eye(222, 88, 11, -2)}<path d="M186 108 l36 -4" stroke="#222" stroke-width="4" stroke-linecap="round"/>
    <rect x="178" y="140" width="54" height="30" rx="6" fill="#7ad0ff" stroke="#566" stroke-width="2"/><g fill="#566"><circle cx="190" cy="155" r="4"/><circle cx="205" cy="155" r="4"/><circle cx="220" cy="155" r="4"/></g>
    <path d="M155 140 q-30 20 -20 50" stroke="#b9c2d0" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M255 140 q30 20 20 50" stroke="#b9c2d0" stroke-width="10" fill="none" stroke-linecap="round"/>
    ${T(285, 70, "?", 60, "#ff7a00")}${T(120, 90, "?", 36, "#6a5acd")}${T(320, 130, "?", 30, "#2aa198")}`,

  newspaper: () => bg("#bfe7ff", "#e6f6ff", "#f4fbff") + `
    <ellipse cx="150" cy="190" rx="48" ry="62" fill="#222"/><ellipse cx="150" cy="205" rx="30" ry="46" fill="#fff"/><circle cx="150" cy="120" r="36" fill="#222"/><ellipse cx="150" cy="130" rx="24" ry="20" fill="#fff"/>
    ${eye(138, 114, 9, 2)}${eye(162, 114, 9, -2)}<polygon points="142,126 158,126 150,142" fill="#ff9a1f" stroke="#c46a00" stroke-width="2"/><ellipse cx="136" cy="248" rx="18" ry="8" fill="#ff9a1f"/><ellipse cx="166" cy="248" rx="18" ry="8" fill="#ff9a1f"/>
    <g transform="rotate(-6 250 160)"><rect x="190" y="100" width="130" height="110" fill="#f5f0e1" stroke="#555" stroke-width="3"/><rect x="200" y="110" width="110" height="22" fill="#222"/>
    <g stroke="#777" stroke-width="3"><path d="M202 145 h50 M202 158 h50 M202 171 h50 M202 184 h50 M262 145 h48 M262 158 h48"/></g><rect x="262" y="170" width="46" height="30" fill="#bbb"/></g>
    <g stroke="#7ac0e8" stroke-width="3" fill="#e6f6ff"><rect x="296" y="228" width="26" height="22" rx="4"/><rect x="326" y="228" width="26" height="22" rx="4"/></g>${T(364, 224, "!", 40, "#e74c3c")}
    <rect x="290" y="250" width="86" height="12" rx="3" fill="#9aa"/>`,

  butterfly: () => bg("#ffe0f5", "#fff3fb", "#8ed36b") + `
    <g stroke="#2d3a8c" stroke-width="3"><path d="M200 140 q-110 -90 -150 10 q20 70 150 20z" fill="#ff6fb5"/><path d="M200 150 q-90 90 -110 40 q10 -50 110 -30z" fill="#b57bff"/>
    <path d="M200 140 q110 -90 150 10 q-20 70 -150 20z" fill="#ff6fb5"/><path d="M200 150 q90 90 110 40 q-10 -50 -110 -30z" fill="#b57bff"/></g>
    <g fill="#fff" opacity=".85"><circle cx="110" cy="135" r="12"/><circle cx="290" cy="135" r="12"/><circle cx="130" cy="180" r="8"/><circle cx="270" cy="180" r="8"/></g>
    <ellipse cx="200" cy="165" rx="14" ry="48" fill="#3a2a5a"/><circle cx="200" cy="110" r="20" fill="#3a2a5a"/><g stroke="#3a2a5a" stroke-width="3" fill="none" stroke-linecap="round"><path d="M192 94 q-16 -22 -30 -14"/><path d="M208 94 q16 -22 30 -14"/></g>
    <rect x="186" y="104" width="12" height="9" rx="3" fill="#111"/><rect x="202" y="104" width="12" height="9" rx="3" fill="#111"/>
    <g stroke="#2e7d32" stroke-width="5"><line x1="50" y1="240" x2="50" y2="190"/><line x1="350" y1="240" x2="350" y2="190"/></g>
    <circle cx="50" cy="182" r="20" fill="#ffd14a" stroke="#c99a00" stroke-width="3"/>${eye(44, 178, 5, 1)}${eye(58, 178, 5, 1)}<path d="M42 190 q8 6 16 0" stroke="#222" stroke-width="2" fill="none"/>
    <circle cx="350" cy="182" r="20" fill="#ff6a5a" stroke="#a82a1a" stroke-width="3"/>${eye(344, 178, 5, -1)}${eye(358, 178, 5, -1)}<path d="M342 190 q8 6 16 0" stroke="#222" stroke-width="2" fill="none"/>
    <rect x="262" y="214" width="46" height="10" rx="4" fill="#3a2a5a" transform="rotate(-20 285 219)"/><path d="M300 238 q8 -14 16 0 q8 14 16 0" stroke="#3a2a5a" stroke-width="3" fill="none"/>${star(80, 60)}${star(330, 70, .8)}${star(280, 40, .6)}`,

  upstairs: () => bg("#c9b8ff", "#e6dcff", null) + `
    <rect y="235" width="400" height="65" fill="#6a4cb3"/>
    <g fill="#a98bff" stroke="#4a2f9a" stroke-width="3"><polygon points="40,235 120,235 120,200 40,200" /><polygon points="120,200 200,200 200,165 120,165"/><polygon points="200,165 280,165 280,130 200,130"/><polygon points="280,130 360,130 360,95 280,95"/></g>
    <rect x="100" y="38" width="200" height="14" fill="#4a2f9a"/>
    <path d="M170 168 q-30 -90 30 -100 q60 10 30 100 q-10 18 -20 -8 q-10 20 -20 0 q-10 20 -20 6 q-10 6 0 2z" fill="#fff" stroke="#8a8aaa" stroke-width="3"/>
    ${eye(190, 112, 11, 2)}${eye(220, 112, 11, 2)}<ellipse cx="205" cy="140" rx="10" ry="12" fill="#444"/>
    <rect x="150" y="166" width="110" height="18" rx="6" fill="#4a2f9a" opacity=".5"/>${T(330, 70, "oops!", 24, "#6a4cb3")}`,

  staring: () => bg("#2c3e50", "#4a6572", "#5a4630") + `${star(60, 40, .7, "#fff3a8")}${star(330, 50, .6, "#fff3a8")}
    <rect x="10" y="190" width="380" height="50" rx="22" fill="#7a5a34" stroke="#4a3418" stroke-width="3"/>
    <ellipse cx="115" cy="170" rx="46" ry="62" fill="#9c6b3c" stroke="#5a3a1a" stroke-width="3"/><circle cx="115" cy="110" r="46" fill="#9c6b3c" stroke="#5a3a1a" stroke-width="3"/><polygon points="80,78 92,56 104,84" fill="#7a4f27"/><polygon points="126,84 138,56 150,78" fill="#7a4f27"/>
    ${eye(98, 110, 22)}${eye(134, 110, 22)}<polygon points="106,130 124,130 115,148" fill="#ff9a1f" stroke="#b36a00" stroke-width="2"/>
    <ellipse cx="290" cy="176" rx="50" ry="54" fill="#ff9a2c" stroke="#b85a00" stroke-width="3"/><circle cx="290" cy="118" r="44" fill="#ff9a2c" stroke="#b85a00" stroke-width="3"/><polygon points="252,92 262,60 284,84" fill="#ff9a2c" stroke="#b85a00" stroke-width="3"/><polygon points="296,84 318,60 328,92" fill="#ff9a2c" stroke="#b85a00" stroke-width="3"/>
    ${eye(273, 118, 20)}${eye(307, 118, 20)}<path d="M280 142 l10 6 l10 -6" stroke="#222" stroke-width="3" fill="none"/><g stroke="#222" stroke-width="2"><path d="M246 136 h-26 M246 144 h-24 M334 136 h26 M334 144 h24"/></g>`,

  animal: () => bg("#ffe9b8", "#ffd48a", "#c98a4a") + `
    <rect x="20" y="190" width="360" height="30" rx="6" fill="#a05a2c"/><rect x="40" y="165" width="130" height="30" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M40 165 h130 M40 180 h130" stroke="#c0392b" stroke-width="2"/>
    <rect x="270" y="150" width="90" height="42" rx="4" fill="#d9a066" stroke="#7a4a1a" stroke-width="3"/><circle cx="315" cy="168" r="16" fill="#ff7a4d"/><circle cx="305" cy="164" r="4" fill="#ffd34d"/><circle cx="322" cy="174" r="4" fill="#ffd34d"/>
    <rect x="170" y="100" width="50" height="100" rx="22" fill="#f5e6c8" stroke="#a88a5a" stroke-width="3"/><rect x="176" y="40" width="38" height="70" rx="18" fill="#f5e6c8" stroke="#a88a5a" stroke-width="3"/>
    <ellipse cx="195" cy="40" rx="30" ry="24" fill="#f5e6c8" stroke="#a88a5a" stroke-width="3"/><ellipse cx="172" cy="18" rx="8" ry="16" fill="#f5e6c8" stroke="#a88a5a" stroke-width="3"/><ellipse cx="218" cy="18" rx="8" ry="16" fill="#f5e6c8" stroke="#a88a5a" stroke-width="3"/>
    ${eye(185, 40, 7, 2)}${eye(206, 40, 7, 2)}<ellipse cx="196" cy="56" rx="12" ry="8" fill="#e8b8a0"/><path d="M190 58 q6 4 12 0" stroke="#222" stroke-width="2" fill="none"/>
    <path d="M170 130 h50 v60 q-25 12 -50 0z" fill="#fff" stroke="#c0392b" stroke-width="3"/><rect x="40" y="180" width="130" height="22" fill="#fff" opacity="0"/>
    <rect x="228" y="120" width="40" height="30" rx="3" fill="#ffd34d" stroke="#c99a00" stroke-width="2" transform="rotate(8 248 135)"/>${T(248, 142, "Greg", 13, "#222")}`,

  another: () => bg("#c7f0ff", "#e8f8ff", "#9bdc7a") + `
    <circle cx="105" cy="150" r="30" fill="#ffd6b3" stroke="#a8714a" stroke-width="3"/><path d="M76 146 q8 -34 56 -18 q8 12 0 20 q-8 -14 -30 -10 q-20 2 -26 8z" fill="#5b3a1a"/>${eye(96, 152, 6, 2)}${eye(116, 152, 6, 2)}<path d="M96 164 q10 8 20 0" stroke="#c0392b" stroke-width="3" fill="none"/>
    <rect x="75" y="180" width="60" height="60" rx="20" fill="#ff9a3c"/><path d="M135 200 l40 -24" stroke="#ffd6b3" stroke-width="12" stroke-linecap="round"/>
    <path d="M168 180 a24 24 0 1 1 8 -34 l-18 18z" fill="#d9a066" stroke="#8a5a2a" stroke-width="3"/><g fill="#5a3a1a"><circle cx="160" cy="170" r="3"/><circle cx="172" cy="160" r="3"/></g>
    <g><ellipse cx="290" cy="190" rx="60" ry="55" fill="#3d7dff" stroke="#1a3fa8" stroke-width="3"/><g stroke="#3d7dff" stroke-width="5"><path d="M236 180 l-14 -6 M240 196 l-16 2 M344 180 l14 -6 M340 196 l16 2 M250 236 l-8 14 M330 236 l8 14"/></g>
    ${eye(270, 175, 14, 3)}${eye(310, 175, 14, 3)}<path d="M262 208 q28 24 56 0" fill="#fff" stroke="#222" stroke-width="3"/><path d="M270 215 h40" stroke="#222" stroke-width="2"/></g>
    <path d="M232 170 l-30 -6" stroke="#3d7dff" stroke-width="14" stroke-linecap="round"/><circle cx="196" cy="162" r="20" fill="#d9a066" stroke="#8a5a2a" stroke-width="3"/><g fill="#5a3a1a"><circle cx="190" cy="158" r="3"/><circle cx="202" cy="166" r="3"/><circle cx="195" cy="170" r="3"/></g>`,
};

export function scene(id) {
  const body = SCENES[id];
  if (!body) throw new Error("No scene for " + id);
  return body();
}
export const SCENE_IDS = Object.keys(SCENES);

/** Full <svg> markup. `alt` becomes the accessible name. It must never contain the target word. */
export function sceneSVG(id, alt) {
  return `<svg class="scene" viewBox="0 0 400 300" role="img" aria-label="${alt.replace(/"/g, "&quot;")}">${scene(id)}</svg>`;
}

// ---- Professor Potato: the host. Moods change the face only. ----------------------------------------------
export function potatoSVG(mood = "happy") {
  const mouth = {
    happy: `<path d="M70 120 q30 28 60 0" fill="#fff" stroke="#3a1f0a" stroke-width="4"/>`,
    cheer: `<path d="M64 116 q36 46 72 0z" fill="#7a1f14" stroke="#3a1f0a" stroke-width="4"/><path d="M80 130 q20 12 40 0" fill="#ff8a8a"/>`,
    oops: `<ellipse cx="100" cy="128" rx="14" ry="11" fill="#7a1f14" stroke="#3a1f0a" stroke-width="4"/>`,
    think: `<path d="M78 126 q22 -8 44 4" fill="none" stroke="#3a1f0a" stroke-width="4" stroke-linecap="round"/>`,
  }[mood] || "";
  const brow = mood === "oops" ? `<path d="M62 76 l26 6 M138 76 l-26 6" stroke="#3a1f0a" stroke-width="4" stroke-linecap="round"/>` : "";
  const sweat = mood === "oops" ? `<path d="M150 70 q8 14 0 20 q-8 -6 0 -20z" fill="#7ad0ff" stroke="#2a7aa8" stroke-width="2"/>` : "";
  return `<svg class="potato mood-${mood}" viewBox="0 0 200 200" role="img" aria-label="Professor Potato, a potato in a graduation cap">
    <ellipse cx="100" cy="190" rx="52" ry="8" fill="#000" opacity=".15"/>
    <path d="M100 46 C150 40 176 86 170 128 C164 170 130 186 98 184 C62 182 32 160 30 120 C28 80 54 52 100 46z" fill="#c8995a" stroke="#6d4620" stroke-width="5"/>
    <g fill="#a87438" opacity=".7"><ellipse cx="60" cy="150" rx="6" ry="4"/><ellipse cx="140" cy="158" rx="5" ry="3.5"/><ellipse cx="120" cy="64" rx="5" ry="3"/><ellipse cx="46" cy="110" rx="4" ry="3"/></g>
    <polygon points="100,12 176,40 100,56 24,40" fill="#2b2b3a" stroke="#14141e" stroke-width="3"/><rect x="70" y="44" width="60" height="16" rx="3" fill="#2b2b3a"/>
    <line x1="168" y1="42" x2="184" y2="78" stroke="#ffd34d" stroke-width="4"/><circle cx="184" cy="82" r="6" fill="#ffd34d"/>
    ${eye(76, 96, 13, 1)}${eye(124, 96, 13, 1)}${brow}${mouth}${sweat}
    <circle cx="52" cy="116" r="9" fill="#ff8a8a" opacity=".5"/><circle cx="148" cy="116" r="9" fill="#ff8a8a" opacity=".5"/></svg>`;
}
