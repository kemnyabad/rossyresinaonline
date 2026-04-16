import React from 'react';
import { useRouter } from 'next/router';
import PaymentPage from '@/components/RifasPaymentPage';

export default function RifaPayment() {
  const router = useRouter();
  const { id } = router.query;
  const tickets = (router.query.tickets as string)?.split(',') || [];

  if (!id) {
    return <div>Cargando...</div>;
  }

  return <PaymentPage rifaId={id as string} ticketIds={tickets} totalPrice={0} />;
}
