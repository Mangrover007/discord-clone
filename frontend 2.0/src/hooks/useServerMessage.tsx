import { useContext, useEffect, useState } from "react";
import type { Server, ServerMessage } from "../types/client-types";
import { Portal } from "../App";
import axios from "axios";


export const useServerMessage = (pageNumber: number, server: Server | null) => {

  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const context = useContext(Portal);

  const messages = context?.serverMessages
  const setMessages = context?.setServerMessages

  async function getMoreMessages() {
    try {
      setLoading(true);

      const res = await axios.get(`http://localhost:3000/server-messages/${server?.name}/${pageNumber}`, {
        withCredentials: true,
      })

      const data: ServerMessage[] = res.data.data;
      const metadata: {
        page: {
          start: number,
          rem: number,
          size: number,
          total: number,
          current: number
        }
      } = res.data.metadata;

      if (metadata.page.rem <= 0) {
        setHasMore(false);
      }
      else {
        setHasMore(true);
      }

      if (setMessages)
        setMessages(prev => [...prev, ...data]);

      setLoading(false);
    } catch (e) {
      console.log("server message error happened - ", e);
    }
  }

  useEffect(() => {
    if (pageNumber > 0 && pageNumber < 10)
      getMoreMessages();
  }, [pageNumber])

  return {
    loading,
    hasMore,
    setHasMore,
    messages,
    setMessages
  };
}
