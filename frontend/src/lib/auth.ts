export const API_URL = "http://localhost:8001/auth"; // Change to your API

export const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};


export const loginUser = async (phone: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Invalid phone or password");
  }

  const data = await response.json();
  localStorage.setItem("booking_access_token", data.access_token);
  setCookie("booking_access_token", data.access_token);

  console.log(data.access_token)
  localStorage.setItem("role", data.role);

  return data.role; // Redirect based on role
};

export const registerUser = async (phone: string, password: string, role: string) => {
  const response = await fetch(`${API_URL}/register?role=${role}`, { // 🔹 Role added to query
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }), // 🔹 Removed role from body
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Registration error:", JSON.stringify(data, null, 2)); // Pretty-print error
    throw new Error(data.detail ? JSON.stringify(data.detail) : "Registration failed");
  }

  return data;
};


export const logout = () => {
  localStorage.removeItem("booking_access_token");
  localStorage.removeItem("role");
};
