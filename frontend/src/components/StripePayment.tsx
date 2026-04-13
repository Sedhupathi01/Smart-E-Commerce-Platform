"use client";

import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";

interface StripePaymentProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export const StripePayment = ({ onSuccess, onError }: StripePaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "An unexpected error occurred.");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      
      <button
        disabled={isProcessing || !stripe || !elements}
        className="bg-primary text-white w-full py-5 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-primary/20"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Verifying...</span>
          </div>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
};
