import React, { useState } from "react";
import { useFormspark } from "@formspark/use-formspark";

interface NewsletterProps {
  className?: string;
}

const FORMSPARK_FORM_ID = "aoe0nnAOo";

const Newsletter: React.FC<NewsletterProps> = ({ className = "" }) => {
  const [email, setEmail] = useState("");
  const [submit, submitting] = useFormspark({
    formId: FORMSPARK_FORM_ID,
  });

  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirm("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await submit({ email });

      if (response) {
        setConfirm("You're in! 🎉");
        setEmail("");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-center gap-3 relative group"
        aria-label="Newsletter signup"
      >
        <div className="w-full md:w-80 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email for the weekly letter…"
            autoComplete="email"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "newsletter-error" : undefined}
            className={`px-6 py-3 w-full border-2 rounded-full outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm focus:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] ${
              error
                ? "border-red-500 focus:ring-red-400/40"
                : "border-gray-300 focus:border-[#37517b] focus:ring-[#37517b]/25"
            }`}
          />
          {error && (
            <div
              id="newsletter-error"
              role="alert"
              className="absolute -bottom-6 left-0 text-sm text-red-500 animate-fade-in"
            >
              {error}
            </div>
          )}
        </div>
        <button
          className="px-8 py-3 w-full md:w-auto bg-[#37517b] text-white rounded-full hover:bg-[#2d4260] transition-all duration-300 font-medium shadow-sm hover:shadow-md active:scale-[0.98] relative overflow-hidden group-hover:translate-x-0.5 disabled:opacity-80 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-[#37517b] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          type="submit"
          disabled={submitting}
        >
          <span
            className={`flex items-center justify-center gap-2 ${submitting ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
          >
            Let's Go
          </span>
          {submitting && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
        </button>
        {confirm && (
          <div
            role="status"
            className="absolute -bottom-8 left-0 text-sm text-gray-600 animate-fade-in"
          >
            {confirm}
          </div>
        )}
      </form>
      <p className="text-xs text-gray-400 tracking-wide mt-2 text-center max-w-xs leading-snug">
        Trauma dumping every week.
      </p>
    </div>
  );
};

export default Newsletter;
