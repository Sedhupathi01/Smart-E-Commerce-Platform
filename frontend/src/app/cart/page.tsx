"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

const CartPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const response = await api.get("/cart");
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (productId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            return removeItem(productId);
        }
        
        setCartItems(prev => prev.map(item => item.product_id === productId ? {...item, quantity: newQuantity} : item));
        
        try {
            await api.put(`/cart/update/${productId}`, { quantity: newQuantity });
        } catch (error) {
            console.error("Failed to update", error);
            fetchCart(); // Revert on fail
        }
    }

    const removeItem = async (productId: number) => {
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
        try {
            await api.delete(`/cart/remove/${productId}`);
        } catch (error) {
            console.error("Failed to delete", error);
            fetchCart(); // Revert on fail
        }
    }

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (loading) return <div className="pt-32 text-center">Loading cart...</div>;

    return (
        <div className="pt-32 pb-24 min-h-screen bg-slate-50">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-bold font-outfit mb-12">Your Shopping Bag</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xl">
                        <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-4">Your bag is empty</h2>
                        <p className="text-slate-500 mb-8">Looks like you haven't added anything to your bag yet.</p>
                        <Link href="/products" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.product_id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-6"
                                    >
                                        <div className="w-24 h-24 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden">
                                           {item.image ? (
                                                <img 
                                                    src={item.image.startsWith('http') ? item.image : `http://localhost:8001/media/${item.image}`} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                                    <ShoppingBag className="w-8 h-8 text-slate-400 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="font-bold text-lg">{item.name || "Product Name"}</h3>
                                                <button onClick={() => removeItem(item.product_id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <p className="text-slate-500 text-sm mb-4">Standard Size</p>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                                                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="hover:text-primary"><Minus className="w-4 h-4" /></button>
                                                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="hover:text-primary"><Plus className="w-4 h-4" /></button>
                                                </div>
                                                <span className="text-lg font-black">${item.price || 0}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl sticky top-32">
                                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Shipping</span>
                                        <span className="text-green-500 font-bold">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Estimated Tax</span>
                                        <span>$0.00</span>
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="flex justify-between text-2xl font-black">
                                        <span>Total</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Link href="/checkout" className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all border border-slate-950 group">
                                    Checkout Now
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <p className="text-center text-slate-400 text-xs mt-6">
                                    Secure SSL encrypted checkout
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
