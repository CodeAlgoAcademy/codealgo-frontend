import React, { SVGProps } from "react";
import { cn } from "utils";

interface SpriteIconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
   /** Symbol id in public/assets/icons.svg, see scripts/build-icon-sprite.js. */
   name: string;
   /** Fixed width and height. Without it the icon is 1em, or whatever h-* / w-* classes say. */
   size?: number | string;
}

// An icon drawn from the shared sprite rather than inlined. Used on the public
// marketing pages, where repeated inline icons were a third of the HTML.
// The "i" class (styles/globals.css) gives unsized icons their 1em default.
const SpriteIcon = ({ name, size, className, ...props }: SpriteIconProps) => (
   <svg
      {...(size === undefined ? {} : { width: size, height: size })}
      aria-hidden="true"
      className={size === undefined ? cn("i", className) : className}
      {...props}
   >
      <use href={`/assets/icons.svg#${name}`} />
   </svg>
);

export default SpriteIcon;
