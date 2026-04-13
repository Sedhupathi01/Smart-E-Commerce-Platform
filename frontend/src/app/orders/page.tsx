"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ChevronRight, Package, Clock, ShieldCheck, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
}

interface Order {
  id: number;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  address: string;
  items: OrderItem[];
}

const statusIcons: { [key: string]: any } = {
  processing: <Clock className="h-4 w-4 mr-1" />,
  shipped: <Package className="h-4 w-4 mr-1" />,
  delivered: <ShieldCheck className="h-4 w-4 mr-1 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 mr-1 text-red-500" />,
};

const statusColors: { [key: string]: string } = {
  processing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/");
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("token")) {
      fetchOrders();
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-violet-400 font-medium tracking-widest uppercase">
          Reaching Aura Records...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-12">
        <ShoppingBag className="h-8 w-8 text-violet-500" />
        <h1 className="text-4xl font-bold tracking-tight text-white italic">My Collections</h1>
      </div>

      {orders.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl p-12 text-center">
          <p className="text-slate-400 mb-6 font-medium">Your Aura collection is currently awaiting its first piece.</p>
          <button
            onClick={() => router.push("/")}
            className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center group decoration-violet-500/30 underline-offset-4 hover:underline"
          >
            Start Curating Now
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors shadow-2xl group overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-violet-600/50 group-hover:bg-violet-500 transition-colors" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 mx-6 px-0">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Aura Identifier #{order.id}</p>
                    <p className="text-sm text-slate-400 font-medium">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${statusColors[order.order_status] || "bg-slate-800 text-slate-400"} flex items-center border font-semibold px-3 py-1`}>
                    {statusIcons[order.order_status]}
                    {order.order_status?.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap justify-between items-end gap-6">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-600">DELIVERY TO</p>
                        <p className="text-sm text-slate-300 font-medium max-w-xs truncate">{order.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">TOTAL VALUATION</p>
                      <p className="text-3xl font-black text-white italic tracking-tight underline decoration-violet-500/30 underline-offset-4 decoration-2">
                        ${Number(order.total_amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                      <button className="text-xs font-bold uppercase tracking-widest text-violet-400/70 hover:text-violet-300 flex items-center transition-colors group">
                          View Certificate of Purchase
                          <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
