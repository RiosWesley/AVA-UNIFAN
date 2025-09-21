export function getDisplacementMap({
  height,
  width,
  radius,
  depth,
  optimizeForPerf = true,
}: {
  height: number
  width: number
  radius: number
  depth: number
  optimizeForPerf?: boolean
}) {
  // Reduz blur no inner rect para perf (metade do depth, min 1px)
  const innerBlur = optimizeForPerf ? Math.max(1, depth / 2) : depth
  // Arredonda % dos gradientes para strings mais limpas
  const yStart = Math.round((radius / height) * 15)
  const yEnd = Math.round(100 - (radius / height) * 15)
  const xStart = Math.round((radius / width) * 15)
  const xEnd = Math.round(100 - (radius / width) * 15)

  const svgString = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>.mix { mix-blend-mode: screen; }</style>
    <defs>
      <linearGradient id="Y" x1="0" x2="0" y1="${yStart}%" y2="${yEnd}%">
        <stop offset="0%" stop-color="#0F0" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
      <linearGradient id="X" x1="${xStart}%" x2="${xEnd}%" y1="0" y2="0">
        <stop offset="0%" stop-color="#F00" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g>
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
      <rect x="${depth}" y="${depth}" height="${height - 2 * depth}" width="${width - 2 * depth}" fill="#808080" rx="${radius}" ry="${radius}" filter="blur(${innerBlur}px)" />
    </g>
  </svg>`

  return "data:image/svg+xml;utf8," + encodeURIComponent(svgString)
}

export function getDisplacementFilter({
  height,
  width,
  radius,
  depth,
  strength = 100,
  chromaticAberration = 0,
  optimizeForPerf = true,
}: {
  height: number
  width: number
  radius: number
  depth: number
  strength?: number
  chromaticAberration?: number
  optimizeForPerf?: boolean
}) {
  const effectiveStrength = optimizeForPerf ? strength * 0.8 : strength // Reduz 20% se perf mode
  const displacementMapUrl = getDisplacementMap({ height, width, radius, depth, optimizeForPerf })

  let filterSvg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="displace" color-interpolation-filters="sRGB">
        <feImage x="0" y="0" height="${height}" width="${width}" href="${displacementMapUrl}" result="displacementMap" />`

  if (chromaticAberration === 0) {
    // Single pass otimizado (sem aberração) - mais rápido!
    filterSvg += `
        <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${effectiveStrength}" xChannelSelector="R" yChannelSelector="G" />`
  } else {
    // Full aberração com 3 passes (só se necessário)
    filterSvg += `
        <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${effectiveStrength + chromaticAberration * 2}" xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="displacedR" />
        <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${effectiveStrength + chromaticAberration}" xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="displacedG" />
        <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${effectiveStrength}" xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="displacedB" />
        <feBlend in="displacedR" in2="displacedG" mode="screen"/>
        <feBlend in2="displacedB" mode="screen"/>`
  }

  filterSvg += `
      </filter>
    </defs>
  </svg>`

  return "data:image/svg+xml;utf8," + encodeURIComponent(filterSvg) + "#displace"
}