"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Mail, Shield, LogOut, ChevronRight, Settings, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UserProfile {
  username: string;
  email: string;
  role: string;
  date_joined?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("token")) {
      fetchProfile();
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-violet-500 animate-spin" />
            <span className="text-violet-400 font-bold tracking-widest uppercase text-sm">
                Authenticating Aura...
            </span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-32 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
          
        {/* Header Profile Section */}
        <div className="flex flex-col md:flex-row items-center md:items-center gap-10 mb-16 rounded-3xl p-10 bg-slate-900/40 border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent pointer-events-none" />
            
            <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
            >
                <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-2xl relative z-10 p-1">
                    <div className="w-full h-full bg-slate-950 rounded-[1.8rem] flex items-center justify-center">
                        <User size={50} strokeWidth={1.5} className="text-violet-400" />
                    </div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 z-20 shadow-xl backdrop-blur-md">
                    <Shield size={20} />
                </div>
                <div className="absolute inset-0 bg-violet-600 blur-3xl opacity-30 -z-10 animate-pulse" />
            </motion.div>

            <div className="text-center md:text-left space-y-3 z-10 flex-1">
                <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-1">
                    {user.username}<span className="text-violet-500">.</span>
                </h1>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs flex items-center justify-center md:justify-start gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Aura Established {user.role?.toUpperCase()}
                </p>
            </div>
            
            <div className="hidden md:block z-10 text-right space-y-2">
                 <p className="text-slate-500 font-bold text-xs tracking-widest uppercase">Member Timeline</p>
                 <p className="text-white text-sm font-medium tracking-wide">
                     {user.date_joined ? new Date(user.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Recently Authenticated"}
                 </p>
            </div>
        </div>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-800/60 bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-transparent opacity-50" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-8 px-8 border-none">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact Identity</CardTitle>
                    <Mail className="h-5 w-5 text-violet-400" />
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-4 border-none">
                    <p className="text-xl font-bold text-white tracking-tight truncate">{user.email}</p>
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                        <Shield className="w-3 h-3" />
                        Verified Protocol
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-800/60 bg-slate-900/60 hover:bg-slate-800/80 transition-all duration-300 backdrop-blur-2xl shadow-2xl overflow-hidden relative group cursor-pointer" onClick={() => router.push("/orders")}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-0 group-hover:opacity-50 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-8 px-8 border-none">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Curated Collections</CardTitle>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                        <PackageOpen className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-4 border-none">
                    <p className="text-2xl font-bold text-white tracking-tight transition-colors group-hover:text-violet-400">View Acquisitions</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-violet-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">Access Locker</span>
                        <ChevronRight className="w-4 h-4 text-violet-400 group-hover:translate-x-2 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <Button variant="outline" className="border-slate-800 bg-slate-900/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-xl px-8 h-12 flex items-center gap-2 font-semibold">
                <Settings className="w-4 h-4" />
                Experience Configuration
            </Button>
            
            <button
                onClick={handleLogout}
                className="px-8 h-12 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold tracking-widest uppercase text-xs transition-all duration-300 flex items-center justify-center border border-red-500/20 active:scale-[0.98]"
            >
                <LogOut className="mr-2 h-4 w-4" />
                Terminate Session
            </button>
        </div>

        <div className="mt-24 text-center">
            <p className="text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px]">Aura Core Identity System v1.0</p>
        </div>
      </div>
    </div>
  );
}
