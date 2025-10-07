import type { User } from "../types/client-types";

type Props = {
  setMode: React.Dispatch<React.SetStateAction<"user" | "server" | "create" | "join" | "login" | "register">>
  setActiveUser: React.Dispatch<React.SetStateAction<User>>,
  mode: "user" | "server" | "create" | "join" | "login" | "register"
}

const LeftSidebar = ({ setMode, setActiveUser, mode }: Props) => {

  async function getUser() {
    const res = await fetch("http://localhost:3000/auth/who", {
      credentials: "include",
      method: "GET",
    });
    const data: { id: string; username: string } = await res.json();
    setActiveUser(data);
  }

  const handleRedirect = (modeName: "user" | "server" | "create" | "join" | "login" | "register") => {
    setMode(modeName);
  };

  return <>
    <div className="bg-[#202225] flex flex-col items-center py-4 border-r border-[#2f3136]">
      <h1 className="text-xs font-bold mb-6 uppercase text-gray-400">Nav</h1>
      <div className="flex flex-col gap-3 w-full px-2">
        <button
          className={`p-2 rounded-lg hover:bg-[#5865F2] transition ${mode === "user" ? "bg-[#5865F2]" : ""
            }`}
          onClick={() => handleRedirect("user")}
          name="user"
        >
          DMs
        </button>
        <button
          className={`p-2 rounded-lg hover:bg-[#5865F2] transition ${mode === "server" ? "bg-[#5865F2]" : ""
            }`}
          onClick={() => handleRedirect("server")}
          name="server"
        >
          Servers
        </button>
        <button onClick={() => handleRedirect("create")}
          className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md font-medium transition-colors"
        >
          New
        </button>
        <button onClick={() => handleRedirect("join")}
          className="px-4 py-2 bg-[#4F545C] hover:bg-[#5865F2] text-white rounded-md font-medium transition-colors"
        >
          Join
        </button>
        <button className="cursor-pointer" onClick={() => handleRedirect("login")}>
          Log in
        </button>
        <button className="cursor-pointer" onClick={() => handleRedirect("register")}>
          Register
        </button>
      </div>
    </div>
  </>
}

export { LeftSidebar };
