"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, X, LogOut, ChevronDown, LayoutDashboard, ShieldCheck, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const Navbar = () => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [user, setUser] = useState<{username: string, role: string} | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchUserData = async () => {
        try {
            const response = await api.get("/auth/me");
            if (response.data) {
                const userData = {
                    username: response.data.username,
                    role: response.data.role
                };
                setUser(userData);
                localStorage.setItem("username", userData.username);
                localStorage.setItem("role", userData.role);
                fetchNotifications();
            }
        } catch (error) {
            const storedUser = localStorage.getItem("username");
            const storedRole = localStorage.getItem("role");
            if (storedUser) {
                setUser({ username: storedUser, role: storedRole || "customer" });
            } else {
                setUser(null);
            }
        }
    }

    const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        if (!token) return; // Silent return for guests
        
        try {
            const response = await api.get("/notifications");
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    }

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    }

    useEffect(() => {
        fetchUserData();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        setUser(null);
        router.push("/login");
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                        <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                            <ShieldCheck className="text-white w-6 h-6" />
                        </motion.div>
                    </div>
                    <span className="text-2xl font-black tracking-tighter font-outfit">Aura<span className="text-primary">.</span></span>
                </Link>

                <div className="hidden md:flex items-center gap-10">
                    <Link href="/products" className="text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Catalog</Link>
                    <Link href="/categories" className="text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Categories</Link>
                    <Link href="/orders" className="text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">My Orders</Link>
                    {user?.role === 'admin' && (
                        <Link href="/admin" className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20">
                            Admin 🚀
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input type="text" placeholder="Search products..." className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 lg:w-64 transition-all" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                    </div>

                    <div className="relative">
                        <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors relative text-slate-600">
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
                        </button>
                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 overflow-hidden">
                                    <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-4">Alerts</h4>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {notifications.length === 0 ? <p className="text-slate-400 text-xs text-center py-4 italic">No alerts yet</p> : 
                                            notifications.map(n => (
                                                <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-3 rounded-2xl cursor-pointer ${n.is_read ? 'bg-white opacity-60' : 'bg-slate-50 border border-slate-100'}`}>
                                                    <p className="text-xs font-medium text-slate-700">{n.message}</p>
                                                    <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link href="/cart" className="p-3 hover:bg-slate-50 rounded-2xl transition-colors relative group">
                        <ShoppingCart className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors" />
                    </Link>

                    <div className="relative">
                        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 pr-3 hover:bg-slate-50 rounded-full transition-colors border border-transparent hover:border-slate-100">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-slate-500" /></div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-50">
                                    <div className="p-4 border-b border-slate-50 mb-2"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p><p className="font-black text-slate-900">{user?.username || 'Guest'}</p></div>
                                    {user?.role === 'admin' && <Link href="/admin" className="flex items-center gap-3 p-3 text-sm font-bold text-slate-600 hover:bg-primary/5 hover:text-primary rounded-2xl transition-colors"><LayoutDashboard className="w-5 h-5" /> Admin Center</Link>}
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors"><LogOut className="w-5 h-5" /> Sign Out</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
