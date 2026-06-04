// Komponen dekoratif — blob gradien soft yang diposisikan acak per section.

interface BlobConfig {
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  width: string;
  height: string;
  opacity: number;
  blur: string;
}

interface SoftGradientProps {
  variant?: 'hero' | 'clients' | 'showcase' | 'services' | 'testimonials' | 'cta';
}

const VARIANTS: Record<string, BlobConfig[]> = {
  hero: [
    { color: '#E89B7E', top: '5%',    left: '0%',   width: '500px', height: '500px', opacity: 0.18, blur: '100px' },
    { color: '#F0D8A1', bottom: '0%', right: '0%',  width: '420px', height: '420px', opacity: 0.20, blur: '90px'  },
    { color: '#DCF0C3', top: '50%',   left: '35%',  width: '320px', height: '320px', opacity: 0.15, blur: '80px'  },
  ],
  clients: [
    { color: '#DD9E59', top: '0%',    right: '5%',  width: '350px', height: '350px', opacity: 0.15, blur: '80px'  },
    { color: '#F0D8A1', bottom: '0%', left: '5%',   width: '300px', height: '300px', opacity: 0.18, blur: '70px'  },
  ],
  showcase: [
    { color: '#8B5E3C', top: '0%',    right: '10%', width: '450px', height: '450px', opacity: 0.12, blur: '110px' },
    { color: '#E89B7E', bottom: '0%', left: '0%',   width: '380px', height: '380px', opacity: 0.14, blur: '90px'  },
    { color: '#F0D8A1', top: '40%',   right: '0%',  width: '300px', height: '300px', opacity: 0.16, blur: '80px'  },
  ],
  services: [
    { color: '#DD9E59', top: '0%',    left: '15%',  width: '400px', height: '400px', opacity: 0.13, blur: '100px' },
    { color: '#DCF0C3', bottom: '0%', right: '5%',  width: '350px', height: '350px', opacity: 0.15, blur: '85px'  },
  ],
  testimonials: [
    { color: '#E89B7E', top: '0%',    left: '0%',   width: '480px', height: '480px', opacity: 0.12, blur: '110px' },
    { color: '#F0D8A1', top: '30%',   right: '0%',  width: '400px', height: '400px', opacity: 0.14, blur: '95px'  },
    { color: '#8B5E3C', bottom: '0%', left: '20%',  width: '320px', height: '320px', opacity: 0.10, blur: '80px'  },
  ],
  cta: [
    { color: '#DD9E59', top: '0%',    right: '0%',  width: '420px', height: '420px', opacity: 0.13, blur: '95px'  },
    { color: '#DCF0C3', bottom: '0%', left: '0%',   width: '360px', height: '360px', opacity: 0.14, blur: '85px'  },
  ],
};

export default function SoftGradient({ variant = 'hero' }: SoftGradientProps) {
  const blobs = VARIANTS[variant] ?? VARIANTS.hero;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {blobs.map((blob, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top:     blob.top,
            bottom:  blob.bottom,
            left:    blob.left,
            right:   blob.right,
            width:   blob.width,
            height:  blob.height,
            borderRadius: '50%',
            backgroundColor: blob.color,
            opacity: blob.opacity,
            filter: `blur(${blob.blur})`,
          }}
        />
      ))}
    </div>
  );
}
