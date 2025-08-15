import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Dashboard from '@/views/Dashboard.vue'
import Inventory from '@/views/Inventory.vue'
import PurchaseOrder from '@/views/PurchaseOrder.vue'
import SalesOrder from '@/views/SalesOrder.vue'
import Vendors from '@/views/Vendors.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard,
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: Inventory,
    },
    {
      path: '/purchase-order',
      name: 'purchase-order',
      component: PurchaseOrder,
    },
    {
      path: '/sales-order',
      name: 'sales-order',
      component: SalesOrder,
    },
    {
      path: '/vendors',
      name: 'vendors',
      component: Vendors,
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: Inventory,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
