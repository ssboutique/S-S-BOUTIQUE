<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStoreStore } from '@/stores/store';
import {
  Sparkles,
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  Facebook,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gem,
  Award,
  HeartHandshake
} from 'lucide-vue-next';

const storeStore = useStoreStore();

const currentPhotoIndex = ref(0);
const isHovered = ref(false);
let photoTimer: any = null;

// Default boutique photos if the store hasn't uploaded custom gallery yet
const defaultAboutPhotos = [
  {
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
    caption: 'Nuestro Atelier & Espacio Boutique',
  },
  {
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80',
    caption: 'Confección y Selección de Textiles Nobles',
  },
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
    caption: 'Colecciones de Pasarela & Tendencias Contemporáneas',
  },
  {
    url: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=1000&auto=format&fit=crop&q=80',
    caption: 'Detalles Artesanales y Acabados de Lujo',
  },
];

const aboutSettings = computed(() => {
  return storeStore.store?.theme_settings?.about || null;
});

const galleryPhotos = computed(() => {
  const custom = aboutSettings.value?.photos;
  if (custom && custom.length > 0) {
    return custom.map((url, idx) => ({
      url,
      caption: `Galería Boutique - Foto ${idx + 1}`,
    }));
  }
  return defaultAboutPhotos;
});

const totalPhotos = computed(() => galleryPhotos.value.length);

function nextPhoto() {
  if (totalPhotos.value <= 1) return;
  currentPhotoIndex.value = (currentPhotoIndex.value + 1) % totalPhotos.value;
}

function prevPhoto() {
  if (totalPhotos.value <= 1) return;
  currentPhotoIndex.value = (currentPhotoIndex.value - 1 + totalPhotos.value) % totalPhotos.value;
}

function startPhotoAutoplay() {
  stopPhotoAutoplay();
  if (totalPhotos.value > 1) {
    photoTimer = setInterval(() => {
      if (!isHovered.value) {
        nextPhoto();
      }
    }, 4000);
  }
}

function stopPhotoAutoplay() {
  if (photoTimer) {
    clearInterval(photoTimer);
    photoTimer = null;
  }
}

function openWhatsApp() {
  if (storeStore.store?.whatsapp_number) {
    const cleanPhone = storeStore.store.whatsapp_number.replace(/\D/g, '');
    const phone = cleanPhone.length === 10 && cleanPhone.startsWith('3') ? `57${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phone}?text=Hola!%20Deseo%20conocer%20m%C3%A1s%20sobre%20su%20historia%20y%20colecciones.`, '_blank');
  }
}

onMounted(() => {
  startPhotoAutoplay();
});

onUnmounted(() => {
  stopPhotoAutoplay();
});
</script>

<template>
  <section
    id="quienes-somos"
    class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-hidden scroll-mt-24"
    aria-label="Quiénes Somos y Nuestra Historia"
  >
    <!-- Background Decor Accent Glow -->
    <div class="absolute -top-10 -right-10 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-10 -left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12">
      
      <!-- Top Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-fuchsia-500/15 to-purple-500/15 border border-amber-300/60 text-amber-700 text-xs font-black uppercase tracking-wider mb-3">
          <Crown class="w-3.5 h-3.5 text-amber-600" />
          <span>Nuestra Esencia & Atelier de Autor</span>
        </div>

        <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {{ aboutSettings?.title || `Quiénes Somos | ${storeStore.store?.name || 'S&S BOUTIQUE'}` }}
        </h2>

        <p class="text-xs sm:text-sm text-slate-500 mt-2 font-normal leading-relaxed">
          {{ aboutSettings?.subtitle || 'Pasión por el diseño, selección minuciosa de textiles nobles y atención exclusiva a tu medida.' }}
        </p>
      </div>

      <!-- Main Two Column Grid: Story & Interactive Photo Slider -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        <!-- Left Column: Story, Values & Description (7 Cols) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            <p v-if="aboutSettings?.story">
              {{ aboutSettings.story }}
            </p>
            <template v-else>
              <p>
                En <strong class="text-slate-900 font-bold">{{ storeStore.store?.name || 'S&S BOUTIQUE' }}</strong> nacimos con la convicción de que la moda no es solo vestir, sino una declaración de estilo, sofisticación y autenticidad. Nos especializamos en piezas de alta confección, calzado en 100% cuero genuino y marroquinería de autor.
              </p>
              <p>
                Cada una de nuestras prendas y accesorios es seleccionada cuidadosamente siguiendo estándares rigurosos de durabilidad, cortes impecables y tejidos transpirables de calidad superior. Brindamos una experiencia de compra personalizada donde cada cliente recibe asesoría directa y cercana.
              </p>
            </template>
          </div>

          <!-- 3 Pillars / Value Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-fuchsia-200 transition-colors">
              <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 font-bold">
                <Gem class="w-4 h-4" />
              </div>
              <h4 class="text-xs font-bold text-slate-900">Diseño Exclusivo</h4>
              <p class="text-[11px] text-slate-500 mt-0.5">Colecciones de edición limitada y cortes contemporáneos.</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-fuchsia-200 transition-colors">
              <div class="w-8 h-8 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center mb-2 font-bold">
                <Award class="w-4 h-4" />
              </div>
              <h4 class="text-xs font-bold text-slate-900">Calidad Superior</h4>
              <p class="text-[11px] text-slate-500 mt-0.5">Materiales nobles, costuras reforzadas y acabados de lujo.</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-fuchsia-200 transition-colors">
              <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 font-bold">
                <HeartHandshake class="w-4 h-4" />
              </div>
              <h4 class="text-xs font-bold text-slate-900">Atención VIP</h4>
              <p class="text-[11px] text-slate-500 mt-0.5">Asesoría personalizada y pedidos inmediatos por WhatsApp.</p>
            </div>
          </div>

          <!-- Contact & Location Highlights -->
          <div class="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div class="space-y-1">
              <div class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5" />
                <span>{{ storeStore.store?.address || 'Showroom Oficial' }} - {{ storeStore.store?.city || 'Colombia' }}</span>
              </div>
              <div v-if="storeStore.store?.business_hours" class="text-[11px] text-slate-300 flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ storeStore.store.business_hours }}</span>
              </div>
            </div>

            <button
              type="button"
              @click="openWhatsApp"
              class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-glow active:scale-95 shrink-0"
            >
              <MessageCircle class="w-4 h-4" />
              <span>Contáctanos por WhatsApp</span>
            </button>
          </div>
        </div>

        <!-- Right Column: Automatic Elegant Boutique Photo Slider (5 Cols) -->
        <div
          class="lg:col-span-5 relative"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <!-- Frame & Glow -->
          <div class="relative w-full h-[380px] sm:h-[420px] rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-100 shadow-2xl group">
            
            <!-- Photos Transition Track -->
            <div
              v-for="(photo, idx) in galleryPhotos"
              :key="idx"
              class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              :class="idx === currentPhotoIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'"
            >
              <img
                :src="photo.url"
                :alt="photo.caption"
                class="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>

              <!-- Caption Overlay at bottom -->
              <div class="absolute bottom-4 inset-x-4 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Espacio Boutique</span>
                    <p class="text-xs font-bold text-white line-clamp-1">{{ photo.caption }}</p>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">
                    {{ idx + 1 }}/{{ totalPhotos }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Navigation Controls on hover -->
            <div v-if="totalPhotos > 1" class="absolute inset-y-0 inset-x-2 flex items-center justify-between z-20 pointer-events-none">
              <button
                type="button"
                @click="prevPhoto"
                class="w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center pointer-events-auto transition-all shadow-md active:scale-90 border border-white/20"
                aria-label="Foto anterior"
              >
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button
                type="button"
                @click="nextPhoto"
                class="w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center pointer-events-auto transition-all shadow-md active:scale-90 border border-white/20"
                aria-label="Foto siguiente"
              >
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>

            <!-- Progress Indicators / Dots -->
            <div v-if="totalPhotos > 1" class="absolute top-4 right-4 z-20 flex items-center gap-1.5">
              <button
                v-for="(_, idx) in galleryPhotos"
                :key="idx"
                type="button"
                @click="currentPhotoIndex = idx"
                class="h-1.5 rounded-full transition-all duration-300"
                :class="idx === currentPhotoIndex ? 'w-6 bg-amber-400 shadow-glow' : 'w-1.5 bg-white/50 hover:bg-white'"
                :aria-label="`Ver foto ${idx + 1}`"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  </section>
</template>
