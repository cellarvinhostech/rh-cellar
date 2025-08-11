import { useState } from "react";
import { useLocation } from "wouter";
import { Mail, ArrowLeft, BarChart3, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { ResetPasswordRequest } from "@/types/auth";

export default function ForgotPassword() {
  const [_, navigate] = useLocation();
  const { requestPasswordReset, authState } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await requestPasswordReset({ email });
      setIsSubmitted(true);
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar e-mail de recuperação.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50" data-testid="forgot-password-success">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">E-mail enviado!</h2>
            <p className="text-slate-600 mb-6">
              Enviamos um link para redefinir sua senha para <strong>{email}</strong>. 
              Verifique sua caixa de entrada e siga as instruções.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full btn-primary justify-center py-3"
                data-testid="button-back-to-login"
              >
                Voltar ao login
              </button>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full btn-secondary justify-center py-3"
                data-testid="button-try-again"
              >
                Tentar outro e-mail
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" data-testid="forgot-password-page">
      {/* Left Side - Gradient */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">Esqueceu sua senha?</h1>
          <p className="text-xl text-white/90 text-center leading-relaxed">
            Não se preocupe, isso acontece com todos. Vamos ajudá-lo a recuperar o acesso.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full" />
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Redefinir senha</h2>
              <p className="text-slate-600">
                Digite seu e-mail e enviaremos um link para redefinir sua senha
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="seu@email.com"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authState.isLoading}
                className="w-full btn-primary justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-reset-password"
              >
                {authState.isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center text-sm text-slate-600 hover:text-primary font-medium"
                data-testid="link-back-to-login"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}