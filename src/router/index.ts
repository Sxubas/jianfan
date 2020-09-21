import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Learn from '../views/Learn.vue';
import Practice from '../views/Practice.vue';
import About from '../views/About.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
  {
    path: '/learn',
    name: 'Learn',
    component: Learn,
  },
  {
    path: '/practice',
    name: 'Practice',
    component: Practice,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import(/* webpackChunkName: "welcome" */ '../views/Welcome/Welcome.vue'),
  },
  {
    path: '/welcome/characters',
    name: 'Enter Known Characters',
    component: () => import(/* webpackChunkName: "enter-known-characters" */ '../views/Welcome/EnterKnownCharacters.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
