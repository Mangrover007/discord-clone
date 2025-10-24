import { useState } from "react";

type Props = {
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
}

const Login = ({ setLoggedIn }: Props) => {

  const [payload, setPayload] = useState({
    username: "",
    password: ""
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const key = e.target.name
    const val = e.target.value
    setPayload(prev => {
      return {
        ...prev,
        [key]: val
      }
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // validate user input
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload),
        method: "POST",
        credentials: "include"
      })
      console.log(res);
      if (res.status === 200) {
        setLoggedIn(true);
      }
    } catch (e) {
      console.log("error in login.tsx", e)
    }
  }

  return (
    <div className="h-full w-full bg-[#36393F] grid place-items-center">
      <form className="bg-[#2F3136] p-10 rounded-lg shadow-lg flex flex-col gap-5 w-96" onSubmit={e => handleSubmit(e)}>
        <h1 className="text-white text-3xl font-extrabold text-center mb-1">
          Welcome Back!
        </h1>
        <p className="text-gray-400 text-center text-sm mb-4">
          We're so excited to see you again!
        </p>

        <div className="flex flex-col gap-3">
          <label className="text-xs uppercase text-gray-400 font-semibold">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            className="bg-[#202225] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] placeholder-gray-500"
            value={payload.username}
            onChange={e => handleChange(e)}
            name="username"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs uppercase text-gray-400 font-semibold">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            className="bg-[#202225] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] placeholder-gray-500"
            value={payload.password}
            onChange={e => handleChange(e)}
            name="password"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-2 rounded-md transition-colors cursor-pointer"
        >
          Login
        </button>

        <p className="text-gray-400 text-sm text-center mt-3">
          Need an account?{" "}
          <span className="text-[#5865F2] hover:underline cursor-pointer">
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export { Login };
