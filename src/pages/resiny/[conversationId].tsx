import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import AssistantRossy from "@/components/AssistantRossy";
import {
  getOrCreateResinyConversationId,
  getResinyOwnerKey,
  isKnownResinyConversation,
  rememberResinyConversation,
} from "@/lib/resinyConversationClient";

export default function ResinyConversationPage() {
  const router = useRouter();
  const conversationId = String(router.query.conversationId || "").trim();
  const { data: session, status } = useSession();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!router.isReady || status === "loading") return;
    const userEmail = String(session?.user?.email || "").trim().toLowerCase();
    const ownerKey = getResinyOwnerKey(userEmail);
    const currentConversationId = String(router.query.conversationId || "").trim();
    if (!currentConversationId) return;

    if (isKnownResinyConversation(ownerKey, currentConversationId)) {
      rememberResinyConversation(ownerKey, currentConversationId);
      setAllowed(true);
      return;
    }

    const ownConversationId = getOrCreateResinyConversationId(ownerKey);
    router.replace(`/resiny/${encodeURIComponent(ownConversationId)}`);
  }, [router, router.isReady, router.query.conversationId, session?.user?.email, status]);

  return (
    <>
      <Head>
        <title>Resiny | Conversación</title>
        <meta
          name="description"
          content="Conversación personalizada con Resiny, asistente virtual de Rossy Resina."
        />
      </Head>
      {allowed ? <AssistantRossy conversationId={conversationId || "default"} /> : null}
    </>
  );
}
