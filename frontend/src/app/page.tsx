"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Zap, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    image?: string;
}

export default function Home() {
  const [trending, setTrending] = useState<Product[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get("/products");
        // Limit to 4 trending items
        setTrending(response.data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching trending products:", error);
      }
    };
    fetchTrending();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        await api.post("/cart/add", {
            product_id: productId,
            quantity: 1
        });
        alert("Added to cart successfully!");
    } catch (error) {
        alert("Please login to add items to your cart.");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-bold font-outfit leading-tight mb-8">
              Elevate Your <span className="text-primary italic">Digital Life.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
              Discover the next generation of smart tech and premium lifestyle essentials. 
              Curated for those who demand excellence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all group">
                Shop Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/categories" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold transition-all border border-white/10">
                Explore Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/4 -left-24 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full" />
      </section>

      {/* Stats/Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="bg-slate-100 p-4 rounded-3xl mb-6 hover:-translate-y-2 transition-transform cursor-default">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-slate-500">Same-day shipping for all premium aura members.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-slate-100 p-4 rounded-3xl mb-6 hover:-translate-y-2 transition-transform cursor-default">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-slate-500">Bank-grade security with end-to-end encryption.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-slate-100 p-4 rounded-3xl mb-6 hover:-translate-y-2 transition-transform cursor-default">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Exclusive Benefits</h3>
              <p className="text-slate-500">Access to limited drops and member-only pricing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold font-outfit mb-4">Trending Now</h2>
              <p className="text-slate-500">Handpicked items that are making waves this week.</p>
            </div>
            <Link href="/products" className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trending.length === 0 ? (
                [1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-200 rounded-3xl h-[400px] animate-pulse" />
                ))
            ) : (
                trending.map((p, idx) => (
                    <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className="premium-card relative group"
                    >
                        <div className="aspect-square bg-slate-100 rounded-2xl mb-6 overflow-hidden relative group/image">
                            {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
                            )}
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/image:opacity-100 transition-opacity" />
                            
                            <button 
                                onClick={(e) => handleAddToCart(e, p.id)}
                                className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-xl opacity-0 z-20 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all shadow-xl hover:scale-105 active:scale-95"
                            >
                                <ShoppingCart className="w-5 h-5 font-bold" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{p.name}</h4>
                            </div>
                            <span className="text-xl font-outfit font-black block">${p.price}</span>
                        </div>
                        <Link href={`/products/${p.slug}`} className="absolute inset-0 z-10 cursor-pointer" />
                    </motion.div>
                ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
