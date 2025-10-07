import { useState } from "react";
import type { User } from "../types/client-types";

type CreateServerProps = {
  owner: User,
  socket: WebSocket | null | undefined
};

const CreateServer = ({ owner, socket }: CreateServerProps) => {
  const [serverName, setServerName] = useState<string>("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      type: "server-create",
      serverName: serverName,
      owner: owner.username,
    };
    socket?.send(JSON.stringify(payload));
  }

  return (
    <div className="grid place-items-center h-full bg-[#1e1f22]">
      <div className="bg-[#2b2d31] text-gray-200 p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4 text-gray-100 text-center">
          Create a New Server
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 items-center"
        >
          <input
            type="text"
            name="server-name"
            id="server-name"
            placeholder="Server Name"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            className="w-full bg-[#1e1f22] text-gray-200 px-4 py-2 rounded-lg border border-[#383a40] focus:outline-none focus:ring-2 focus:ring-[#5865f2] transition"
          />
          <button
            type="submit"
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2 rounded-lg transition active:scale-95"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export { CreateServer };
