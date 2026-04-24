<template>
  <div class="voice-console">
    <h3>Sallie Voice Console</h3>
    <div>
      <label>Persona:
        <select v-model="selectedPersona">
          <option v-for="persona in personas" :key="persona" :value="persona">{{ persona }}</option>
        </select>
      </label>
      <label>State:
        <select v-model="selectedState">
          <option v-for="state in states" :key="state" :value="state">{{ state }}</option>
        </select>
      </label>
      <label>Message:
        <input v-model="message" type="text" />
      </label>
      <button @click="speak">Speak</button>
    </div>
    <div class="output">
      <p><strong>Output:</strong> {{ output }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoiceConsole',
  data() {
    return {
      personas: ['Mom', 'Girlfriend', 'Friend', 'Creator', 'Dreamer', 'Realist', 'Just Me'],
      states: ['calm', 'encouraging', 'protective', 'direct'],
      selectedPersona: 'Just Me',
      selectedState: 'calm',
      message: '',
      output: ''
    };
  },
  methods: {
    speak() {
      const rendered = `${this.selectedPersona} (${this.selectedState}): ${this.message.trim()}`;
      this.output = rendered;
      if (window.speechSynthesis && rendered) {
        const utterance = new SpeechSynthesisUtterance(rendered);
        speechSynthesis.speak(utterance);
      }
    }
  }
};
</script>

<style scoped>
.voice-console {
  background: #f7f7fa;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 24px;
}
.output {
  margin-top: 16px;
  background: #e0e7ff;
  padding: 12px;
  border-radius: 8px;
}
</style>
