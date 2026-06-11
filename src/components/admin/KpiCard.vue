<!-- src/components/admin/KpiCard.vue -->
<template>
  <div class="kpi-card" :class="{ 'kpi-card-sm': small }">
    <div class="kpi-icon" :style="{ background: iconBg }">
      <q-icon :name="icon" size="24px" :color="iconColor" />
    </div>
    <div class="kpi-info">
      <div class="kpi-label">{{ label }}</div>
      <div class="kpi-value">{{ formatValue(value) }}</div>
      <div v-if="subtitle" class="kpi-subtitle">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: number | string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
  subtitle?: string;
  format?: 'number' | 'currency' | 'percent';
  small?: boolean;
}>();

const formatValue = (val: number | string): string => {
  if (typeof val === 'string') return val;

  if (props.format === 'currency') {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(val);
  }
  if (props.format === 'percent') {
    return `${val}%`;
  }
  return new Intl.NumberFormat('pt-PT').format(val);
};
</script>

<style scoped lang="scss">
.kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .kpi-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(102, 126, 234, 0.1);
  }

  .kpi-info {
    flex: 1;

    .kpi-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .kpi-value {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .kpi-subtitle {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
    }
  }

  &.kpi-card-sm {
    padding: 12px;

    .kpi-icon {
      width: 40px;
      height: 40px;

      .q-icon {
        font-size: 20px !important;
      }
    }

    .kpi-value {
      font-size: 18px;
    }
  }
}
</style>
