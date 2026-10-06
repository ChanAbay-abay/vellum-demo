// `<source>` order matters: the browser takes the first type it supports. The JPG fallback lives on `<img>`.
const SOURCE_FORMATS = ["avif", "webp"] as const;

/** The shape a `?responsive` image import resolves to (see apps/web/vite/responsive-images.ts). */
export type ResponsiveImage = {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
  placeholder: string;
};

type PictureProps = {
  image: ResponsiveImage;
  alt: string;
  /** Rendered CSS width of the image, e.g. "(min-width: 1024px) 50vw, 100vw" */
  sizes?: string;
  /** Above-the-fold images: load eagerly at high priority */
  priority?: boolean;
  /** Show the blurred placeholder behind the image while it loads. Turn off for transparent cutouts. */
  blur?: boolean;
  className?: string;
  imgClassName?: string;
};

function Picture({
  image,
  alt,
  sizes = "100vw",
  priority = false,
  blur = true,
  className,
  imgClassName
}: PictureProps) {
  return (
    <picture className={className}>
      {SOURCE_FORMATS.filter((format) => image.sources[format]).map((format) => (
        <source
          key={format}
          type={`image/${format}`}
          srcSet={image.sources[format]}
          sizes={sizes}
        />
      ))}
      <img
        src={image.img.src}
        width={image.img.w}
        height={image.img.h}
        alt={alt}
        sizes={sizes}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className={imgClassName}
        // Inline because the placeholder is a per-image data URL; a utility class can't carry it.
        style={
          blur
            ? {
                backgroundImage: `url(${image.placeholder})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }
            : undefined
        }
      />
    </picture>
  );
}

export { Picture };
