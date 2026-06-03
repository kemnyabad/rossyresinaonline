export default function ProductsRedirect() {
  return null;
}

export const getServerSideProps = async () => ({
  redirect: {
    destination: "/productos",
    permanent: false,
  },
});
