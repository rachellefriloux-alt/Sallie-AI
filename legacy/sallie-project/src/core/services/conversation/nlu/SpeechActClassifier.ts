/**
 * Speech Act Classifier
 * Classifies utterances by their communicative function
 */

import { SpeechAct, SpeechActType, SpeechActRecognitionResult, SpeechActIndicator } from '../models/SpeechAct';
import { ConversationContext } from '../models/ConversationContext';

export class SpeechActClassifier {
  /**
   * Classify speech act from text
   */
  public classify(text: string, context: ConversationContext): SpeechActRecognitionResult {
    const indicators = this.findIndicators(text);
    const primaryAct = this.determinePrimaryAct(text, indicators, context);
    const secondaryActs = this.determineSecondaryActs(text, indicators, primaryAct);
    
    return {
      primaryAct,
      secondaryActs,
    };
  }

  /**
   * Find speech act indicators
   */
  private findIndicators(text: string): SpeechActIndicator[] {
    const indicators: SpeechActIndicator[] = [];
    
    // Syntactic indicators
    if (/^(what|who|when|where|why|how|which)/i.test(text)) {
      indicators.push({ type: 'syntactic', marker: 'wh-question', confidence: 0.9 });
    }
    if (/\?$/.test(text.trim())) {
      indicators.push({ type: 'punctuation', marker: 'question_mark', confidence: 0.8 });
    }
    if (/^(please|could you|can you|would you)/i.test(text)) {
      indicators.push({ type: 'syntactic', marker: 'request_form', confidence: 0.85 });
    }
    
    // Lexical indicators
    const performativeVerbs = {
      'promise': SpeechActType.PROMISE,
      'offer': SpeechActType.OFFER,
      'suggest': SpeechActType.SUGGESTION,
      'recommend': SpeechActType.ADVICE,
      'warn': SpeechActType.WARNING,
      'apologize': SpeechActType.APOLOGY,
      'sorry': SpeechActType.APOLOGY,
      'thanks': SpeechActType.THANKS,
      'thank': SpeechActType.THANKS,
    };
    
    for (const [verb, actType] of Object.entries(performativeVerbs)) {
      if (new RegExp(`\\b${verb}\\b`, 'i').test(text)) {
        indicators.push({ type: 'lexical', marker: verb, confidence: 0.8 });
      }
    }
    
    // Modal verbs
    if (/\b(should|must|have to|need to)\b/i.test(text)) {
      indicators.push({ type: 'lexical', marker: 'modal_obligation', confidence: 0.7 });
    }
    if (/\b(could|might|may|can)\b/i.test(text)) {
      indicators.push({ type: 'lexical', marker: 'modal_possibility', confidence: 0.6 });
    }
    
    return indicators;
  }

  /**
   * Determine primary speech act
   */
  private determinePrimaryAct(
    text: string,
    indicators: SpeechActIndicator[],
    context: ConversationContext
  ): SpeechAct {
    // Check for explicit indicators first
    const whQuestion = indicators.find(i => i.marker === 'wh-question');
    if (whQuestion) {
      return this.createSpeechAct(SpeechActType.WH_QUESTION, 0.9, indicators, true);
    }
    
    const questionMark = indicators.find(i => i.marker === 'question_mark');
    if (questionMark && !whQuestion) {
      return this.createSpeechAct(SpeechActType.YES_NO_QUESTION, 0.85, indicators, true);
    }
    
    const request = indicators.find(i => i.marker === 'request_form');
    if (request) {
      return this.createSpeechAct(SpeechActType.REQUEST, 0.85, indicators, true);
    }
    
    // Check for greeting/farewell
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/i.test(text)) {
      return this.createSpeechAct(SpeechActType.GREETING, 0.95, indicators, true);
    }
    if (/^(bye|goodbye|see you|talk to you later|gotta go)/i.test(text)) {
      return this.createSpeechAct(SpeechActType.FAREWELL, 0.95, indicators, true);
    }
    
    // Check for thanks
    if (/\b(thanks|thank you|appreciate)\b/i.test(text)) {
      return this.createSpeechAct(SpeechActType.THANKS, 0.9, indicators, true);
    }
    
    // Check for apology
    if (/\b(sorry|apologize|my bad|my fault)\b/i.test(text)) {
      return this.createSpeechAct(SpeechActType.APOLOGY, 0.9, indicators, true);
    }
    
    // Check for confirmation/denial
    if (/^(yes|yeah|yep|sure|okay|right)/i.test(text)) {
      return this.createSpeechAct(SpeechActType.CONFIRMATION, 0.85, indicators, true);
    }
    if (/^(no|nope|nah|not really)/i.test(text)) {
      return this.createSpeechAct(SpeechActType.CONFIRMATION, 0.85, indicators, true);
    }
    
    // Check for commands
    if (/^(do|make|set|start|stop|remind|schedule)/i.test(text) && !/\?/.test(text)) {
      return this.createSpeechAct(SpeechActType.DIRECT_COMMAND, 0.75, indicators, false);
    }
    
    // Check for opinions/assertions
    if (/\b(think|believe|feel|seem|appear|probably|maybe)\b/i.test(text)) {
      return this.createSpeechAct(SpeechActType.OPINION, 0.7, indicators, false);
    }
    
    // Default to assertion
    return this.createSpeechAct(SpeechActType.ASSERTION, 0.6, indicators, false);
  }

  /**
   * Determine secondary speech acts
   */
  private determineSecondaryActs(
    text: string,
    indicators: SpeechActIndicator[],
    primaryAct: SpeechAct
  ): SpeechAct[] {
    const secondary: SpeechAct[] = [];
    
    // Questions can also be indirect requests
    if (primaryAct.type === SpeechActType.YES_NO_QUESTION) {
      if (/\b(can you|could you|would you)\b/i.test(text)) {
        secondary.push(this.createSpeechAct(SpeechActType.INDIRECT_COMMAND, 0.7, indicators, false, true));
      }
    }
    
    // Statements can be implicit requests
    if (primaryAct.type === SpeechActType.ASSERTION) {
      if (/\b(need|want|would like|wish)\b/i.test(text)) {
        secondary.push(this.createSpeechAct(SpeechActType.REQUEST, 0.6, indicators, false, true));
      }
    }
    
    return secondary;
  }

  /**
   * Create speech act object
   */
  private createSpeechAct(
    type: SpeechActType,
    confidence: number,
    indicators: SpeechActIndicator[],
    isExplicit: boolean,
    isIndirect = false
  ): SpeechAct {
    return {
      type,
      confidence,
      indicators,
      isExplicit,
      isIndirect,
    };
  }
}
