<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
    <nav class="nav">
        <h2 class="title">LPIMS</h2>

        <RouterLink to="/" class="link" :class="{ active: route.name === 'home' }">
            Dashboard
        </RouterLink>

        <RouterLink to="/inventory" class="link" :class="{ active: route.name === 'inventory' }">
            Inventory
        </RouterLink>

        <RouterLink to="/purchase-order" class="link" :class="{ active: route.name === 'purchase-order' }">
            Purchase Order
        </RouterLink>

        <RouterLink to="/sales-order" class="link" :class="{ active: route.name === 'sales-order' }">
            Sales Order
        </RouterLink>

        <RouterLink to="/vendors" class="link" :class="{ active: route.name === 'vendors' }">
            Vendors
        </RouterLink>

        <RouterLink to="/about" class="link" :class="{ active: route.name === 'about' }">
            About
        </RouterLink>
    </nav>
</template>

<style scoped>
.nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px 14px;
}

.title {
    font-size: 18px;
    font-weight: 700;
    margin: 6px 6px 16px;
}

.link {
    display: block;
    padding: 10px 12px;
    border-radius: 10px;
    color: #e5e7eb;
    /* slate-200 */
    text-decoration: none;
    transition: background-color .15s ease;
}

.link:hover {
    background: rgba(255, 255, 255, .08);
}

.link.active {
    background: rgba(255, 255, 255, .14);
    color: #fff;
    font-weight: 600;
}
</style>
