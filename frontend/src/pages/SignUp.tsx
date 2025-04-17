import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/lib/auth";

const Signup = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser(phone, password, role);
      navigate("/login"); // Redirect to login after successful signup
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto mb-10"
        />
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Create an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={handleSignup} className="space-y-6 ">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full rounded-md border border-black px-3 py-2 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-black px-3 py-2 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-900">
              Select Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full rounded-md border border-black px-3 py-2 text-gray-900"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-black px-3 py-2 text-white text-sm font-semibold shadow hover:bg-gray-800"
            >
              Sign Up
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-black hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
