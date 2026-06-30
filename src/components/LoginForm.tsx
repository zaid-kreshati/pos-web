import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { loginFormSchema } from '../utils/validation';
import type { LoginFormSchema } from '../utils/validation';
import { LoadingSpinner } from './LoadingSpinner';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Wallet, ShieldCheck } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormSchema) => {
    try {
      clearError();
      await login({
        email: data.email,
        password: data.password,
      });
      addToast('تم تسجيل الدخول بنجاح!', 'success');
      navigate('/create-invoice');
    } catch {
      const errorMessage = error || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.';
      addToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md" dir="rtl">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-6 shadow-xl shadow-green-500/20">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">إنفويسلي</h1>
          <p className="text-slate-400 text-lg">فواتير احترافية مبسطة.</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-2">مرحباً بك</h2>
          <p className="text-slate-400 mb-7">يرجى إدخال تفاصيلك لتسجيل الدخول.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`w-full pr-12 pl-4 py-3 bg-slate-900 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-white placeholder-slate-500 ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-2 flex-row-reverse">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  كلمة المرور
                </label>
                <a href="#" className="text-sm font-medium text-green-500 hover:text-green-400 transition">
                  نسيت كلمة المرور؟
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full pr-12 pl-12 py-3 bg-slate-900 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-white placeholder-slate-500 ${
                    errors.password ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Remember this device */}
            <div className="flex items-center gap-3 flex-row-reverse">
              <input
                type="checkbox"
                id="remember"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="remember" className="text-sm text-slate-300">
                البقاء مسجل الدخول لمدة 30 يوماً
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 text-lg shadow-lg ${
                isLoading
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>جارٍ تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-6 h-6 rotate-180" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800 text-slate-400">أو متابعة باستخدام</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-3 px-4 border border-slate-700 rounded-xl bg-slate-900 hover:bg-slate-700 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.730155 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                </svg>
                <span className="text-slate-300 font-medium">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-3 px-4 border border-slate-700 rounded-xl bg-slate-900 hover:bg-slate-700 transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.8 6.2c.8-1 1.3-2.1 1.2-3.3-1.2.1-2.5.7-3.3 1.7-.8 1-1.3 2.1-1.2 3.3 1.3 0 2.5-.7 3.3-1.7zm2.6 4.2c-1.4-1.2-3.3-1.8-5.2-1.5-1.9.3-3.5 1.5-4.2 3.1-1.3 2.8-.3 6.3 1.9 7.5 1 .5 2.1.7 3.2.7 1 0 2.1-.2 3.1-.7 2.2-1.2 3.3-4.7 2-7.5-.3-.6-.8-1.2-1.3-1.6h-.5zm-1.7 6.8c-.8.5-1.8.8-2.8.8s-2-.3-2.8-.8c-2-1.1-3-4.3-1.6-6.4.6-1 1.7-1.6 2.9-1.8 1.2-.2 2.5.1 3.5.8.9.6 1.6 1.5 1.9 2.5 1.1 2.1.1 5.3-1.9 6.4-.1-.1-.1-.1-.2-.1z" className="text-slate-300"/>
                </svg>
                <span className="text-slate-300 font-medium">Apple</span>
              </button>
            </div>

            {/* Sign up link */}
            <p className="text-center text-slate-400 mt-7">
              ليس لديك حساب؟{' '}
              <a href="#" className="text-green-500 font-semibold hover:text-green-400 transition">
                ابدأ الفترة التجريبية المجانية لمدة 14 يوماً
              </a>
            </p>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mt-5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <p className="text-slate-500 text-sm">محم بتشفير AES 256-بت</p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-center gap-8">
          <a href="#" className="text-slate-500 text-sm hover:text-slate-400 transition">سياسة الخصوصية</a>
          <a href="#" className="text-slate-500 text-sm hover:text-slate-400 transition">شروط الخدمة</a>
          <a href="#" className="text-slate-500 text-sm hover:text-slate-400 transition">الحالة</a>
        </div>
      </div>
    </div>
  );
};
