<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const isOpen = ref(false)
const route = useRoute()

// Close the drawer on route change (mobile)
watch(() => route.fullPath, () => {
  isOpen.value = false
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') isOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="layout">
    <!-- Top bar only shown on small screens -->
    <header class="topbar">
      <button class="menu-btn" type="button" aria-label="Open sidebar" :aria-expanded="isOpen"
        aria-controls="app-sidebar" @click="isOpen = true">
        <!-- Simple hamburger -->
        <span class="menu-icon" />
      </button>
      <h1 class="app-title">App</h1>
    </header>

    <!-- Overlay (mobile only) -->
    <div class="overlay" v-show="isOpen" @click="isOpen = false" aria-hidden="true" />

    <!-- Sidebar -->
    <aside id="app-sidebar" class="sidebar" :class="{ open: isOpen }">
      <Sidebar />
    </aside>

    <!-- Main content -->
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Base layout */
.layout {
  min-height: 100vh;
  background: var(--app-bg, #f8fafc);
  color: #0f172a;
  /* slate-900 */
}

/* Top bar (visible < 1024px) */
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--topbar-bg, #ffffff);
  border-bottom: 1px solid #e5e7eb;
  /* slate-200 */
}

/* Hide topbar on large screens */
@media (min-width: 1024px) {
  .topbar {
    display: none;
  }
}

.app-title {
  font-size: 16px;
  line-height: 1;
  margin: 0;
}

/* Hamburger button */
.menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  /* slate-200 */
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
}

.menu-btn:focus-visible {
  outline: 2px solid #3b82f6;
  /* blue-500 */
  outline-offset: 2px;
}

.menu-icon {
  position: relative;
  width: 18px;
  height: 2px;
  background: #0f172a;
  display: inline-block;
}

.menu-icon::before,
.menu-icon::after {
  content: "";
  position: absolute;
  left: 0;
  width: 18px;
  height: 2px;
  background: #0f172a;
}

.menu-icon::before {
  top: -6px;
}

.menu-icon::after {
  top: 6px;
}

/* Sidebar: off-canvas by default */
.sidebar {
  position: fixed;
  z-index: 40;
  top: 0;
  bottom: 0;
  left: 0;
  width: 260px;
  overflow: auto;
  background: var(--sidebar-bg, #0f172a);
  /* slate-900 */
  color: #e5e7eb;
  /* slate-200 */
  border-right: 1px solid #1f2937;
  /* slate-800 */

  /* Off-canvas */
  transform: translateX(-100%);
  transition: transform 200ms ease;
  will-change: transform;
}

.sidebar.open {
  transform: translateX(0);
}

/* Overlay for mobile when sidebar is open */
.overlay {
  position: fixed;
  z-index: 35;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(1px);
  transition: opacity 200ms ease;
}

/* Main content */
.main {
  min-width: 0;
  padding: 16px;
}

/* Large screens (>= 1024px): keep fixed sidebar layout */
@media (min-width: 1024px) {
  .sidebar {
    transform: none;
    /* always visible */
  }

  .overlay {
    display: none !important;
    /* not needed on desktop */
  }

  .main {
    margin-left: 260px;
    /* match sidebar width */
    padding: 24px;
  }
}

/* Slightly narrower sidebar on small phones if you want */
@media (max-width: 360px) {
  .sidebar {
    width: 232px;
  }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {

  .sidebar,
  .overlay {
    transition: none;
  }
}
</style>
