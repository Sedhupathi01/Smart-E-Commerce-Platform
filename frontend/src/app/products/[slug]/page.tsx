"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
    image?: string;
}

export default function ProductDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // In a real app, you'd fetch by slug. Here we fetch all and find matching slug
                const response = await api.get("/products");
                const found = response.data.find((p: Product) => p.slug === slug);
                if (found) {
                    setProduct(found);
                }
            } catch (error) {
                console.error("Error fetching product detail:", error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchProduct();
    }, [slug]);

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await api.post("/cart/add", {
                product_id: product.id,
                quantity: quantity
            });
            alert("Success! " + product.name + " has been added to your collection.");
        } catch (error) {
            alert("Please login to start building your collection.");
        }
    };

    if (loading) return (
        <div className="pt-40 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-primary rounded-full" role="status"></div>
            <p className="mt-4 text-slate-500 font-medium tracking-tight">Syncing with catalog...</p>
        </div>
    );

    if (!product) return (
        <div className="pt-40 text-center">
            <h2 className="text-3xl font-bold mb-4">Discovery Failed</h2>
            <p className="text-slate-500 mb-8">The requested item has been delisted or does not exist.</p>
            <button onClick={() => router.push("/products")} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20">Return to Catalog</button>
        </div>
    );

    return (
        <div className="pt-32 pb-24 bg-white min-h-screen">
            <div className="container mx-auto px-6">
                <button 
                  onClick={() => router.push("/products")}
                  className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-12 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Collection
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                    {/* Visual Section */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="aspect-square bg-slate-50 rounded-[3rem] overflow-hidden relative shadow-2xl shadow-slate-200/50"
                    >
                        {product.image ? (
                            <img 
                              src={product.image.startsWith('http') ? product.image : `http://localhost:8001/media/${product.image}`} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-700" 
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <span className="text-slate-400 font-medium">Visualizing Aura Asset...</span>
                            </div>
                        )}
                        <div className="absolute top-8 left-8">
                            <span className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest text-primary shadow-lg border border-white/20">
                                Premium Catalog
                            </span>
                        </div>
                    </motion.div>

                    {/* Intellectual Section */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-amber-500">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-xs text-slate-400 ml-2 font-medium">(4.9/5 Rating)</span>
                            </div>
                            <h1 className="text-5xl font-black font-outfit leading-tight mb-4">{product.name}</h1>
                            <p className="text-2xl font-black text-primary font-outfit tracking-tight">${product.price}</p>
                        </div>

                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg italic">
                            "{product.description}"
                        </div>

                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
                                    <button 
                                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors font-bold text-slate-600"
                                    >-</button>
                                    <span className="w-12 text-center font-bold font-inter">{quantity}</span>
                                    <button 
                                      onClick={() => setQuantity(quantity + 1)}
                                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors font-bold text-slate-600"
                                    >+</button>
                                </div>
                                <span className="text-sm text-slate-400 font-medium">{product.stock} units currently available</span>
                            </div>

                            <button 
                              onClick={handleAddToCart}
                              className="w-full bg-primary hover:bg-primary/95 text-white py-5 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-primary/30 hover:-translate-y-1 active:translate-y-0"
                            >
                                <ShoppingCart className="w-6 h-6" /> Add to Aura Collection
                            </button>
                        </div>

                        {/* Premium Confidence Indicators */}
                        <div className="grid grid-cols-2 gap-4 pt-8">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Secure Warranty</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                <Truck className="w-5 h-5 text-blue-500" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Aura Delivery</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
