"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
    LayoutDashboard, Users, ShoppingBag, Package, Trash2, TrendingUp, BarChart3, Activity 
} from "lucide-react";

interface AdminData {
    stats: any;
    users: any[];
    products: any[];
    orders: any[];
    recent_orders?: any[];
}

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('analytics');
    const [data, setData] = useState<AdminData>({ stats: null, users: [], products: [], orders: [] });
    const [loading, setLoading] = useState(true);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: 0,
        stock: 0,
        description: '',
        category_id: 1,
        image: ''
    });
    const router = useRouter();

    const fetchAdminData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        try {
            setLoading(true);
            const [analyticsRes, usersRes, productsRes, ordersRes, catsRes] = await Promise.all([
                api.get("/admin/analytics"),
                api.get("/admin/users"),
                api.get("/admin/products"),
                api.get("/admin/orders"),
                api.get("/admin/categories")
            ]);
            setData({
                stats: analyticsRes.data.stats,
                recent_orders: analyticsRes.data.recent_orders,
                users: usersRes.data,
                products: productsRes.data,
                orders: ordersRes.data
            });
            setCategories(catsRes.data);
        } catch (err: any) {
            console.error("Admin fetch boundary failed:", err);
            if (err.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                router.push("/auth/login");
            } else if (err.response?.status === 403) {
                alert("Unauthorized: You must have administrator privileges to view this page.");
                router.push("/profile");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const deleteProduct = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/admin/products/${id}`);
            fetchAdminData();
        } catch (err) {
            alert("Failed to delete product");
        }
    };

    const updateOrderStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/admin/orders/${id}/status`, { status });
            fetchAdminData();
        } catch (err) {
            alert("Failed to update order");
        }
    };

    const updateUserRole = async (id: number, role: string) => {
        try {
            await api.patch(`/admin/users/${id}/role`, { role });
            fetchAdminData();
        } catch (err) {
            alert("Failed to update user role");
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/admin/products", newProduct);
            setShowAddProduct(false);
            setNewProduct({ name: '', price: 0, stock: 0, description: '', category_id: 1, image: '' });
            fetchAdminData();
        } catch (err) {
            alert("Failed to create product");
        }
    };

    if (loading) return <div className="pt-32 text-center text-slate-500 animate-pulse font-bold tracking-widest uppercase">Initializing Command Center...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 pt-24 pb-12">
            <div className="container mx-auto px-6">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8">
                    <div className="p-4 bg-primary/20 rounded-2xl">
                        <LayoutDashboard className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Admin Command Center</h1>
                        <p className="text-slate-400 font-medium tracking-widest uppercase text-sm mt-2">Manage products, verify users, and monitor telemetry.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-white/5 text-slate-400'}`}>
                            <BarChart3 className="w-5 h-5" /> Analytics
                        </button>
                        <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-white/5 text-slate-400'}`}>
                            <Package className="w-5 h-5" /> Product Management
                        </button>
                        <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-white/5 text-slate-400'}`}>
                            <ShoppingBag className="w-5 h-5" /> Order Fulfillment
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-white/5 text-slate-400'}`}>
                            <Users className="w-5 h-5" /> User Directory
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        
                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && data.stats && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <TrendingUp className="w-8 h-8 text-green-500 mb-4" />
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Sales</p>
                                        <p className="text-3xl font-black text-white mt-1">${data.stats.sales.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <Users className="w-8 h-8 text-blue-500 mb-4" />
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Global Users</p>
                                        <p className="text-3xl font-black text-white mt-1">{data.stats.users}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <ShoppingBag className="w-8 h-8 text-violet-500 mb-4" />
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Orders</p>
                                        <p className="text-3xl font-black text-white mt-1">{data.stats.orders}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <Activity className="w-8 h-8 text-amber-500 mb-4" />
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Products</p>
                                        <p className="text-3xl font-black text-white mt-1">{data.stats.products}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products Tab */}
                        {activeTab === 'products' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-white">Inventory Intelligence</h3>
                                    <button 
                                        onClick={() => setShowAddProduct(true)}
                                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Package className="w-4 h-4" /> Add New Asset
                                    </button>
                                </div>
                                <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/10">
                                            <tr>
                                                <th className="px-6 py-4 font-bold text-slate-300">ID</th>
                                                <th className="px-6 py-4 font-bold text-slate-300">Product Name</th>
                                                <th className="px-6 py-4 font-bold text-slate-300">Price</th>
                                                <th className="px-6 py-4 font-bold text-slate-300">Inventory</th>
                                                <th className="px-6 py-4 font-bold text-slate-300 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {data.products.map((p: any) => (
                                                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">#{p.id}</td>
                                                    <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                                                    <td className="px-6 py-4">${p.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4 font-bold">{p.stock}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-xl transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-slate-300">Order ID</th>
                                            <th className="px-6 py-4 font-bold text-slate-300">User ID</th>
                                            <th className="px-6 py-4 font-bold text-slate-300">Valuation</th>
                                            <th className="px-6 py-4 font-bold text-slate-300">Status</th>
                                            <th className="px-6 py-4 font-bold text-slate-300 text-right">Update</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.orders.map((o: any) => (
                                            <tr key={o.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-white">#{o.id}</td>
                                                <td className="px-6 py-4 text-slate-400">UID: {o.user_id}</td>
                                                <td className="px-6 py-4 font-black">${o.total.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <select 
                                                        value={o.status}
                                                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                                        className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-xs font-bold text-primary focus:ring-1 focus:ring-primary outline-none"
                                                    >
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs text-slate-500 font-mono">{o.payment}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-slate-300">User ID</th>
                                            <th className="px-6 py-4 font-bold text-slate-300">Username</th>
                                            <th className="px-6 py-4 font-bold text-slate-300">Email</th>
                                            <th className="px-6 py-4 font-bold text-slate-300">Authority</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.users.map((u: any) => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-slate-400">#{u.id}</td>
                                                <td className="px-6 py-4 font-medium text-white">{u.username}</td>
                                                <td className="px-6 py-4 text-slate-400">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <select 
                                                        value={u.role}
                                                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                        className={`bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-xs font-bold focus:ring-1 focus:ring-primary outline-none ${u.role === 'admin' ? 'text-primary' : 'text-slate-400'}`}
                                                    >
                                                        <option value="customer">Customer</option>
                                                        <option value="admin">Administrator</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
