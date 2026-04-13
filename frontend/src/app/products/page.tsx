"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Filter, Search, Grid, List as ListIcon, ShoppingCart, SlidersHorizontal } from "lucide-react";
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

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/products");
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        e.stopPropagation(); // prevent triggering the full link underneath
        try {
            await api.post("/cart/add", {
                product_id: productId,
                quantity: 1
            });
            alert("Added to cart successfully!");
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Please login to add items to your cart.");
        }
    };

    return (
        <div className="pt-32 pb-24 min-h-screen bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold font-outfit mb-2">Our Collection</h1>
                        <p className="text-slate-500">Bringing you the finest selection of smart essentials.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="bg-slate-200 rounded-3xl h-[400px] animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map((p, idx) => (
                      <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="premium-card group relative"
                      >
                        <div className="aspect-[4/5] bg-slate-100 rounded-2xl mb-6 overflow-hidden relative group/image">
                           {p.image ? (
                             <img 
                               src={p.image.startsWith('http') ? p.image : `http://localhost:8001/media/${p.image}`} 
                               alt={p.name} 
                               className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-700" 
                             />
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
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-primary font-bold bg-primary/10 px-2 py-1 rounded-full mb-2 inline-block">
                            Premium Choice
                          </span>
                          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-outfit font-black">${p.price}</span>
                            <span className="text-xs text-slate-400">{p.stock} in stock</span>
                          </div>
                        </div>
                        <Link href={`/products/${p.slug}`} className="absolute inset-0 z-10 cursor-pointer" />
                      </motion.div>
                    ))}
                  </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;
