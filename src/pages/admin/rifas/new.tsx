import RifaAdminForm from '@/components/admin/RifaAdminForm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import type { GetServerSideProps } from 'next';

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
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/admin/sign-in?callbackUrl=/admin/rifas/new',
        permanent: false,
      },
    };
  }
  return { props: {} };
};
