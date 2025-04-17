import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/lib/auth";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    try {
      const role = await loginUser(phone, password);
      
      if (role === "admin") {
        navigate("/admin-dashboard"); // 🔹 Админов кидаем на свою страницу
      } else {
        navigate("/"); // 🔹 Обычные пользователи могут пользоваться сайтом
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex-col flex items-center justify-center px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
              Phone Number
            </label>
            <div className="mt-2">
              <input
                id="phone"
                name="phone"
                type="text"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-md border border-black bg-white px-3 py-1.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-black hover:opacity-70">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-black bg-white px-3 py-1.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Not a member?{" "}
          <a href="/register" className="font-semibold text-black hover:opacity-70">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
