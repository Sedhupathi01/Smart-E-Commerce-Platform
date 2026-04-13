"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Laptop, Palmtree, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    id: 1,
    name: "Electronics",
    description: "Premium tech-based essentialism",
    icon: <Laptop className="h-8 w-8 text-violet-500" />,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
    slug: "electronics"
  },
  {
    id: 2,
    name: "Lifestyle",
    description: "Everyday luxury and mindful objects",
    icon: <Palmtree className="h-8 w-8 text-emerald-500" />,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800",
    slug: "lifestyle"
  }
];

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles className="h-3 w-3" />
          The Curated Pulse
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white italic mb-4 decoration-violet-600 decoration-4">The Aura Collections.</h1>
        <p className="text-slate-400 max-w-xl font-medium leading-relaxed">
          Exploring excellence across our most refined categories. 
          Each collection is a testament to mindful living and superior design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 ring-1 ring-white/5 p-8 rounded-3xl bg-slate-900/20 backdrop-blur-3xl shadow-2xl">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group cursor-pointer"
            onClick={() => router.push(`/products?category=${category.slug}`)}
          >
            <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all duration-500 shadow-2xl relative overflow-hidden h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
              <img 
                src={category.image} 
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 mix-blend-overlay"
              />
              
              <div className="absolute top-6 left-6 z-20">
                <div className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                    {category.icon}
                </div>
              </div>

              <CardContent className="absolute bottom-0 left-0 w-full p-8 z-20">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none group-hover:text-violet-400 transition-colors">
                    {category.name}.
                  </h2>
                  <p className="text-slate-400 text-sm font-medium tracking-wide">
                    {category.description}
                  </p>
                  
                  <div className="pt-6 flex items-center gap-2 group-hover:gap-4 transition-all duration-500 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0">
                      <span className="text-xs font-bold uppercase tracking-widest text-white">Enter Collection</span>
                      <ArrowRight className="h-4 w-4 text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center">
          <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-xs">Aura Curated Excellence — Selection V2026</p>
      </div>
    </div>
  );
}
