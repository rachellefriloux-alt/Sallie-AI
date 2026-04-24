<template>
  <div class="task-panel">
    <h3>Task Panel</h3>
    <ul>
      <li v-for="task in tasks" :key="task.id">
        <span>{{ task.title }}</span>
        <span v-if="task.completed" class="done">✔</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TaskPanel',
  props: {
    tasks: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style scoped>
.task-panel {
  background: #f7f7fa;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.done {
  color: #22c55e;
  margin-left: 8px;
}
</style>
