import { useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Server, ServerMessage, User } from "../types/client-types";
import { useServerMessage } from "../hooks/useServerMessage";
import { Portal } from "../App";

type Props = {
  activeUser: User,
  activeServer: Server | null,
}

const ServerMessages = ({ activeUser, activeServer }: Props) => {

  const context = useContext(Portal);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [pageNumber, setPageNumber] = useState<number>(0);
  const { hasMore, loading, messages, setHasMore, setMessages } = useServerMessage(pageNumber, activeServer);

  const observer = useRef<IntersectionObserver | null>(null);
  const messageStartRef = useCallback((node: HTMLDivElement | null) => {
    // console.log("reaching here at least?")
    console.log("three musketmen yet again - ", node, loading, hasMore)
    if (!node || loading || !activeServer?.name) return
    if (observer.current) observer.current.disconnect();
    // console.log("reaching here part 2??")
    observer.current = new IntersectionObserver((entries) => {
      if (hasMore && entries[0].isIntersecting) {
        console.log("server div visible");
        setPageNumber(prev => prev + 1);
      }
    })
    observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    console.log("changing servers...", activeServer)
    setPageNumber(0);
    if (setMessages)
      setMessages([])
    setHasMore(true);
  }, [activeServer])

  useEffect(() => {
    console.log("SCROLLING OR NOT")
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [context?.triggerScrollToBottom])

  return <>
    <div ref={messagesEndRef} />
    {messages?.map((msg, index) => (
      <div
        key={index}
        className={`flex ${msg.sender === "Me" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`p-2 rounded-lg max-w-xs break-words ${msg.sender === activeUser.username
              ? "bg-[#5865F2] text-white rounded-br-none"
              : "bg-[#4F545C] text-white rounded-bl-none"
            }`}
        >
          <span className="opacity-50">
            {msg.sender}:
          </span>
          <br />
          {msg.content}
          <br />
          <span className="opacity-50 text-xs">
            {new Date(msg.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    ))}
    <div ref={messageStartRef} >very very very very very very very very subtle div</div>
  </>
}

export { ServerMessages };
