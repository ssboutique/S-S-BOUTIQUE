<template>
  <div class="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
    <div class="w-20 h-20 rounded-3xl bg-slate-850 border border-slate-800 flex items-center justify-center text-brand-400 font-extrabold text-3xl mb-6 shadow-glow">
      404
    </div>
    <h1 class="text-3xl font-black text-white tracking-tight">Página No Encontrada</h1>
    <p class="text-sm text-slate-400 max-w-sm mt-2">
      La tienda o enlace que buscas no existe o ha sido modificado.
    </p>
    <router-link
      to="/"
      class="mt-6 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-glow transition-all"
    >
      Volver al Inicio
    </router-link>
  </div>
</template>
