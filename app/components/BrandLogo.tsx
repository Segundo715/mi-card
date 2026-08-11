'use client'

// Solo los logos SVG se pueden recolorear (vía CSS mask) — un PNG/JPG conserva
// sus colores originales sin importar el valor de `color`.
export function isSvgUrl(url: string): boolean {
  return /\.svg(\?.*)?$/i.test(url)
}

interface BrandLogoProps {
  src: string
  color?: string
  alt?: string
  className?: string
  style?: React.CSSProperties
}

export function BrandLogo({ src, color, alt = 'Logo', className, style }: BrandLogoProps) {
  if (color && isSvgUrl(src)) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={className}
        style={{
          ...style,
          display: 'inline-block',
          backgroundColor: color,
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} style={style} />
}
