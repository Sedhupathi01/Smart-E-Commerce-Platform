"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { User, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);
      router.push("/profile");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-slate-800/60 bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-emerald-500" />
          
          <CardHeader className="space-y-3 pb-8 pt-10 px-10 text-center">
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <CardTitle className="text-4xl font-black tracking-tight text-white italic">
                Aura<span className="text-violet-500">.</span>
                </CardTitle>
            </motion.div>
            <CardDescription className="text-slate-400 font-medium text-sm max-w-[250px] mx-auto leading-relaxed">
                Welcome back to premium living. Access your collections.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                
                <div className="relative group">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Username"
                    className="pl-11 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all rounded-xl"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-11 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold tracking-wide rounded-xl transition-all duration-300 transform active:scale-[0.98] group mt-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
                ) : (
                  <span className="flex items-center justify-center w-full">
                    Continue Experience
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8 bg-slate-900/30 border-t border-slate-800/50 pt-6">
            <div className="text-sm text-center text-slate-500 flex flex-col gap-2">
              <span>New to Aura?</span>
              <Link href="/auth/register" className="text-white hover:text-violet-300 font-bold transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-1 group">
                Request Invitation <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
