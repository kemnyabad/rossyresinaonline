import { useRouter } from 'next/router';
import RifaAdminForm from '@/components/admin/RifaAdminForm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export default function EditRifaPage({ rifa }: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
      <RifaAdminForm rifaId={id as string} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/admin/sign-in?callbackUrl=/admin/rifa/[id]',
        permanent: false,
      },
    };
  }

  const { id } = ctx.params as { id: string };
  try {
    const rifaRes = await fetch(`${ctx.req.headers.host}/api/admin/rifas/${id}`);
    const rifa = await rifaRes.json();
    if (!rifaRes.ok || !rifa) {
      return { notFound: true };
    }
    return { props: { rifa } };
  } catch {
    return { notFound: true };
  }
};

