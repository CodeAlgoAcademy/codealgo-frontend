// Builds public/assets/icons.svg, the sprite that components/UI/Icon.tsx
// points at. Marketing pages use it instead of inline <svg> icons: an inline
// icon repeats 300-1700 bytes of path data in the HTML every time it appears,
// a <use> reference is about 100.
//
// To add an icon: add it to the list below, then run
//   node scripts/build-icon-sprite.js
const fs = require("fs");
const path = require("path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const lucide = require("lucide-react");
const bs = require("react-icons/bs");
const bi = require("react-icons/bi");
const io5 = require("react-icons/io5");
const fa = require("react-icons/fa");

const icons = {
   "chevron-right": lucide.ChevronRight,
   lightbulb: lucide.Lightbulb,
   "check-circle": lucide.CheckCircle,
   users: lucide.Users,
   "trending-up": lucide.TrendingUp,
   sparkles: lucide.Sparkles,
   clock: lucide.Clock,
   "book-open": lucide.BookOpen,
   "shield-check": lucide.ShieldCheck,
   book: lucide.Book,
   shield: lucide.Shield,
   youtube: bs.BsYoutube,
   linkedin: bs.BsLinkedin,
   facebook: bs.BsFacebook,
   instagram: bs.BsInstagram,
   x: bs.BsTwitterX,
   bag: bs.BsBagFill,
   "pin-map": bs.BsPinMapFill,
   menu: bi.BiMenu,
   accessibility: io5.IoAccessibility,
   code: fa.FaCode,
   "laptop-code": fa.FaLaptopCode,
};

// Presentation attributes are kept on the <symbol> so each icon keeps its own
// stroke/fill behaviour; currentColor still resolves where the icon is used.
const KEEP = ["viewBox", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"];

const symbols = Object.entries(icons).map(([name, Component]) => {
   if (!Component) throw new Error(`Icon "${name}" was not found in its library`);
   const markup = renderToStaticMarkup(React.createElement(Component));
   const [, attrs, inner] = markup.match(/^<svg([^>]*)>(.*)<\/svg>$/s);
   const kept = KEEP.map((attr) => {
      const found = attrs.match(new RegExp(`\\s${attr}="([^"]*)"`));
      return found ? ` ${attr}="${found[1]}"` : "";
   }).join("");
   return `<symbol id="${name}"${kept}>${inner}</symbol>`;
});

const out = path.join(__dirname, "..", "public", "assets", "icons.svg");
fs.writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join("")}</svg>\n`);
console.log(`Wrote ${symbols.length} icons to ${path.relative(process.cwd(), out)}`);
