/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: VoiceTriggerModule - Voice trigger support for God-Mode commands and routines.
 * Got it, love.
 */
package com.sallie.voice

import android.content.Context
import android.speech.SpeechRecognizer
import android.speech.RecognizerIntent
import android.content.Intent
import android.os.Bundle
import android.util.Log
import kotlinx.coroutines.*
import java.util.*
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

object VoiceTriggerModule {
    private const val TAG = "VoiceTriggerModule"
    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false
    private val triggerActions = mutableMapOf<String, TriggerAction>()
    private val coroutineScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var reactContext: ReactContext? = null

    // Sealed class for trigger actions
    sealed class TriggerAction {
        data class Routine(val routineName: String) : TriggerAction()
        data class ThemeSwap(val themeName: String) : TriggerAction()
        object GodMode : TriggerAction()
        data class Custom(val action: () -> Unit) : TriggerAction()
    }

    fun initialize(context: Context, reactContext: ReactContext? = null) {
        this.reactContext = reactContext
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
        speechRecognizer?.setRecognitionListener(object : android.speech.RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                Log.d(TAG, "Ready for speech")
                isListening = true
            }

            override fun onBeginningOfSpeech() {
                Log.d(TAG, "Beginning of speech")
            }

            override fun onRmsChanged(rmsdB: Float) {}

            override fun onBufferReceived(buffer: ByteArray?) {}

            override fun onEndOfSpeech() {
                Log.d(TAG, "End of speech")
                isListening = false
            }

            override fun onError(error: Int) {
                Log.e(TAG, "Speech recognition error: $error")
                isListening = false
                // Auto-restart listening on error
                startListening(context)
            }

            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                matches?.firstOrNull()?.let { processVoiceInput(it) }
                // Continue listening
                startListening(context)
            }

            override fun onPartialResults(partialResults: Bundle?) {}

            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        registerDefaultTriggers()
    }

    fun startListening(context: Context) {
        if (isListening) return

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }

        speechRecognizer?.startListening(intent)
    }

    fun stopListening() {
        speechRecognizer?.stopListening()
        isListening = false
    }

    fun destroy() {
        speechRecognizer?.destroy()
        speechRecognizer = null
        coroutineScope.cancel()
    }

    private fun processVoiceInput(input: String) {
        val lowerInput = input.lowercase()
        Log.d(TAG, "Processing voice input: $lowerInput")

        for ((phrase, action) in triggerActions) {
            if (lowerInput.contains(phrase.lowercase())) {
                executeTrigger(action)
                return
            }
        }

        Log.d(TAG, "No matching trigger found for: $lowerInput")
    }

    private fun executeTrigger(action: TriggerAction) {
        coroutineScope.launch {
            try {
                when (action) {
                    is TriggerAction.Routine -> executeRoutine(action.routineName)
                    is TriggerAction.ThemeSwap -> swapTheme(action.themeName)
                    is TriggerAction.GodMode -> activateGodMode()
                    is TriggerAction.Custom -> action.action()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error executing trigger", e)
            }
        }
    }

    private fun executeRoutine(routineName: String) {
        Log.d(TAG, "Executing routine: $routineName")

        // Emit event to React Native side
        reactContext?.let { context ->
            val params = Arguments.createMap().apply {
                putString("routineName", routineName)
                putString("trigger", "voice")
            }
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("VoiceTriggerRoutine", params)
        }

        // Fallback: Log for debugging if React context not available
        if (reactContext == null) {
            Log.w(TAG, "ReactContext not available, routine execution logged only")
        }
    }

    private fun swapTheme(themeName: String) {
        Log.d(TAG, "Swapping to theme: $themeName")

        // Emit event to React Native side
        reactContext?.let { context ->
            val params = Arguments.createMap().apply {
                putString("themeName", themeName)
                putString("trigger", "voice")
            }
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("VoiceTriggerTheme", params)
        }

        // Fallback: Log for debugging if React context not available
        if (reactContext == null) {
            Log.w(TAG, "ReactContext not available, theme swap logged only")
        }
    }

    private fun activateGodMode() {
        Log.d(TAG, "Activating God-Mode")

        // Emit event to React Native side
        reactContext?.let { context ->
            val params = Arguments.createMap().apply {
                putBoolean("activated", true)
                putString("trigger", "voice")
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("VoiceTriggerGodMode", params)
        }

        // Fallback: Log for debugging if React context not available
        if (reactContext == null) {
            Log.w(TAG, "ReactContext not available, God-Mode activation logged only")
        }
    }

    fun registerTrigger(phrase: String, action: TriggerAction) {
        triggerActions[phrase] = action
        Log.d(TAG, "Registered trigger: $phrase")
    }

    fun unregisterTrigger(phrase: String) {
        triggerActions.remove(phrase)
        Log.d(TAG, "Unregistered trigger: $phrase")
    }

    private fun registerDefaultTriggers() {
        // God-Mode triggers
        registerTrigger("activate god mode", TriggerAction.GodMode)
        registerTrigger("enter god mode", TriggerAction.GodMode)
        registerTrigger("god mode on", TriggerAction.GodMode)

        // Routine triggers
        registerTrigger("start morning routine", TriggerAction.Routine("morning"))
        registerTrigger("begin evening routine", TriggerAction.Routine("evening"))
        registerTrigger("run workout routine", TriggerAction.Routine("workout"))

        // Theme triggers
        registerTrigger("switch to dark theme", TriggerAction.ThemeSwap("dark"))
        registerTrigger("change to light theme", TriggerAction.ThemeSwap("light"))
        registerTrigger("apply nature theme", TriggerAction.ThemeSwap("nature"))
    }

    fun isListening(): Boolean = isListening
}
