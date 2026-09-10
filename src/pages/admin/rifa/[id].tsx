import React from 'react';
import { useRouter } from 'next/router';
import RifaAdminForm from '@/components/admin/RifaAdminForm';
import type { GetServerSideProps } from 'next';
import { requireAdminPage } from "@/lib/adminAuth";

export default function EditRifaPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/admin/rifas')}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          ← Volver a rifas
        </button>
      </div>
      {id && <RifaAdminForm rifaId={id as string} />}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = requireAdminPage(ctx);
  if (redirect) return redirect;
  return { props: {} };
};
