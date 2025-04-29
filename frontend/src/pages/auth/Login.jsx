import { useState } from "react";
import { login } from "../../services/authService";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";


const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      const { token, user } = res;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      redirectUser(user.role);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role) => {
    if (role === "admin") {
      window.location.href = "/admin/approval";
    } else if (role === "restaurant") {
      window.location.href = "/restaurant/home";
    } else if (role === "driver") {
      window.location.href = "/driverProfile";
    } else {
      window.location.href = "/";
    }
  };
  

  // ✅ Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await loginWithGoogle(credentialResponse.credential); // ✅ Call service function
      const { token, user } = res;
  
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
  
      redirectUser(user.role);
    } catch (error) {
      console.error("❌ Google Login failed:", error);
      setError("Google login failed. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-red-100 to-red-200 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          Welcome Back
        </h2>

        {error && (
          <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none text-sm"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none text-sm pr-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full py-2 rounded-lg text-white font-semibold transition duration-300 ${
              loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* ✅ Google Login Button */}
        <div className="mt-6 text-center">
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("❌ Google Login Failed")}
            />
          </GoogleOAuthProvider>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          © {new Date().getFullYear()} DeliciousEats Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
