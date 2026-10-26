import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// A crisp SVG QR code for `value`, drawn in the current text colour.
export default function Qr({ value, className = 'qr' }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    QRCode.toString(value, { type: 'svg', margin: 0, color: { dark: '#000', light: '#0000' } })
      .then(setSvg)
      .catch(() => setSvg(''));
  }, [value]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label={`QR code for ${value}`} />;
}
