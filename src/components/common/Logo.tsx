import { cn } from '@/lib/utils';
import logoImg from '@/assets/Maarakshak.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'splash';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { img: 'h-8 w-8', text: 'text-base' },
  md: { img: 'h-10 w-10', text: 'text-lg' },
  lg: { img: 'h-14 w-14', text: 'text-2xl' },
  xl: { img: 'h-20 w-20', text: 'text-3xl' },
  splash: { img: 'h-44 w-44 md:h-52 md:w-52', text: 'text-5xl md:text-6xl' },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className={cn('relative', s.img)}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400/30 to-purple-400/30 blur-xl" />
        <img
          src={logoImg}
          alt="MaaRaksha"
          className={cn('relative h-full w-full rounded-full object-cover shadow-lg shadow-primary-200/50 ring-4 ring-white')}
        />
      </div>
      {showText && (
        <div className="text-center">
          <h1 className={cn('font-display font-bold tracking-tight', s.text)}>
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Maa</span>
            <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">Raksha</span>
          </h1>
        </div>
      )}
    </div>
  );
}
