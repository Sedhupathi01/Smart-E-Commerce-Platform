"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CreditCard, Truck, ShieldCheck, CheckCircle, ChevronRight, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { StripePayment } from "@/components/StripePayment";

const CheckoutPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [cart, setCart] = useState<any>(null);
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        zip: "",
    });

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await api.get("/cart");
                setCart(res.data);
            } catch (e) {
                console.error("Cart fetch failed:", e);
            }
        };
        fetchCart();
    }, []);

    const initiateOrder = async () => {
        if (!formData.address || !formData.city || !formData.zip) {
            alert("Please fill all shipping details");
            return;
        }

        setLoading(true);
        try {
            const realItems = cart.items.map((item: any) => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));

            const response = await api.post("/payments/create-payment-intent", {
                items: realItems,
                address: `${formData.address}, ${formData.city}, ${formData.zip}`
            });
            
            setClientSecret(response.data.client_secret);
            setStep(2);
        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            alert(error.response?.data?.detail || "Could not initiate payment");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        setStep(3);
    };

    const total = cart?.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;

    return (
        <div className="pt-32 pb-24 min-h-screen bg-[#FDFDFD]">
            <div className="container mx-auto px-6 max-w-6xl">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* Left: Order Summary (Sticky) */}
                    <div className="lg:col-span-5 order-2 lg:order-1">
                        <div className="sticky top-32">
                            <h2 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <span className="w-2 h-8 bg-primary rounded-full" />
                                Review Selection
                            </h2>
                            
                            <div className="space-y-6 mb-10 max-h-[50vh] overflow-y-auto pr-4 subtle-scroll">
                                {cart?.items?.map((item: any) => (
                                    <div key={item.product_id} className="flex gap-6 group">
                                        <div className="w-24 h-24 bg-slate-100 rounded-3xl overflow-hidden flex-shrink-0 border border-slate-200 group-hover:border-primary/20 transition-all">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-[10px]">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h3 className="font-bold text-slate-900 leading-tight mb-1">{item.name}</h3>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                                            <p className="text-sm font-black text-primary mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-slate-100 pt-8 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest">Subtotal</span>
                                    <span className="text-slate-900 font-bold">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest">Shipping Pulse</span>
                                    <span className="text-green-500 font-black uppercase tracking-widest">Encrypted / Free</span>
                                </div>
                                <div className="flex justify-between text-2xl pt-4 border-t-2 border-slate-50">
                                    <span className="font-black text-slate-900 tracking-tighter">Total</span>
                                    <span className="font-black text-primary tracking-tighter">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Interaction Pipeline */}
                    <div className="lg:col-span-7 order-1 lg:order-2">
                        {/* Stepper */}
                        <div className="flex items-center gap-4 mb-12">
                            {[1, 2, 3].map((s) => (
                                <React.Fragment key={s}>
                                    <div className={`flex items-center gap-3 ${step >= s ? "opacity-100" : "opacity-30"}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                                            step >= s ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" : "bg-white border-slate-200"
                                        }`}>
                                            {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                                        </div>
                                    </div>
                                    {s < 3 && <div className={`w-8 h-0.5 rounded-full ${step > s ? "bg-primary" : "bg-slate-200"}`} />}
                                </React.Fragment>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div 
                                    key="shipping" 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-50"
                                >
                                    <div className="mb-12">
                                        <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tighter mb-2">Delivery Core</h1>
                                        <p className="text-slate-400 font-medium">Coordinate your package destination in the Aura ledger.</p>
                                    </div>

                                    <div className="space-y-8 mb-12">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-6">Geometric Address</label>
                                            <input 
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-[2rem] py-6 px-10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner" 
                                                placeholder="77th Aura Drive" 
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-6">City Node</label>
                                                <input 
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-[2rem] py-6 px-10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner" 
                                                    placeholder="Silicon Bay" 
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-6">Portal Code</label>
                                                <input 
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-[2rem] py-6 px-10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner" 
                                                    placeholder="94101" 
                                                    value={formData.zip}
                                                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={initiateOrder}
                                        disabled={loading}
                                        className="w-full bg-slate-900 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-primary transition-all shadow-black/10 shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
                                    >
                                        {loading ? "Initializing..." : "Proceed to Aura Pay"}
                                        {!loading && <ChevronRight className="w-5 h-5" />}
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && clientSecret && (
                                <motion.div 
                                    key="payment" 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-50"
                                >
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h2 className="text-3xl font-black font-outfit text-slate-900 tracking-tighter mb-2">Stripe Protocol</h2>
                                            <p className="text-slate-400 font-medium">Merchant-grade encrypted transaction</p>
                                        </div>
                                        <ShieldCheck className="w-12 h-12 text-primary opacity-20" />
                                    </div>

                                    {clientSecret === "src_mock_secret" ? (
                                        <div className="space-y-8">
                                            <div className="p-10 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/20 text-center">
                                                <Lock className="w-10 h-10 text-primary mx-auto mb-4 opacity-40" />
                                                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Simulated Gateway</p>
                                                <p className="text-slate-500 font-medium text-sm">Key-less environment detected. Push 'Success' to coordinate the final pulse.</p>
                                            </div>
                                            <button 
                                                onClick={handlePaymentSuccess}
                                                className="w-full bg-primary text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20"
                                            >
                                                Confirm Payment
                                            </button>
                                        </div>
                                    ) : (
                                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                                            <StripePayment 
                                                onSuccess={handlePaymentSuccess}
                                                onError={(msg) => alert(msg)} 
                                            />
                                        </Elements>
                                    )}

                                    <button 
                                        onClick={() => setStep(1)}
                                        className="w-full py-6 text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest mt-6"
                                    >
                                        Back to shipping
                                    </button>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    className="text-center py-20 px-10"
                                >
                                    <div className="relative w-40 h-40 mx-auto mb-12">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                            className="w-full h-full bg-green-500 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-green-200 rotate-12"
                                        >
                                            <CheckCircle className="w-20 h-20 text-white" />
                                        </motion.div>
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="absolute -inset-4 border-2 border-dashed border-green-200 rounded-[4rem] -z-10"
                                        />
                                    </div>
                                    <h2 className="text-5xl font-black font-outfit mb-6 tracking-tighter text-slate-900 leading-none">Order Pulse Integrated.</h2>
                                    <p className="text-lg text-slate-400 font-medium mb-16 max-w-sm mx-auto leading-relaxed">
                                        Your acquisition is recorded. We will alert you the moment your pulse enters the physical stream.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                        <Link href="/orders" className="bg-slate-900 text-white px-14 py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                            Track Pulse
                                        </Link>
                                        <Link href="/products" className="bg-white text-slate-900 border-2 border-slate-100 px-14 py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">
                                            Return Home
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
