<template>
  <div v-if="show" class="emotion-overlay">
    <h3>Current Emotional State: {{ emotion }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'EmotionOverlay',
  props: {
    emotion: {
      type: String,
      default: 'calm'
    },
    message: {
      type: String,
      default: 'All clear.'
    },
    show: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>
.emotion-overlay {
  position: fixed;
  top: 24px;
  right: 24px;
  background: #e0e7ff;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 1000;
}
</style>
