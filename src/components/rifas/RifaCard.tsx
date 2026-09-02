import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, TicketIcon } from '@heroicons/react/24/outline';

interface RifaCardProps {
  rifa: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    totalNumbers: number;
    pricePerNumber: number;
    soldCount: number;
    startDate: string;
    endDate: string;
    rules?: string;
  };
}

export default function RifaCard({ rifa }: RifaCardProps) {
  const progress = ((rifa.soldCount / rifa.totalNumbers) * 100).toFixed(0);
  const remaining = rifa.totalNumbers - rifa.soldCount;

  return (
    <Link href={`/rifa/${rifa.id}`} className="group">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-2 transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-brand_purple/20 to-brand_pink/20">
          {rifa.image ? (
            <Image 
              src={rifa.image} 
              alt={rifa.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <TicketIcon className="w-16 h-16 text-white/70" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-lg">
              {progress}% vendido
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amazon_blue transition-colors">
            {rifa.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{rifa.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">S/ {rifa.pricePerNumber}</div>
              <div className="text-xs text-gray-500">por número</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amazon_blue">{rifa.soldCount}</div>
              <div className="text-xs text-gray-500">vendidos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{remaining}</div>
              <div className="text-xs text-gray-500">disponibles</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amazon_blue h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">{rifa.soldCount}/{rifa.totalNumbers} números</div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Termina {new Date(rifa.endDate).toLocaleDateString('es-PE')}
            </div>
            <Link href={`/rifa/${rifa.id}`} className="px-6 py-2 bg-amazon_blue text-white text-sm font-bold rounded-xl hover:bg-amazon_light transition-all shadow-lg hover:shadow-xl">
              Separar Números
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
}

