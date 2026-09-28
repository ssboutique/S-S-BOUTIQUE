<script setup lang="ts">
import { computed } from 'vue';
import {
  ShoppingBag,
  Sparkles,
  MessageCircle,
  Zap,
  Shield,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ExternalLink
} from 'lucide-vue-next';

const developerCredit = computed(() => {
  return import.meta.env.VITE_DEVELOPER_CREDIT || 'Desarrollado por Edisson Pinza';
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
    <!-- Navbar -->
    <header class="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-extrabold text-lg shadow-glow group-hover:scale-105 transition-transform">
            V
          </div>
          <div>
            <span class="text-xl font-black text-white tracking-tight">VendPro</span>
            <span class="block text-[10px] text-brand-400 font-bold uppercase tracking-wider">Tiendas Digitales</span>
          </div>
        </router-link>

        <div class="flex items-center gap-3 sm:gap-4">
          <router-link
            to="/tienda/ss-boutique"
            class="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <span>Ver Tienda Demo</span>
            <ExternalLink class="w-3.5 h-3.5 text-slate-400" />
          </router-link>

          <router-link
            to="/login"
            class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
          >
            Iniciar Sesión
          </router-link>

          <router-link
            to="/register"
            class="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95"
          >
            Crear Mi Tienda
          </router-link>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-16 pb-24 overflow-hidden">
      <!-- Glow Gradients -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles class="w-4 h-4" />
          <span>La forma más rápida de vender por WhatsApp</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
          Tu Catálogo Digital Moderno con Pedidos Directos a WhatsApp
        </h1>

        <p class="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Diseñado para ropa, tecnología, calzado, belleza y cualquier comercio. Sin pasarelas lentas, sin registrar clientes: el cliente agrega al carrito y te envía el pedido ordenado a tu chat.
        </p>

        <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link
            to="/register"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-base shadow-glow transition-all active:scale-95"
          >
            <span>Crear mi Tienda Gratis</span>
            <ArrowRight class="w-5 h-5" />
          </router-link>

          <router-link
            to="/tienda/ss-boutique"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-800 transition-all shadow-soft"
          >
            <ShoppingBag class="w-5 h-5 text-brand-400" />
            <span>Probar Tienda Demo en Vivo</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Platform Features -->
    <section class="py-20 bg-slate-900/60 border-y border-slate-850">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Todo lo que necesitas para tu comercio
          </h2>
          <p class="text-slate-400 text-sm sm:text-base">
            Una plataforma SaaS moderna, intuitiva y pensada para convertir visitas en ventas inmediatas.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-8 rounded-3xl bg-slate-850 border border-slate-800 space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
              <MessageCircle class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-white">Pedidos por WhatsApp</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              El cliente completa su carrito y recibe un mensaje estructurado con productos, cantidades, variantes, precio y datos de entrega listos para enviar.
            </p>
          </div>

          <div class="p-8 rounded-3xl bg-slate-850 border border-slate-800 space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <Zap class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-white">Panel 100% Administrable</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Sube tus productos, define fotos, activa tallas o colores, ajusta precios y cambia los colores de tu marca sin tocar una sola línea de código.
            </p>
          </div>

          <div class="p-8 rounded-3xl bg-slate-850 border border-slate-800 space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Smartphone class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-white">PWA & Ultrarrápida</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Optimizada para teléfonos móviles, instalable en pantalla de inicio con vite-plugin-pwa y tiempos de carga instantáneos en cualquier conexión.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 border-t border-slate-850 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 space-y-3">
        <p class="text-slate-400 font-medium">
          VendPro - Plataforma Multi-Tienda Digital con Supabase & Vue 3
        </p>
        <p class="text-slate-400">
          {{ developerCredit }}
        </p>
      </div>
    </footer>
  </div>
</template>
