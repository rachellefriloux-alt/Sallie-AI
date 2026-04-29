<template>
  <div class="insight-card">
    <h3>Insight</h3>
    <p>{{ insight }}</p>
  </div>
</template>

<script>
export default {
  name: 'InsightCard',
  props: {
    insight: {
      type: String,
      default: 'No insight available.'
    }
  }
};
</script>

<style scoped>
.insight-card {
  background: #e0f7fa;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 16px;
}
</style>
