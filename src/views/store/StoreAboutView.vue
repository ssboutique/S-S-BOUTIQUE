<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStoreStore } from '@/stores/store';
import { useCartStore } from '@/stores/cart';
import StoreHeader from '@/components/store/StoreHeader.vue';
import StoreFooter from '@/components/store/StoreFooter.vue';
import CartDrawer from '@/components/cart/CartDrawer.vue';
import CheckoutModal from '@/components/cart/CheckoutModal.vue';
import {
  Crown,
  Sparkles,
  MapPin,
  Clock,
  MessageCircle,
  Gem,
  Award,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Instagram,
  Facebook,
  ShieldCheck
} from 'lucide-vue-next';

const props = defineProps<{
  slug?: string;
}>();

const route = useRoute();
const router = useRouter();
const storeStore = useStoreStore();
const cartStore = useCartStore();

const isCheckoutOpen = ref(false);
const currentPhotoIndex = ref(0);
const isHovered = ref(false);
let photoTimer: any = null;

async function initAbout() {
  const targetSlug = props.slug || (route.params.slug as string) || 'ss-boutique';
  cartStore.setStoreContext(targetSlug);
  const success = await storeStore.loadStoreBySlug(targetSlug);
  if (success && storeStore.store) {
    document.title = `Quiénes Somos - ${storeStore.store.name}`;
  }
}

const defaultAboutPhotos = [
  {
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    caption: 'Nuestro Atelier & Espacio Boutique',
  },
  {
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80',
    caption: 'Confección y Selección de Textiles Nobles',
  },
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    caption: 'Colecciones de Pasarela & Tendencias Contemporáneas',
  },
  {
    url: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=1200&auto=format&fit=crop&q=80',
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
      caption: `Espacio & Atelier - Foto ${idx + 1}`,
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
    }, 4500);
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

watch(
  () => route.params.slug,
  () => {
    initAbout();
  }
);

onMounted(() => {
  initAbout();
  startPhotoAutoplay();
});

onUnmounted(() => {
  stopPhotoAutoplay();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-fuchsia-500 selection:text-white">
    <!-- Header -->
    <StoreHeader />

    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      <!-- Back to Catalog Link & Breadcrumb -->
      <div class="flex items-center justify-between">
        <router-link
          :to="`/tienda/${storeStore.store?.slug || 'ss-boutique'}`"
          class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-fuchsia-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Volver al Catálogo de Productos</span>
        </router-link>

        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
          <Crown class="w-3.5 h-3.5 text-amber-600" />
          <span>Atelier Oficial</span>
        </div>
      </div>

      <!-- Luxury Hero Banner for About Us -->
      <section class="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-800">
        <!-- Background Ambient Glow -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>

        <div class="relative max-w-3xl space-y-4">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/10 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles class="w-3.5 h-3.5" />
            <span>Nuestra Identidad & Trayectoria</span>
          </div>

          <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {{ aboutSettings?.title || `Quiénes Somos | ${storeStore.store?.name || 'S&S BOUTIQUE'}` }}
          </h1>

          <p class="text-slate-300 text-sm sm:text-lg font-normal leading-relaxed">
            {{ aboutSettings?.subtitle || 'Alta confección, calzado de autor y marroquinería de lujo elaborada con pasión y excelencia.' }}
          </p>
        </div>
      </section>

      <!-- Main Section: Story & Automatic Photo Gallery Slider -->
      <section class="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-10 lg:p-12 space-y-12">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Left Column: Story Description (6 Cols) -->
          <div class="lg:col-span-6 space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <span>Nuestra Historia</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Creando Estilo & Distinción
            </h2>

            <div class="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
              <p v-if="aboutSettings?.story">
                {{ aboutSettings.story }}
              </p>
              <template v-else>
                <p>
                  En <strong class="text-slate-900 font-bold">{{ storeStore.store?.name || 'S&S BOUTIQUE' }}</strong> creemos que la moda es una expresión íntima de sofisticación y personalidad. Nacimos con la visión de acercar piezas de alta costura, calzado de autor y marroquinería en 100% cuero genuino a clientes exigentes que valoran el detalle.
                </p>
                <p>
                  Cada prenda y accesorio de nuestro catálogo pasa por un riguroso proceso de selección y confección, garantizando cortes contemporáneos, tejidos de alta durabilidad y un confort inigualable para cualquier ocasión especial o vida cotidiana.
                </p>
              </template>
            </div>

            <!-- Call to action inside story -->
            <div class="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                @click="openWhatsApp"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-glow transition-all active:scale-95"
              >
                <MessageCircle class="w-4 h-4" />
                <span>Hablar con un Asesor VIP</span>
              </button>

              <router-link
                :to="`/tienda/${storeStore.store?.slug || 'ss-boutique'}`"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                <ShoppingBag class="w-4 h-4 text-slate-600" />
                <span>Ver Catálogo</span>
              </router-link>
            </div>
          </div>

          <!-- Right Column: Automatic High Fashion Photo Slider (6 Cols) -->
          <div
            class="lg:col-span-6 relative"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
          >
            <div class="relative w-full h-[380px] sm:h-[450px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 shadow-2xl group">
              <!-- Photo Slide -->
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

                <!-- Bottom Caption -->
                <div class="absolute bottom-4 inset-x-4 p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white">
                  <div class="flex items-center justify-between gap-2">
                    <div>
                      <span class="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Espacio Boutique & Atelier</span>
                      <p class="text-xs font-bold text-white">{{ photo.caption }}</p>
                    </div>
                    <span class="text-[10px] font-mono text-slate-400 bg-white/10 px-2.5 py-1 rounded-md">
                      {{ idx + 1 }} / {{ totalPhotos }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Navigation Controls -->
              <div v-if="totalPhotos > 1" class="absolute inset-y-0 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                <button
                  type="button"
                  @click="prevPhoto"
                  class="w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center pointer-events-auto transition-all shadow-md active:scale-90 border border-white/20"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft class="w-5 h-5" />
                </button>
                <button
                  type="button"
                  @click="nextPhoto"
                  class="w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center pointer-events-auto transition-all shadow-md active:scale-90 border border-white/20"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight class="w-5 h-5" />
                </button>
              </div>

              <!-- Indicators / Dots -->
              <div v-if="totalPhotos > 1" class="absolute top-4 right-4 z-20 flex items-center gap-1.5">
                <button
                  v-for="(_, idx) in galleryPhotos"
                  :key="idx"
                  type="button"
                  @click="currentPhotoIndex = idx"
                  class="h-1.5 rounded-full transition-all duration-300"
                  :class="idx === currentPhotoIndex ? 'w-7 bg-amber-400 shadow-glow' : 'w-1.5 bg-white/50 hover:bg-white'"
                  :aria-label="`Ir a foto ${idx + 1}`"
                />
              </div>
            </div>
          </div>

        </div>

        <!-- 3 Pillars of Excellence -->
        <div class="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-fuchsia-200 transition-colors space-y-2">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Gem class="w-5 h-5" />
            </div>
            <h3 class="text-sm font-black text-slate-900">Diseño Exclusivo</h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              Modelos de autor y colecciones de edición limitada pensadas para destacar.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-fuchsia-200 transition-colors space-y-2">
            <div class="w-10 h-10 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center font-bold">
              <Award class="w-5 h-5" />
            </div>
            <h3 class="text-sm font-black text-slate-900">Calidad Superior</h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              Selección exhaustiva de cueros legítimos, linos y acabados artesanales impecables.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-fuchsia-200 transition-colors space-y-2">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <HeartHandshake class="w-5 h-5" />
            </div>
            <h3 class="text-sm font-black text-slate-900">Atención VIP</h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              Acompañamiento personalizado directo para ayudarte a elegir tu talla y estilo ideal.
            </p>
          </div>
        </div>

        <!-- Contact & Location Card -->
        <div class="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div class="space-y-2">
            <div class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin class="w-4 h-4" />
              <span>Visítanos & Contáctanos</span>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-white">
              {{ storeStore.store?.address || 'Showroom Oficial' }} - {{ storeStore.store?.city || 'Colombia' }}
            </h3>
            <p v-if="storeStore.store?.business_hours" class="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ storeStore.store.business_hours }}</span>
            </p>
          </div>

          <button
            type="button"
            @click="openWhatsApp"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-glow transition-all active:scale-95 shrink-0"
          >
            <MessageCircle class="w-4 h-4" />
            <span>Hablar por WhatsApp</span>
          </button>
        </div>

      </section>

    </main>

    <!-- Footer -->
    <StoreFooter />

    <!-- Modals & Drawers -->
    <CartDrawer @checkout="isCheckoutOpen = true" />
    <CheckoutModal v-if="isCheckoutOpen" @close="isCheckoutOpen = false" />
  </div>
</template>
