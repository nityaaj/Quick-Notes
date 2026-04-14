import { useState } from "react";
import API from "../api";

function AuthPage({ onAuth }) {
  const [mode, setMode]         = useState("login"); // "login" | "signup"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const res = await API.post(endpoint, { email, password });
      onAuth(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  const isLogin = mode === "login";

  return (
    <div
      className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 py-8 relative overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* decorative blobs */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-green-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">

        {/* brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-bold">
            ✦
          </div>
          <span className="text-lg font-semibold text-gray-900 tracking-tight">
            My Notes
          </span>
        </div>

        {/* heading */}
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-1">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-gray-400 font-light mb-8">
          {isLogin ? "Sign in to see your notes." : "Start capturing your thoughts."}
        </p>

        {/* email */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            className="border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-gray-50 outline-none focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* password */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Password
          </label>
          <input
            type="password"
            placeholder={isLogin ? "Your password" : "At least 6 characters"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-gray-50 outline-none focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* error */}
        {error && (
          <div className="bg-red-50 text-red-500 text-xs rounded-xl px-4 py-3 mb-3">
            {error}
          </div>
        )}

        {/* submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
        >
          {loading
            ? "Loading..."
            : isLogin ? "Sign in →" : "Create account →"}
        </button>

        {/* toggle */}
        <p className="text-center text-sm text-gray-400 font-light mt-5">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(isLogin ? "signup" : "login"); setError(""); }}
            className="font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;