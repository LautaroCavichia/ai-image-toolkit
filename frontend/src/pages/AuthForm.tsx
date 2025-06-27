import React, { useState } from "react";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to send reset email.");
      }

      setMessage("Check your inbox for the reset link.");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 to-purple-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Forgot your password?
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border border-gray-300 rounded-xl px-5 py-3 text-gray-700 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold
                     py-3 rounded-xl shadow-md transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <p className="text-green-600 text-center font-medium">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-center font-medium">{error}</p>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
