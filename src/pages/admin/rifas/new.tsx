import RifaAdminForm from '@/components/admin/RifaAdminForm';
import type { GetServerSideProps } from 'next';
import { requireAdminPage } from "@/lib/adminAuth";

export default function NewRifaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          ← Volver
        </button>
      </div>
      <RifaAdminForm />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = requireAdminPage(ctx);
  if (redirect) return redirect;
  return { props: {} };
};
