'use client'

// El recoloreado usa `mask-image`, que enmascara por el canal alfa del logo
// (no por su color original) — funciona en PNG/WebP/SVG con fondo
// transparente. Un JPG sin transparencia se llenaría por completo del color
// elegido, así que esto solo tiene sentido con logos de fondo transparente.
interface BrandLogoProps {
  src: string
  color?: string
  alt?: string
  className?: string
  style?: React.CSSProperties
}

export function BrandLogo({ src, color, alt = 'Logo', className, style }: BrandLogoProps) {
  if (color) {
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
