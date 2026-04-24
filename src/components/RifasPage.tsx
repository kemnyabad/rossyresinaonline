import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import logo from "../images/logo.jpg";
import RifasNavbar from './rifas/RifasNavbar';

import RifasGrid from './rifas/RifasGrid';
import RifaDetail from './rifas/RifaDetail';
import RifasStepGuide from './rifas/RifasStepGuide';
import RifasFooter from './rifas/RifasFooter';
import RifaSlider from './rifas/RifaSlider';

export interface Rifa {
  id: string;
  title: string;
  description: string;
  image: string;
  videoUrl?: string;
  prizes?: string;
  totalNumbers: number;
  pricePerNumber: number;
  startDate: string;
  endDate: string;
  rules: string;
  soldCount: number;
  availableNumbers: number;
  prizeImages?: Array<{ url: string; alt?: string } | string>;
}

export interface RifaNumbersData {
  tickets: Array<{
    id: string;
    number: number;
    status: string;
    buyerName?: string;
    buyerEmail?: string;
  }>;
  total: number;
}

export interface BannerSlide {
  type: 'image' | 'text';
  url?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  gradient?: string;
}

// Componente Skeleton/Loading elegante
const RaffleLoadingState = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
    <div className="relative mb-6">
      <img src={logo.src} alt="Loading" className="h-20 w-auto opacity-20 grayscale" />
      <div className="absolute inset-0 border-t-2 border-[#6E2CA1] rounded-full animate-spin"></div>
    </div>
    <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 animate-pulse">Cargando Sorteo</p>
  </div>
);

export default function RifasPage() {
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [selectedRifa, setSelectedRifa] = useState<Rifa | null>(null);
  const [numbers, setNumbers] = useState<RifaNumbersData | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBuyerForm, setShowBuyerForm] = useState(false);
  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const isDetailView = !!selectedRifa || !!router.query.id;



  const bannerSlides = useMemo<BannerSlide[]>(() => {
    if (!selectedRifa) return [];

    if (selectedRifa.prizeImages && selectedRifa.prizeImages.length > 0) {
      const normalized = selectedRifa.prizeImages
        .map((img) => {
          if (typeof img === 'string') {
            const url = img.trim();
            return url ? { url, alt: selectedRifa.title } : null;
          }
          const url = String(img?.url || '').trim();
          if (!url) return null;
          return { url, alt: img.alt || selectedRifa.title };
        })
        .filter(Boolean) as Array<{ url: string; alt: string }>;

      if (normalized.length > 0) {
        return normalized.map((img) => ({
          type: 'image',
          url: img.url,
          alt: img.alt || selectedRifa.title,
        }));
      }

      return [];
    }

    if (selectedRifa.videoUrl) {
      return [];
    }

    if (selectedRifa.image) {
      return [
        {
          type: 'image',
          url: selectedRifa.image,
          alt: selectedRifa.title,
        },
      ];
    }

    return [
      {
        type: 'text',
        title: selectedRifa.title,
        subtitle: 'Participa hoy y asegura tus números favoritos.',
        gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
      },
      {
        type: 'text',
        title: `S/ ${parseFloat(selectedRifa.pricePerNumber.toString()).toFixed(2)} por número`,
        subtitle: `${selectedRifa.availableNumbers} números libres para participar.`,
        gradient: 'from-rose-500 via-orange-400 to-amber-500',
      },
      {
        type: 'text',
        title: 'Compra rápida y segura',
        subtitle: 'Selecciona tus números y finaliza en pocos pasos.',
        gradient: 'from-cyan-500 via-sky-500 to-blue-600',
      },
    ];
  }, [selectedRifa]);

  useEffect(() => {
    fetchRifas();
  }, []);

  const fetchRifas = async () => {
    try {
      const res = await fetch('/api/rifas');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRifas(data);
      } else {
        console.error('API returned non-array:', data);
        setRifas([]);
      }
    } catch (error) {
      console.error('Error fetching rifas:', error);
      setRifas([]);
    }
  };

  // Scroll Instantáneo: window.scrollTo(0, 0) inmediatamente al cambiar de vista
  useEffect(() => {
    if (router.isReady) {
      window.scrollTo(0, 0);
    }
  }, [isDetailView, selectedRifa?.id, router.isReady]);

  // Sincronización de la URL con el estado (SEO & Deep Linking)
  useEffect(() => {
    if (!router.isReady || rifas.length === 0) return;

    const queryId = router.query.id as string;
    
    if (queryId) {
      // Si hay un ID en la URL, buscamos la rifa y la seleccionamos
      const rifaFromUrl = rifas.find(r => r.id === queryId);
      if (rifaFromUrl && selectedRifa?.id !== queryId) {
        handleSelectRifa(rifaFromUrl, false); // false para no re-empujar a la URL
      }
    } else if (selectedRifa) {
      // Si no hay ID en la URL pero tenemos una seleccionada, limpiamos (botón atrás del navegador)
      setSelectedRifa(null);
    }
  }, [router.isReady, router.query.id, rifas]);

  // Lógica para el auto-avance del slider de premios
  useEffect(() => {
    if (bannerSlides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [bannerSlides]);

  useEffect(() => {
    if (bannerSlides.length === 0) {
      setCurrentSlide(0);
      return;
    }
    setCurrentSlide((prev) => (prev >= bannerSlides.length ? 0 : prev));
  }, [bannerSlides.length]);

  const fetchNumbersForRifa = useCallback(async (rifa: Rifa) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rifas/${rifa.id}/numbers?status=AVAILABLE&limit=1000`);
      const data = await res.json();
      setNumbers(data);
    } catch (error) {
      console.error('Error fetching numbers:', error);
    } finally {
      setTimeout(() => setLoading(false), 100);
    }
  }, []);

  const handleSelectRifa = async (rifa: Rifa, updateUrl = true) => {
    // Actualizamos la URL si es necesario (navegación interna)
    if (updateUrl && router.query.id !== rifa.id) {
      router.push({ query: { ...router.query, id: rifa.id } }, undefined, { shallow: true });
    }

    // Si ya estamos cargando o es el mismo, ignorar
    if (selectedRifa?.id === rifa.id && !loading) return;

    setCurrentSlide(0);
    setSelectedNumbers([]);
    
    setSelectedRifa(rifa);
    setNumbers(null); // Limpiar números anteriores para forzar el estado de carga en el detalle

    if (rifa.videoUrl) {
      setLoading(false);
      return;
    }

    await fetchNumbersForRifa(rifa);
  };

  const toggleNumber = (number: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
    );
  };

  const handleBuy = async () => {
    if (selectedNumbers.length === 0) {
      alert('Selecciona al menos un número');
      return;
    }
    setShowBuyerForm(true);
  };

  const handleSubmitBuyer = async () => {
    if (!buyerData.name || !buyerData.email || !buyerData.phone) {
      alert('Completa todos los datos');
      return;
    }

    if (!selectedRifa) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/rifas/${selectedRifa.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: selectedNumbers,
          buyerName: buyerData.name,
          buyerEmail: buyerData.email,
          buyerPhone: buyerData.phone,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error);
        return;
      }

      const result = await res.json();
      router.push(`/rifas/${selectedRifa.id}/payment?tickets=${result.tickets.map((t: any) => t.id).join(',')}`);
    } catch (error) {
      console.error('Error buying:', error);
      alert('Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white font-sans selection:bg-purple-100 transition-opacity duration-300">
      
      <main className="min-h-screen">
        {!isDetailView ? (
          <div className="animate-in fade-in duration-300">
            <RifasNavbar 
              onBack={() => {
                setSelectedRifa(null);
                router.push('/rifas', undefined, { shallow: true });
              }} isSelected={isDetailView} router={router} />
            <RifaSlider />
            <RifasGrid rifas={rifas} onSelect={handleSelectRifa} />

            <RifasStepGuide />
            <RifasFooter />
          </div>
        ) : (
          <>
            {!selectedRifa ? <RaffleLoadingState /> : (
              <RifaDetail 
                selectedRifa={selectedRifa}
                numbers={numbers}
                selectedNumbers={selectedNumbers}
                toggleNumber={toggleNumber}
                loading={loading}
                bannerSlides={bannerSlides}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
                onAdComplete={() => {
                  if (!numbers && selectedRifa) {
                    fetchNumbersForRifa(selectedRifa);
                  }
                }}
                onBack={() => {
                  setSelectedRifa(null);
                  router.push('/rifas', undefined, { shallow: true });
                }}
                router={router}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
