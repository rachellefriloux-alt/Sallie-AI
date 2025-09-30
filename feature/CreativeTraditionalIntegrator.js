/*
 * Sallie 1.0 Module: CreativeTraditionalIntegrator
 * Persona: Tough love meets soul care.
 * Purpose: Integrates creative, resourceful, and traditional-modern value perspectives into responses.
 * Privacy: No external network calls; local-only logic
 * Tone: Supportive, insightful, and balanced
 * Got it, love.
 */

const TechnicalIntegrator = require('./src/TechnicalProwessModule');
const CreativeSystem = require('./CreativeSystem');

class CreativeTraditionalIntegrator {
  constructor() {
    this.technicalIntegrator = new TechnicalIntegrator();
    this.creativeSystem = new CreativeSystem();
  }

  /**
   * Determines if a response should be enhanced creatively
   */
  shouldEnhanceCreatively(userMessage, response) {
    const creativeTriggers = [
      'creative', 'resourceful', 'idea', 'innovate', 'brainstorm',
      'tradition', 'modern', 'value', 'change', 'limited', 'constraint', "can't afford", "don't have"
    ];
    return creativeTriggers.some(trigger => userMessage.toLowerCase().includes(trigger));
  }

  /**
   * Enhance a response with creative, resourceful, and balanced value perspectives
   */
  enhanceResponseCreatively(response, userMessage, context = {}) {
    const creativeIdeas = this.creativeSystem.generateCreativeIdeas(userMessage, [], 1);
    
    const isResourceConstrained = [
      'limited', 'constraint', "can't afford", "don't have"
    ].some(trigger => userMessage.toLowerCase().includes(trigger));

    let resourcefulTip = '';
    if (isResourceConstrained) {
      const solution = this.creativeSystem.findResourcefulSolutions(userMessage, [], ['limited resources']);
      resourcefulTip = `\n\nHere's a resourceful approach: ${solution.approach}\nKey step: ${solution.steps[0]}`;
    }

    const hasValuesTension = [
      'tradition', 'modern', 'value', 'change'
    ].some(trigger => userMessage.toLowerCase().includes(trigger));

    let valuesPerspective = '';
    if (hasValuesTension) {
      const balancedView = this.creativeSystem.balanceValues(userMessage);
      valuesPerspective = `\n\nBalanced perspective: ${balancedView.perspective}`;
    }

    return response + resourcefulTip + valuesPerspective;
  }

  /**
   * Process user input with creative, resourceful, and logical enhancements
   */
  processInput(userMessage, context = {}) {
    const enhanced = {
      originalMessage: userMessage,
      creativeEnhancements: [],
      resourcefulSuggestions: [],
      balancedPerspectives: []
    };

    if (this.shouldEnhanceCreatively(userMessage, '')) {
      enhanced.creativeEnhancements = this.creativeSystem.generateCreativeIdeas(userMessage, [], 3);
    }

    return enhanced;
  }
}

module.exports = CreativeTraditionalIntegrator;