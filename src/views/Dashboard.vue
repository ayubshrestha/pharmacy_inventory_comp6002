<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type InventoryItem = {
    id: string
    sku: string
    name: string
    category: string
    unit: string
    qty: number
    reorderLevel: number
    expiresOn: string | null // ISO date
    location: string
    updatedAt: string        // ISO date
}

type Txn = {
    id: string
    sku: string
    name: string
    type: 'IN' | 'OUT' | 'ADJUST'
    qty: number
    at: string              // ISO date
    by: string
    notes?: string
}

const items = ref<InventoryItem[]>([])
const txns = ref<Txn[]>([])
const loading = ref(true)
const errorMsg = ref<string | null>(null)
const search = ref('')
const pollMs = 30000 // 30s polling for "live" feel
let timer: number | undefined

// --- Helpers ---
function daysUntil(dateISO: string | null): number | null {
    if (!dateISO) return null
    const today = new Date()
    const d = new Date(dateISO)
    const diff = d.getTime() - today.setHours(0, 0, 0, 0)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
function fmtDate(iso?: string) {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString()
}
function safePct(n: number, d: number) {
    if (!d) return 0
    return Math.max(0, Math.min(100, Math.round((n / d) * 100)))
}

// --- Fetchers (replace with your backend) ---
async function fetchInventory() {
    // Example: swap these with real API calls
    // const res = await fetch('/api/inventory')
    // items.value = await res.json()

    // Mocked data for now
    items.value = [
        { id: '1', sku: 'AMOX500', name: 'Amoxicillin 500mg', category: 'Antibiotic', unit: 'capsule', qty: 180, reorderLevel: 200, expiresOn: '2025-09-10', location: 'A1', updatedAt: new Date().toISOString() },
        { id: '2', sku: 'PARA500', name: 'Paracetamol 500mg', category: 'Analgesic', unit: 'tablet', qty: 40, reorderLevel: 100, expiresOn: '2025-08-28', location: 'B2', updatedAt: new Date().toISOString() },
        { id: '3', sku: 'IBU200', name: 'Ibuprofen 200mg', category: 'NSAID', unit: 'tablet', qty: 0, reorderLevel: 60, expiresOn: '2026-01-05', location: 'B3', updatedAt: new Date().toISOString() },
        { id: '4', sku: 'INSULIN-H', name: 'Insulin (Human)', category: 'Endocrine', unit: 'vial', qty: 22, reorderLevel: 30, expiresOn: '2025-09-01', location: 'Cold-1', updatedAt: new Date().toISOString() },
        { id: '5', sku: 'OMEP20', name: 'Omeprazole 20mg', category: 'GI', unit: 'capsule', qty: 320, reorderLevel: 120, expiresOn: '2026-07-10', location: 'C1', updatedAt: new Date().toISOString() },
        { id: '6', sku: 'METF500', name: 'Metformin 500mg', category: 'Endocrine', unit: 'tablet', qty: 88, reorderLevel: 150, expiresOn: '2025-09-20', location: 'A3', updatedAt: new Date().toISOString() },
    ]
}

async function fetchTransactions() {
    // const res = await fetch('/api/transactions?limit=15')
    // txns.value = await res.json()

    txns.value = [
        { id: 't1', sku: 'PARA500', name: 'Paracetamol 500mg', type: 'OUT', qty: 20, at: new Date(Date.now() - 3600_000).toISOString(), by: 'Dispense-01' },
        { id: 't2', sku: 'AMOX500', name: 'Amoxicillin 500mg', type: 'IN', qty: 100, at: new Date(Date.now() - 2 * 3600_000).toISOString(), by: 'Supplier ASN' },
        { id: 't3', sku: 'IBU200', name: 'Ibuprofen 200mg', type: 'ADJUST', qty: -10, at: new Date(Date.now() - 3 * 3600_000).toISOString(), by: 'Cycle Count' },
        { id: 't4', sku: 'INSULIN-H', name: 'Insulin (Human)', type: 'OUT', qty: 3, at: new Date(Date.now() - 5 * 3600_000).toISOString(), by: 'Dispense-02' },
        { id: 't5', sku: 'METF500', name: 'Metformin 500mg', type: 'OUT', qty: 12, at: new Date(Date.now() - 7 * 3600_000).toISOString(), by: 'Dispense-04' },
    ]
}

async function loadAll() {
    loading.value = true
    errorMsg.value = null
    try {
        await Promise.all([fetchInventory(), fetchTransactions()])
    } catch (e: any) {
        errorMsg.value = e?.message ?? 'Failed to load data'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadAll()
    timer = window.setInterval(loadAll, pollMs)
})
onBeforeUnmount(() => {
    if (timer) window.clearInterval(timer)
})

// --- Computed metrics ---
const filteredItems = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return items.value
    return items.value.filter(i =>
        [i.sku, i.name, i.category, i.location].some(s => s.toLowerCase().includes(q))
    )
})

const totalSkus = computed(() => items.value.length)
const totalUnits = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
const outOfStockCount = computed(() => items.value.filter(i => i.qty <= 0).length)
const lowStockItems = computed(() => items.value.filter(i => i.qty > 0 && i.qty <= i.reorderLevel))
const lowStockCount = computed(() => lowStockItems.value.length)
const expiringSoonItems = computed(() => items.value.filter(i => {
    const d = daysUntil(i.expiresOn)
    return d !== null && d <= 30 && d >= 0
}))
const expiringCount = computed(() => expiringSoonItems.value.length)
</script>

<template>
    <div class="dashboard page">
        <div class="header">
            <h1 class="fw-bold">Dashboard</h1>
            <!-- <div class="actions">
                <el-input v-model="search" placeholder="Search SKU, name, category, location…" clearable
                    class="search" />
                <el-button type="primary" @click="$forceUpdate?.()">Refresh</el-button>
            </div> -->
        </div>

        <el-alert v-if="errorMsg" type="error" :title="errorMsg" show-icon class="mb-3" />

        <!-- KPI cards -->
        <div class="kpis">
            <el-card class="kpi">
                <template #header>SKUs</template>
                <div class="kpi-value">{{ totalSkus }}</div>
                <div class="kpi-sub">Unique items</div>
            </el-card>

            <el-card class="kpi">
                <template #header>Units in Stock</template>
                <div class="kpi-value">{{ totalUnits.toLocaleString() }}</div>
                <div class="kpi-sub">Total on hand</div>
            </el-card>

            <el-card class="kpi warn">
                <template #header>Low Stock</template>
                <div class="kpi-value">{{ lowStockCount }}</div>
                <div class="kpi-sub">At/below reorder</div>
            </el-card>

            <el-card class="kpi danger">
                <template #header>Out of Stock</template>
                <div class="kpi-value">{{ outOfStockCount }}</div>
                <div class="kpi-sub">Requires purchase</div>
            </el-card>

            <el-card class="kpi alert">
                <template #header>Expiring ≤ 30 days</template>
                <div class="kpi-value">{{ expiringCount }}</div>
                <div class="kpi-sub">Rotate stock</div>
            </el-card>
        </div>

        <!-- Responsive content grid -->
        <div class="content-grid">
            <!-- Low stock table -->
            <el-card class="panel">
                <template #header>
                    <div class="panel-header">
                        <span>Low Stock Items</span>
                        <el-tag type="warning">{{ lowStockCount }}</el-tag>
                    </div>
                </template>

                <el-skeleton v-if="loading" :rows="5" animated />

                <el-table v-else :data="lowStockItems" size="small" empty-text="All good! No low stock items.">
                    <el-table-column prop="sku" label="SKU" min-width="110" />
                    <el-table-column prop="name" label="Name" min-width="180" />
                    <el-table-column label="Qty" width="120">
                        <template #default="{ row }">
                            <div class="qty-cell">
                                <strong>{{ row.qty }}</strong>
                                <span class="unit">/{{ row.unit }}</span>
                            </div>
                            <el-progress :percentage="safePct(row.qty, Math.max(row.reorderLevel, row.qty))"
                                :stroke-width="8" :text-inside="false" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="reorderLevel" label="Reorder" width="90" />
                    <el-table-column prop="location" label="Loc." width="80" />
                    <el-table-column label="Updated" width="120">
                        <template #default="{ row }">{{ fmtDate(row.updatedAt) }}</template>
                    </el-table-column>
                </el-table>
            </el-card>

            <!-- Expiring soon -->
            <el-card class="panel">
                <template #header>
                    <div class="panel-header">
                        <span>Expiring Soon (≤ 30 days)</span>
                        <el-tag type="danger">{{ expiringCount }}</el-tag>
                    </div>
                </template>

                <el-skeleton v-if="loading" :rows="4" animated />

                <el-table v-else :data="expiringSoonItems" size="small"
                    empty-text="No items expiring in the next 30 days.">
                    <el-table-column prop="sku" label="SKU" min-width="110" />
                    <el-table-column prop="name" label="Name" min-width="160" />
                    <el-table-column label="Expires" width="120">
                        <template #default="{ row }">
                            <el-tag :type="(daysUntil(row.expiresOn) ?? 999) <= 7 ? 'danger' : 'warning'">
                                {{ fmtDate(row.expiresOn!) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="qty" label="Qty" width="80" />
                    <el-table-column prop="location" label="Loc." width="80" />
                </el-table>
            </el-card>

            <!-- Recent transactions -->
            <el-card class="panel">
                <template #header>
                    <div class="panel-header">
                        <span>Recent Movements</span>
                        <el-tag>{{ txns.length }}</el-tag>
                    </div>
                </template>

                <el-skeleton v-if="loading" :rows="4" animated />

                <el-table v-else :data="txns" size="small" empty-text="No recent activity.">
                    <el-table-column prop="type" label="Type" width="100">
                        <template #default="{ row }">
                            <el-tag :type="row.type === 'IN' ? 'success' : row.type === 'OUT' ? 'info' : 'warning'"
                                effect="light">
                                {{ row.type }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="sku" label="SKU" min-width="110" />
                    <el-table-column prop="name" label="Name" min-width="160" />
                    <el-table-column prop="qty" label="Qty" width="80" />
                    <el-table-column label="When" width="140">
                        <template #default="{ row }">{{ fmtDate(row.at) }}</template>
                    </el-table-column>
                    <el-table-column prop="by" label="By" min-width="120" />
                </el-table>
            </el-card>
        </div>
    </div>
</template>

<style scoped>
.page h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.2;
}

.header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
}

.actions {
    display: flex;
    gap: 8px;
    width: 100%;
}

.actions .search {
    flex: 1 1 280px;
}

.mb-3 {
    margin-bottom: 12px;
}

/* KPI grid: fully responsive */
.kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin: 16px 0;
}

.kpi {
    --border: #e5e7eb;
    border-radius: 14px;
}

.kpi .el-card__header {
    font-weight: 600;
    border-bottom-color: var(--border);
}

.kpi .kpi-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    margin: 6px 0 2px;
}

.kpi .kpi-sub {
    font-size: 12px;
    color: #6b7280;
    /* slate-500 */
}

.kpi.warn .el-card__header {
    color: #b45309;
}

/* amber-700 */
.kpi.danger .el-card__header {
    color: #b91c1c;
}

/* red-700 */
.kpi.alert .el-card__header {
    color: #065f46;
}

/* emerald-800 */

/* Main content grid: auto-fit → stacks nicely on small screens */
.content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
}

.panel {
    border-radius: 14px;
}

.panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
    font-weight: 600;
}

/* Small adjustments for tiny phones */
@media (max-width: 380px) {
    .kpis {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .content-grid {
        grid-template-columns: 1fr;
    }
}

/* Table helpers */
.qty-cell {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 6px;
}

.unit {
    font-size: 12px;
    color: #6b7280;
}
</style>
