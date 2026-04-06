import type { GetServerSideProps } from "next";

export default function CapacitacionesPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: "/", permanent: false } };
};
