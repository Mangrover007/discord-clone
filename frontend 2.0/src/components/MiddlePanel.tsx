import type { Server, User } from "../types/client-types"

type Props = {
  mode: "user" | "server" | "create" | "join" | "login" | "register",

  userList: User[],

  activeUser: User,

  setActiveReceiver: React.Dispatch<React.SetStateAction<User>> | undefined,

  setActiveServer: React.Dispatch<React.SetStateAction<Server | null>> | undefined,

  serverList: Server[]
}

const MiddlePanel = ({ mode, userList, activeUser, setActiveReceiver, setActiveServer, serverList }: Props) => {

  async function handleReceiverChange(user: User) {
    if (setActiveReceiver)
    setActiveReceiver(user)
  }

  async function handleServerChange(server: Server) {
    if (setActiveServer)
    setActiveServer(server)
  }

  return <>
    {/* Middle Panel */}
    <div className="bg-[#2F3136] p-4 overflow-y-auto border-r border-[#202225]">
      {mode === "user" ? (
        <>
          <h2 className="text-gray-400 text-sm font-semibold mb-3">Users</h2>
          <ul className="flex flex-col gap-2">
            {userList.map((user) => {
              if (user.username !== activeUser.username)
                return (
                  <li
                    key={user.username}
                    className="cursor-pointer p-2 rounded hover:bg-[#3A3C43] transition"
                    onClick={() => handleReceiverChange(user)}
                  >
                    {user.username}
                  </li>
                );
            })}
          </ul>
        </>
      ) : (
        <>
          <h2 className="text-gray-400 text-sm font-semibold mb-3">Servers</h2>
          <div className="flex flex-col gap-2">
            {serverList.map((server) => (
              <div
                key={server.id}
                className="p-2 rounded hover:bg-[#3A3C43] transition cursor-pointer text-white"
                onClick={() => handleServerChange(server)}
              >
                {server.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </>
}

export { MiddlePanel };
