
type Props = {
  setMode: React.Dispatch<React.SetStateAction<"user" | "server" | "create" | "join">>,
  setActiveUser: React.Dispatch<React.SetStateAction<{
    id: string;
    username: string;
  }>>,
  mode: "user" | "server" | "create" | "join"
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

  const handleLoginTestUser = async () => {
    await fetch("http://localhost:3000/auth/login", {
      body: JSON.stringify({
        username: "test user",
        password: "testpass"
      }),
      credentials: "include",
      method: "POST",
      headers: {
        "content-type": "application/json"
      }
    })
  }

  const handleLoginMango = async () => {
    await fetch("http://localhost:3000/auth/login", {
      body: JSON.stringify({
        username: "mango",
        password: "mango"
      }),
      credentials: "include",
      method: "POST",
      headers: {
        "content-type": "application/json"
      }
    })
  }

  const handleLoginViwi = async () => {
    await fetch("http://localhost:3000/auth/login", {
      body: JSON.stringify({
        username: "viwi",
        password: "gd"
      }),
      credentials: "include",
      method: "POST",
      headers: {
        "content-type": "application/json"
      }
    })
  }

  const handleRedirect = (modeName: "user" | "server" | "create" | "join") => {
    setMode(modeName);
  };

  async function RefreshTokens() {
    try {
      await fetch("http://localhost:3000/auth/refresh-token", {
        credentials: "include",
        method: "GET",
      });
      await getUser();
    }
    catch (e) {
      console.log("error info: ", e)
    }
  }

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
        <button
          onClick={RefreshTokens}
          className="mt-4 p-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] transition text-white text-sm"
        >
          Refresh Login
        </button>
        <button className="cursor-pointer" onClick={handleLoginTestUser}>
          Test user
        </button>
        <button className="cursor-pointer" onClick={handleLoginMango}>
          Mango
        </button>
        <button className="cursor-pointer" onClick={handleLoginViwi}>
          Viwi
        </button>
      </div>
    </div>
  </>
}

export { LeftSidebar };
