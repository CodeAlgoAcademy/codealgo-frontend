import React, { ImgHTMLAttributes } from "react";
import { cn } from "utils";

// The widths Next's image optimizer accepts (its default deviceSizes and
// imageSizes). Asking for any other width is a 400.
const IMAGE_SIZES = [16, 32, 48, 64, 96, 128, 256, 384];
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const ALL_SIZES = [...IMAGE_SIZES, ...DEVICE_SIZES];

const optimized = (src: string, width: number, quality: number) =>
   `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;

const atLeast = (width: number) => ALL_SIZES.find((size) => size >= width) ?? ALL_SIZES[ALL_SIZES.length - 1];

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> {
   /** A local image path, e.g. /assets/landing/build.png. */
   src: string;
   alt: string;
   /** Intrinsic size, for an image that sits in the flow. Leave out when `fill` is set. */
   width?: number;
   height?: number;
   /** Cover the nearest positioned ancestor, like next/image's layout="fill". */
   fill?: boolean;
   quality?: number;
}

/**
 * An optimized image as a single plain <img>.
 *
 * next/image (the legacy component this project's Next version ships) wraps
 * every image in spans and writes its layout as inline style attributes: about
 * 40 of them on the homepage, which the site audit counts against the page.
 * This serves the same resized files from Next's image optimizer, and takes its
 * layout from Tailwind classes instead.
 *
 * Only for local images under /public. Remote images would need the optimizer's
 * domain allow-list.
 */
const OptimizedImage = ({ src, alt, width, height, fill = false, quality = 75, sizes, className, ...rest }: OptimizedImageProps) => {
   if (fill) {
      return (
         <img
            src={optimized(src, DEVICE_SIZES[DEVICE_SIZES.length - 1], quality)}
            srcSet={(sizes ? ALL_SIZES : DEVICE_SIZES).map((size) => `${optimized(src, size, quality)} ${size}w`).join(", ")}
            sizes={sizes ?? "100vw"}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={cn("absolute inset-0 h-full w-full", className)}
            {...rest}
         />
      );
   }

   const oneX = atLeast(width ?? DEVICE_SIZES[0]);
   const twoX = atLeast((width ?? DEVICE_SIZES[0]) * 2);

   return (
      <img
         src={optimized(src, twoX, quality)}
         srcSet={`${optimized(src, oneX, quality)} 1x, ${optimized(src, twoX, quality)} 2x`}
         alt={alt}
         width={width}
         height={height}
         loading="lazy"
         decoding="async"
         className={cn("h-auto max-w-full", className)}
         {...rest}
      />
   );
};

export default OptimizedImage;
