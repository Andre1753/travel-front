/**
 * src/router/index.ts
 * Configuração centralizada do Vue Router 4 com Strict Types.
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

/**
 * Definição das rotas.
 * Padrão Staff: Usamos nomes (name) para evitar quebrar links se o path mudar no futuro.
 */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    // ROTA DO PERFIL: Registada com segurança
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

/**
 * Navigation Guard (O Guardião de Elite)
 * Verifica o localStorage antes de cada transição de rota.
 */
router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('travel_token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Se tentar entrar no /profile ou /dashboard sem token, chuta para o login
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    // Se já estiver logado, não faz sentido ver a tela de login
    next({ name: 'dashboard' });
  } else {
    // Segue o fluxo normal
    next();
  }
});

export default router;