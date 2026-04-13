"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CreditCard, Truck, ShieldCheck, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const CheckoutPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        zip: "",
    });

    const handleCheckout = async () => {
        setLoading(true);
        try {
            // Fetch real cart items
            const cartReq = await api.get("/cart");
            const realItems = cartReq.data.items.map((item: any) => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));

            if (realItems.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const response = await api.post("/orders", {
                items: realItems,
                address: `${formData.address}, ${formData.city}, ${formData.zip}`
            });
            console.log("Order created:", response.data);
            
            // Clear cart from frontend by deleting each item since there's no reset endpoint
            for (const item of realItems) {
               await api.delete(`/cart/remove/${item.product_id}`).catch(() => {});
            }

            setStep(3); // Success
        } catch (error: any) {
            console.error("Checkout error:", error);
            alert(error.response?.data?.detail || "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-32 pb-24 min-h-screen bg-slate-50">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Stepper */}
                <div className="flex items-center justify-between mb-12 relative">
                   <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-10" />
                   {[1, 2, 3].map((s) => (
                       <div 
                        key={s} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                            step >= s ? "bg-primary text-white scale-110" : "bg-white text-slate-400 border border-slate-200"
                        }`}
                       >
                           {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                       </div>
                   ))}
                </div>

                {step === 1 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card">
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                            <Truck className="w-6 h-6" /> Shipping Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                                    placeholder="123 Aura Ave" 
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                                    placeholder="San Francisco" 
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                                    placeholder="94105" 
                                    value={formData.zip}
                                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => setStep(2)}
                            className="bg-slate-900 text-white w-full py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                        >
                            Continue to Payment
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card">
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                            <CreditCard className="w-6 h-6" /> Payment Method
                        </h2>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 mb-8 flex items-center justify-center gap-4 text-slate-500">
                             <ShieldCheck className="w-8 h-8 opacity-50" />
                             <p className="text-sm">Stripe Secure Checkout integration powered by Aura Pay.</p>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            disabled={loading}
                            className="bg-primary text-white w-full py-5 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Complete Purchase"}
                        </button>
                        <button 
                            onClick={() => setStep(1)}
                            className="w-full py-4 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
                        >
                            Back to Shipping
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white rounded-[3rem] shadow-2xl border border-green-50">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-4xl font-bold font-outfit mb-4">Order Confirmed!</h2>
                        <p className="text-slate-500 mb-10 max-w-md mx-auto">
                            Thank you for your purchase. We've sent a confirmation email and will notify you when your items ship.
                        </p>
                        <Link href="/orders" className="bg-slate-900 text-white px-10 py-5 rounded-full font-bold inline-block hover:bg-slate-800 transition-all shadow-xl">
                            Track My Order
                        </Link>
                     </motion.div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
