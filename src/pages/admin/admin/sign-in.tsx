import type { GetServerSideProps } from "next";

export default function AdminSignInRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const callbackUrl =
    typeof ctx.query.callbackUrl === "string" ? ctx.query.callbackUrl : "/admin";
  return {
    redirect: {
      destination: `/admin/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      permanent: false,
    },
  };
};
