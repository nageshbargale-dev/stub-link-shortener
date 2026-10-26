// The SVG filter that roughens stamp ink so it looks pressed, not printed.
export function InkFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="ink-rough" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="noise" />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.7"
          result="speckle"
        />
        <feComposite in="SourceGraphic" in2="speckle" operator="in" result="inked" />
        <feDisplacementMap in="inked" in2="noise" scale="2.4" />
      </filter>
    </svg>
  );
}
