import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior: 'smooth' };
  },
  routes: [
    // Landing Page / Platform Gateway
    {
      path: '/',
      name: 'home',
      component: () => import('../views/public/LandingView.vue'),
    },

    // Public Storefront (e.g. /tienda/ss-boutique)
    {
      path: '/tienda/:slug',
      name: 'storefront',
      component: () => import('../views/store/StorefrontView.vue'),
      props: true,
    },

    // Dedicated About Us Page (e.g. /tienda/ss-boutique/nosotros)
    {
      path: '/tienda/:slug/nosotros',
      name: 'store-about',
      component: () => import('../views/store/StoreAboutView.vue'),
      props: true,
    },
    {
      path: '/tienda/:slug/about',
      redirect: (to) => `/tienda/${to.params.slug}/nosotros`,
    },

    // Auth Views
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },

    // Merchant Admin Panel
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('../views/admin/ProductsView.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('../views/admin/CategoriesView.vue'),
        },
        {
          path: 'appearance',
          name: 'admin-appearance',
          component: () => import('../views/admin/AppearanceView.vue'),
        },
        {
          path: 'brands',
          name: 'admin-brands',
          component: () => import('../views/admin/BrandsAdminView.vue'),
        },
        {
          path: 'about',
          name: 'admin-about',
          component: () => import('../views/admin/AboutAdminView.vue'),
        },
        {
          path: 'store-info',
          name: 'admin-store-info',
          component: () => import('../views/admin/StoreInfoView.vue'),
        },
        {
          path: 'whatsapp',
          name: 'admin-whatsapp',
          component: () => import('../views/admin/WhatsAppView.vue'),
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('../views/admin/OrdersView.vue'),
        },
      ],
    },

    // Super Admin Panel
    {
      path: '/superadmin',
      name: 'superadmin',
      component: () => import('../views/admin/SuperAdminView.vue'),
      meta: { requiresSuperAdmin: true },
    },

    // Direct slug fallback (e.g. /ss-boutique/nosotros)
    {
      path: '/:slug([a-zA-Z0-9-]+)/nosotros',
      name: 'store-about-direct',
      component: () => import('../views/store/StoreAboutView.vue'),
      props: true,
      beforeEnter: (to, _from, next) => {
        const reserved = ['admin', 'login', 'register', 'superadmin', 'tienda', 'api'];
        if (reserved.includes(to.params.slug as string)) {
          next({ name: 'home' });
        } else {
          next();
        }
      },
    },

    // Direct slug fallback (e.g. /ss-boutique)
    {
      path: '/:slug([a-zA-Z0-9-]+)',
      name: 'storefront-direct',
      component: () => import('../views/store/StorefrontView.vue'),
      props: true,
      beforeEnter: (to, _from, next) => {
        const reserved = ['admin', 'superadmin', 'login', 'register', 'tienda', 'api'];
        if (reserved.includes(to.params.slug as string)) {
          next('/');
        } else {
          next();
        }
      },
    },

    // 404 Catch-All
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/public/NotFoundView.vue'),
    },
  ],
});

// Navigation Guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  if (authStore.isLoading) {
    await authStore.initAuth();
  }

  if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    next('/admin');
    return;
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/admin');
    return;
  }

  next();
});

export default router;
