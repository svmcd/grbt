"use client";

import { useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Add email to Firestore
      await addDoc(collection(db, "waitlist"), {
        email: email,
        timestamp: serverTimestamp(),
        source: "grbt.website",
      });

      setIsSubmitted(true);
      setEmail("");
    } catch (error) {
      console.error("Error submitting form:", error);
      // You could show an error message here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex p-8 flex-col items-center justify-between">
      {/* Logo */}
      <div className="items-center flex flex-col gap-2">
        <div className="flex justify-center">
          <Image
            src="/grbt.svg"
            alt="grbt."
            width={400}
            height={172}
            className="w-auto h-20 sm:h-24 lg:h-28"
            priority
          />
        </div>
        <p className="text-lg  text-white font-light italic mb-2">
          Burada yabancı, orada Almancı.
        </p>
      </div>
      <div className="w-full max-w-lg text-center h-full flex flex-col justify-center items-center flex-1 ">
        {/* Email Form */}
        <div className=" flex flex-col items-center w-full">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="w-full">
              <div className="max-w-md mx-auto w-full">
                <div className="flex flex-col gap-1 w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="flex-1 px-4 py-2 bg-transparent border border-muted/30 text-white placeholder-muted/50 focus:outline-none focus:border-white transition-all duration-300 text-center w-full max-w-md"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="px-6 py-2 text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 whitespace-nowrap !bg-white disabled:cursor-not-allowed w-full max-w-md"
                  >
                    {isLoading ? "Joining..." : "Join the waitlist"}
                  </button>
                </div>
              </div>
              <p className="text-md text-muted font-light mt-2">
                hasretle bekleyenlerden biri misin?
              </p>
            </form>
          ) : (
            <div>
              <p className="text-xl text-accent font-light">
                Thanks. You&apos;re part of the story now.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-muted/70 hover:text-white text-sm underline underline-offset-4 transition-colors duration-300"
              >
                Join another email
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="border-t border-muted/100 w-full text-center pt-2 max-w-md">
        <p className="text-xs tracking-widest text-muted/100 uppercase">
          grbt.studio
        </p>
      </div>
    </div>
  );
}
