import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:3000/auth/register", formData);

      if (res.status === 201) {
        setMessage("Registration successful! You can now log in.");
      }
    } catch (err) {
      setMessage("Registration failed. Please try again.");
    }
  };

  return (
    <div className="grid place-items-center h-full bg-[#2F3136] text-white">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 bg-[#36393F] p-10 rounded-xl shadow-2xl w-[400px]"
      >
        <h1 className="text-3xl font-bold text-center mb-2">Create an Account</h1>
        <p className="text-center text-gray-400 text-sm mb-4">
          Join our community and start chatting today!
        </p>

        <input
          name="username"
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="bg-[#40444B] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] placeholder-gray-400"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="bg-[#40444B] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] placeholder-gray-400"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="bg-[#40444B] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] placeholder-gray-400"
        />

        <button
          type="submit"
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 rounded-md transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
        >
          Register
        </button>

        {message && (
          <p className="text-sm text-center mt-2 text-gray-300">{message}</p>
        )}

        <p className="text-sm text-center text-gray-400 mt-2">
          Already have an account?{" "}
          <span className="text-[#5865F2] hover:underline cursor-pointer">
            Log in
          </span>
        </p>
      </form>
    </div>
  );
};

export { Register };
