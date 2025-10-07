import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDM } from "../hooks/useDM";
import { Portal } from "../App";
import type { User } from "../types/client-types";

type Props = {
  activeUser: string,
  activeReceiver: User
}

const DMMessages = ({ activeUser, activeReceiver }: Props) => {

  const context = useContext(Portal);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pageNumber, setPageNumber] = useState<number>(0);

  const { hasMore, loading, userDMs, setUserDMs, setHasMore } = useDM(pageNumber, activeReceiver.username);

  const lastDMRef = useRef<HTMLDivElement>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const messageStartRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || loading || !activeReceiver) return
    observer.current?.disconnect()
    observer.current = new IntersectionObserver((entries) => {
      if (hasMore && entries[0].isIntersecting) {
        setPageNumber(prev => prev + 1);
      }
    })
    observer.current.observe(node)
  }, [loading, hasMore])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    lastDMRef.current?.scrollTo({ behavior: "smooth", top: 0 })
  }, [context?.triggerScrollToBottom])

  useEffect(() => {
    setPageNumber(0);
    if (setUserDMs)
      setUserDMs([]);
    setHasMore(true);
  }, [activeReceiver])

  return <>
    <div ref={messagesEndRef} />
    {userDMs?.map((msg, index) => {
      return <>
        <div
          key={index}
          className={`flex ${msg.sender === activeReceiver.username ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`p-2 rounded-lg max-w-xs break-words ${msg.sender === activeUser
              ? "bg-[#5865F2] text-white rounded-br-none"
              : "bg-[#4F545C] text-white rounded-bl-none"
              }`}
          >
            {msg.content}
          </div>
        </div>
      </>
    })}
    <div ref={messageStartRef} />
  </>

}

export { DMMessages };
