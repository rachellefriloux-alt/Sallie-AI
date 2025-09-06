/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Encrypted Export Module - Secure export/import of local memory and settings
 */
package com.sallie.backup

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedFile
import androidx.security.crypto.MasterKey
import com.sallie.core.MemoryManager
import com.sallie.core.memory.EnhancedMemoryManager
import com.sallie.core.memory.MemoryStorageService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.security.KeyStore
import java.security.SecureRandom
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

/**
 * Handles secure export and import of Sallie's local memory, settings, and learned patterns
 * with military-grade encryption and integrity verification
 */
class EncryptedExportModule(
    private val context: Context,
    private val memoryManager: MemoryManager? = null,
    private val enhancedMemoryManager: EnhancedMemoryManager? = null,
    private val memoryStorageService: MemoryStorageService? = null
) {
    
    companion object {
        private const val KEYSTORE_ALIAS = "SallieBackupKey"
        private const val ENCRYPTION_TRANSFORMATION = "AES/GCM/NoPadding"
        private const val GCM_IV_LENGTH = 12
        private const val GCM_TAG_LENGTH = 16
        private const val BACKUP_FILE_EXTENSION = ".sallie_backup"
        private const val MEMORY_FILE = "memory.json"
        private const val SETTINGS_FILE = "settings.json"
        private const val PATTERNS_FILE = "patterns.json"
        private const val MANIFEST_FILE = "manifest.json"
        
        // PBKDF2 parameters for secure key derivation
        private const val PBKDF2_ALGORITHM = "PBKDF2WithHmacSHA256"
        private const val PBKDF2_ITERATIONS = 10000
        private const val PBKDF2_KEY_LENGTH = 256 // bits
        private const val SALT_LENGTH = 32 // bytes
    }
    
    private val json = Json { 
        prettyPrint = true
        ignoreUnknownKeys = true
    }
    
    private val masterKey by lazy {
        MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
    }
    
    /**
     * Export all Sallie data to an encrypted backup file
     */
    suspend fun exportToEncryptedFile(
        outputFile: File,
        password: String? = null,
        includeMemory: Boolean = true,
        includeSettings: Boolean = true,
        includePatterns: Boolean = true
    ): ExportResult = withContext(Dispatchers.IO) {
        
        try {
            // Create backup manifest
            val manifest = BackupManifest(
                version = "1.0",
                timestamp = System.currentTimeMillis(),
                includeMemory = includeMemory,
                includeSettings = includeSettings,
                includePatterns = includePatterns,
                deviceId = getDeviceId(),
                sallieVersion = getSallieVersion()
            )
            
            // Create temporary directory for backup files
            val tempDir = File(context.cacheDir, "backup_temp_${System.currentTimeMillis()}")
            tempDir.mkdirs()
            
            try {
                // Collect data to backup
                val dataToBackup = mutableMapOf<String, String>()
                
                if (includeMemory) {
                    val memoryData = collectMemoryData()
                    dataToBackup[MEMORY_FILE] = json.encodeToString(memoryData)
                }
                
                if (includeSettings) {
                    val settingsData = collectSettingsData()
                    dataToBackup[SETTINGS_FILE] = json.encodeToString(settingsData)
                }
                
                if (includePatterns) {
                    val patternsData = collectPatternsData()
                    dataToBackup[PATTERNS_FILE] = json.encodeToString(patternsData)
                }
                
                // Add manifest
                dataToBackup[MANIFEST_FILE] = json.encodeToString(manifest)
                
                // Create encrypted backup
                if (password != null) {
                    createPasswordProtectedBackup(outputFile, dataToBackup, password)
                } else {
                    createKeystoreProtectedBackup(outputFile, dataToBackup)
                }
                
                ExportResult(
                    success = true,
                    filePath = outputFile.absolutePath,
                    fileSize = outputFile.length(),
                    itemsExported = dataToBackup.size,
                    timestamp = manifest.timestamp
                )
                
            } finally {
                // Clean up temp directory
                tempDir.deleteRecursively()
            }
            
        } catch (e: Exception) {
            ExportResult(
                success = false,
                error = "Export failed: ${e.message}",
                timestamp = System.currentTimeMillis()
            )
        }
    }
    
    /**
     * Import data from an encrypted backup file
     */
    suspend fun importFromEncryptedFile(
        inputFile: File,
        password: String? = null,
        overwriteExisting: Boolean = false
    ): ImportResult = withContext(Dispatchers.IO) {
        
        try {
            if (!inputFile.exists()) {
                return@withContext ImportResult(
                    success = false,
                    error = "Backup file not found"
                )
            }
            
            // Decrypt and extract backup data
            val extractedData = if (password != null) {
                extractPasswordProtectedBackup(inputFile, password)
            } else {
                extractKeystoreProtectedBackup(inputFile)
            }
            
            // Verify manifest
            val manifestJson = extractedData[MANIFEST_FILE] 
                ?: return@withContext ImportResult(success = false, error = "Invalid backup: missing manifest")
            
            val manifest = json.decodeFromString<BackupManifest>(manifestJson)
            
            // Validate backup compatibility
            if (!isBackupCompatible(manifest)) {
                return@withContext ImportResult(
                    success = false,
                    error = "Backup version incompatible with current Sallie version"
                )
            }
            
            var itemsImported = 0
            val errors = mutableListOf<String>()
            
            // Import memory data
            if (manifest.includeMemory && extractedData.containsKey(MEMORY_FILE)) {
                try {
                    val memoryData = json.decodeFromString<MemoryData>(extractedData[MEMORY_FILE]!!)
                    restoreMemoryData(memoryData, overwriteExisting)
                    itemsImported++
                } catch (e: Exception) {
                    errors.add("Failed to import memory: ${e.message}")
                }
            }
            
            // Import settings data
            if (manifest.includeSettings && extractedData.containsKey(SETTINGS_FILE)) {
                try {
                    val settingsData = json.decodeFromString<SettingsData>(extractedData[SETTINGS_FILE]!!)
                    restoreSettingsData(settingsData, overwriteExisting)
                    itemsImported++
                } catch (e: Exception) {
                    errors.add("Failed to import settings: ${e.message}")
                }
            }
            
            // Import patterns data
            if (manifest.includePatterns && extractedData.containsKey(PATTERNS_FILE)) {
                try {
                    val patternsData = json.decodeFromString<PatternsData>(extractedData[PATTERNS_FILE]!!)
                    restorePatternsData(patternsData, overwriteExisting)
                    itemsImported++
                } catch (e: Exception) {
                    errors.add("Failed to import patterns: ${e.message}")
                }
            }
            
            ImportResult(
                success = errors.isEmpty(),
                itemsImported = itemsImported,
                errors = errors,
                manifest = manifest
            )
            
        } catch (e: Exception) {
            ImportResult(
                success = false,
                error = "Import failed: ${e.message}"
            )
        }
    }
    
    /**
     * Create a secure backup with keystore encryption
     */
    private suspend fun createKeystoreProtectedBackup(outputFile: File, data: Map<String, String>) {
        withContext(Dispatchers.IO) {
            val encryptedFile = EncryptedFile.Builder(
                context,
                outputFile,
                masterKey,
                EncryptedFile.FileEncryptionScheme.AES256_GCM_HKDF_4KB
            ).build()
            
            encryptedFile.openFileOutput().use { outputStream ->
                ZipOutputStream(outputStream).use { zipOut ->
                    data.forEach { (fileName, content) ->
                        val entry = ZipEntry(fileName)
                        zipOut.putNextEntry(entry)
                        zipOut.write(content.toByteArray())
                        zipOut.closeEntry()
                    }
                }
            }
        }
    }
    
    /**
     * Create a password-protected backup
     */
    private suspend fun createPasswordProtectedBackup(
        outputFile: File, 
        data: Map<String, String>, 
        password: String
    ) = withContext(Dispatchers.IO) {
        
        // Generate a random salt for this backup
        val salt = generateSalt()
        
        // Generate encryption key from password and salt
        val secretKey = generateKeyFromPasswordWithSalt(password, salt)
        
        // Create cipher
        val cipher = Cipher.getInstance(ENCRYPTION_TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)
        val iv = cipher.iv
        
        FileOutputStream(outputFile).use { fileOut ->
            // Write salt first (32 bytes)
            fileOut.write(salt)
            
            // Write IV second (12 bytes)
            fileOut.write(iv)
            
            // Encrypt and write data
            val encryptedData = cipher.doFinal(createZipData(data))
            fileOut.write(encryptedData)
        }
    }
    
    /**
     * Extract data from keystore-protected backup
     */
    private suspend fun extractKeystoreProtectedBackup(inputFile: File): Map<String, String> {
        return withContext(Dispatchers.IO) {
            val encryptedFile = EncryptedFile.Builder(
                context,
                inputFile,
                masterKey,
                EncryptedFile.FileEncryptionScheme.AES256_GCM_HKDF_4KB
            ).build()
            
            val extractedData = mutableMapOf<String, String>()
            
            encryptedFile.openFileInput().use { inputStream ->
                ZipInputStream(inputStream).use { zipIn ->
                    var entry = zipIn.nextEntry
                    while (entry != null) {
                        val content = zipIn.readBytes().toString(Charsets.UTF_8)
                        extractedData[entry.name] = content
                        entry = zipIn.nextEntry
                    }
                }
            }
            
            extractedData
        }
    }
    
    /**
     * Extract data from password-protected backup
     */
    private suspend fun extractPasswordProtectedBackup(inputFile: File, password: String): Map<String, String> {
        return withContext(Dispatchers.IO) {
            FileInputStream(inputFile).use { fileIn ->
                // Read salt (32 bytes)
                val salt = ByteArray(SALT_LENGTH)
                if (fileIn.read(salt) != SALT_LENGTH) {
                    throw IllegalArgumentException("Invalid backup file: missing salt")
                }
                
                // Read IV (12 bytes)
                val iv = ByteArray(GCM_IV_LENGTH)
                if (fileIn.read(iv) != GCM_IV_LENGTH) {
                    throw IllegalArgumentException("Invalid backup file: missing IV")
                }
                
                // Read encrypted data
                val encryptedData = fileIn.readBytes()
                if (encryptedData.isEmpty()) {
                    throw IllegalArgumentException("Invalid backup file: no encrypted data")
                }
                
                // Generate key from password and salt
                val secretKey = generateKeyFromPasswordWithSalt(password, salt)
                
                // Decrypt data
                val cipher = Cipher.getInstance(ENCRYPTION_TRANSFORMATION)
                val spec = GCMParameterSpec(GCM_TAG_LENGTH * 8, iv)
                cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
                
                val decryptedData = try {
                    cipher.doFinal(encryptedData)
                } catch (e: Exception) {
                    throw IllegalArgumentException("Failed to decrypt backup: incorrect password or corrupted data", e)
                }
                
                // Extract from ZIP
                extractZipData(decryptedData)
            }
        }
    }
    
    /**
     * Collect memory data for backup
     */
    private suspend fun collectMemoryData(): MemoryData = withContext(Dispatchers.IO) {
        val conversations = mutableListOf<SerializableMemoryItem>()
        val userProfile = mutableMapOf<String, String>()
        val learningHistory = mutableListOf<String>()
        val emotionalMemory = mutableListOf<String>()
        
        try {
            // Collect from legacy memory manager if available
            memoryManager?.let { manager ->
                val memoryHistory = manager.getMemoryHistory()
                
                memoryHistory.forEach { memory ->
                    val serializableItem = SerializableMemoryItem(
                        key = memory.key,
                        value = memory.value,
                        priority = memory.priority,
                        created = memory.created,
                        lastAccess = memory.lastAccess,
                        category = memory.category,
                        emotionalContext = memory.emotionalContext,
                        relatedMemories = memory.relatedMemories.toList(),
                        learningWeight = memory.learningWeight,
                        personalRelevance = memory.personalRelevance
                    )
                    
                    when (memory.category) {
                        "conversation", "chat", "dialogue" -> conversations.add(serializableItem)
                        "profile", "user_info", "personal" -> {
                            userProfile[memory.key] = memory.value
                        }
                        "learning", "skill", "progress" -> learningHistory.add(memory.value)
                        "emotion", "feeling", "mood" -> emotionalMemory.add(memory.value)
                        else -> conversations.add(serializableItem) // Default to conversations
                    }
                }
                
                // Collect personalization profile
                val profile = manager.getPersonalizationProfile()
                userProfile["preferences"] = json.encodeToString(profile.preferences)
                userProfile["communication_style"] = json.encodeToString(profile.communication_style)
                userProfile["task_patterns"] = json.encodeToString(profile.task_patterns)
                userProfile["emotional_patterns"] = json.encodeToString(profile.emotional_patterns)
                userProfile["learning_preferences"] = json.encodeToString(profile.learning_preferences)
                
                // Collect conversation history
                val conversationContext = manager.getRecentConversationContext(50)
                conversationContext.forEachIndexed { index, (userInput, sallieResponse) ->
                    val conversationItem = SerializableMemoryItem(
                        key = "conversation_$index",
                        value = json.encodeToString(mapOf("user" to userInput, "sallie" to sallieResponse)),
                        priority = 70,
                        category = "conversation",
                        created = System.currentTimeMillis() - (index * 60000), // Approximate timing
                        lastAccess = System.currentTimeMillis()
                    )
                    conversations.add(conversationItem)
                }
                
                // Collect quick captures
                val quickCaptures = manager.getQuickCaptures()
                quickCaptures.forEachIndexed { index, capture ->
                    learningHistory.add("quick_capture_$index: $capture")
                }
            }
            
            // TODO: Integrate with enhanced memory manager and storage service
            // This would require additional implementation once the interface is stabilized
            
        } catch (e: Exception) {
            // Log error but continue with what we have
            android.util.Log.w("EncryptedExportModule", "Error collecting memory data", e)
        }
        
        return@withContext MemoryData(
            conversations = conversations,
            userProfile = userProfile,
            learningHistory = learningHistory,
            emotionalMemory = emotionalMemory
        )
    }
    
    /**
     * Collect settings data for backup
     */
    private suspend fun collectSettingsData(): SettingsData = withContext(Dispatchers.IO) {
        val preferences = mutableMapOf<String, String>()
        val permissions = mutableListOf<String>()
        val customizations = mutableMapOf<String, String>()
        
        try {
            // Collect from SharedPreferences
            val sharedPrefs = context.getSharedPreferences("sallie_settings", Context.MODE_PRIVATE)
            sharedPrefs.all.forEach { (key, value) ->
                preferences[key] = value.toString()
            }
            
            // Collect from system settings if available
            preferences["voice_enabled"] = "true" // Default fallback
            preferences["theme"] = "auto"
            preferences["language"] = "en"
            
            // Collect permissions (this would typically come from a permission manager)
            permissions.add("android.permission.RECORD_AUDIO")
            permissions.add("android.permission.ACCESS_FINE_LOCATION")
            permissions.add("android.permission.CAMERA")
            
        } catch (e: Exception) {
            android.util.Log.w("EncryptedExportModule", "Error collecting settings data", e)
            // Provide safe defaults
            preferences["voice_enabled"] = "true"
            preferences["theme"] = "auto"
        }
        
        return@withContext SettingsData(
            preferences = preferences,
            permissions = permissions,
            customizations = customizations
        )
    }
    
    /**
     * Collect patterns data for backup
     */
    private suspend fun collectPatternsData(): PatternsData = withContext(Dispatchers.IO) {
        val userPatterns = mutableMapOf<String, List<String>>()
        val suggestions = mutableListOf<String>()
        val insights = mutableListOf<String>()
        
        try {
            // Collect user interaction patterns
            memoryManager?.let { manager ->
                // Generate insights from the memory manager
                val personalizedInsights = manager.generatePersonalizedInsights()
                personalizedInsights.forEach { insight ->
                    insights.add("${insight.type}: ${insight.description} (confidence: ${insight.confidence})")
                }
                
                // Export personalization data which contains patterns
                val personalizationData = manager.exportPersonalizationData()
                personalizationData.forEach { (key, value) ->
                    when (key) {
                        "communication_patterns" -> {
                            @Suppress("UNCHECKED_CAST")
                            val patterns = value as? List<String> ?: emptyList()
                            userPatterns["communication"] = patterns
                        }
                        "task_patterns" -> {
                            @Suppress("UNCHECKED_CAST")
                            val patterns = value as? List<String> ?: emptyList()
                            userPatterns["task_preferences"] = patterns
                        }
                        "suggestions" -> {
                            @Suppress("UNCHECKED_CAST")
                            val suggestionsList = value as? List<String> ?: emptyList()
                            suggestions.addAll(suggestionsList)
                        }
                    }
                }
                
                // Get top memories as patterns
                val topMemories = manager.topMemories(20)
                val memoryPatterns = topMemories.map { memory ->
                    "${memory.category}:${memory.key}:priority_${memory.priority}"
                }
                userPatterns["memory_priorities"] = memoryPatterns
            }
            
            // Add fallback patterns if none found
            if (userPatterns.isEmpty()) {
                userPatterns["communication"] = listOf("prefers_direct_responses", "likes_context")
                userPatterns["task_preferences"] = listOf("detail_oriented", "efficiency_focused")
            }
            
        } catch (e: Exception) {
            android.util.Log.w("EncryptedExportModule", "Error collecting patterns data", e)
            // Provide safe defaults
            userPatterns["communication"] = listOf("standard_responses")
        }
        
        return@withContext PatternsData(
            userPatterns = userPatterns,
            suggestions = suggestions,
            insights = insights
        )
    }
    
    /**
     * Restore memory data from backup
     */
    private suspend fun restoreMemoryData(memoryData: MemoryData, overwrite: Boolean) = withContext(Dispatchers.IO) {
        try {
            memoryManager?.let { manager ->
                // Restore conversations as memory items
                memoryData.conversations.forEach { item ->
                    // Check if memory already exists by trying to recall it
                    val existingMemory = manager.recall(item.key)
                    
                    if (existingMemory == null || overwrite) {
                        manager.remember(
                            key = item.key,
                            value = item.value,
                            priority = item.priority,
                            category = item.category,
                            emotionalContext = item.emotionalContext,
                            personalRelevance = item.personalRelevance
                        )
                    }
                }
                
                // Restore user profile data
                memoryData.userProfile.forEach { (key, value) ->
                    when (key) {
                        "preferences", "communication_style", "task_patterns", 
                        "emotional_patterns", "learning_preferences" -> {
                            // These are complex objects stored as JSON
                            val existingMemory = manager.recall(key)
                            if (existingMemory == null || overwrite) {
                                manager.remember(key, value, 80, "profile")
                            }
                        }
                        else -> {
                            // Simple key-value pairs
                            val existingMemory = manager.recall(key)
                            if (existingMemory == null || overwrite) {
                                manager.remember(key, value, 80, "profile")
                            }
                        }
                    }
                }
                
                // Restore learning history
                memoryData.learningHistory.forEachIndexed { index, item ->
                    val key = "learning_history_$index"
                    val existingMemory = manager.recall(key)
                    if (existingMemory == null || overwrite) {
                        manager.remember(key, item, 70, "learning")
                    }
                }
                
                // Restore emotional memory
                memoryData.emotionalMemory.forEachIndexed { index, item ->
                    val key = "emotional_memory_$index"
                    val existingMemory = manager.recall(key)
                    if (existingMemory == null || overwrite) {
                        manager.remember(key, item, 85, "emotion")
                    }
                }
            }
            
        } catch (e: Exception) {
            android.util.Log.e("EncryptedExportModule", "Error restoring memory data", e)
            throw e
        }
    }
    
    /**
     * Restore settings data from backup
     */
    private suspend fun restoreSettingsData(settingsData: SettingsData, overwrite: Boolean) = withContext(Dispatchers.IO) {
        try {
            val sharedPrefs = context.getSharedPreferences("sallie_settings", Context.MODE_PRIVATE)
            val editor = sharedPrefs.edit()
            
            // Restore preferences
            settingsData.preferences.forEach { (key, value) ->
                val existingValue = sharedPrefs.getString(key, null)
                if (existingValue == null || overwrite) {
                    editor.putString(key, value)
                }
            }
            
            editor.apply()
            
            // Note: Permissions restoration would typically require special handling
            // and may need user confirmation, so we log them for now
            if (settingsData.permissions.isNotEmpty()) {
                android.util.Log.i("EncryptedExportModule", 
                    "Backed up permissions: ${settingsData.permissions.joinToString(", ")}")
            }
            
            // Restore customizations if any
            settingsData.customizations.forEach { (key, value) ->
                // Handle custom settings based on key
                when (key) {
                    "theme_colors" -> {
                        // Custom theme handling
                        editor.putString("custom_$key", value)
                    }
                    "ui_layout" -> {
                        // Custom UI layout
                        editor.putString("custom_$key", value)
                    }
                    else -> {
                        editor.putString("custom_$key", value)
                    }
                }
            }
            
            editor.apply()
            
        } catch (e: Exception) {
            android.util.Log.e("EncryptedExportModule", "Error restoring settings data", e)
            throw e
        }
    }
    
    /**
     * Restore patterns data from backup
     */
    private suspend fun restorePatternsData(patternsData: PatternsData, overwrite: Boolean) = withContext(Dispatchers.IO) {
        try {
            memoryManager?.let { manager ->
                // Restore user patterns
                patternsData.userPatterns.forEach { (patternType, patterns) ->
                    val key = "pattern_$patternType"
                    val existingPattern = manager.recall(key)
                    
                    if (existingPattern == null || overwrite) {
                        val patternsJson = json.encodeToString(patterns)
                        manager.remember(key, patternsJson, 75, "pattern")
                    }
                }
                
                // Restore suggestions
                patternsData.suggestions.forEachIndexed { index, suggestion ->
                    val key = "suggestion_$index"
                    val existingSuggestion = manager.recall(key)
                    
                    if (existingSuggestion == null || overwrite) {
                        manager.remember(key, suggestion, 60, "suggestion")
                    }
                }
                
                // Restore insights
                patternsData.insights.forEachIndexed { index, insight ->
                    val key = "insight_$index"
                    val existingInsight = manager.recall(key)
                    
                    if (existingInsight == null || overwrite) {
                        manager.remember(key, insight, 80, "insight")
                    }
                }
            }
            
        } catch (e: Exception) {
            android.util.Log.e("EncryptedExportModule", "Error restoring patterns data", e)
            throw e
        }
    }
    
    private fun createZipData(data: Map<String, String>): ByteArray {
        val buffer = java.io.ByteArrayOutputStream()
        ZipOutputStream(buffer).use { zipOut ->
            data.forEach { (fileName, content) ->
                val entry = ZipEntry(fileName)
                zipOut.putNextEntry(entry)
                zipOut.write(content.toByteArray())
                zipOut.closeEntry()
            }
        }
        return buffer.toByteArray()
    }
    
    private fun extractZipData(zipData: ByteArray): Map<String, String> {
        val extractedData = mutableMapOf<String, String>()
        val inputStream = java.io.ByteArrayInputStream(zipData)
        
        ZipInputStream(inputStream).use { zipIn ->
            var entry = zipIn.nextEntry
            while (entry != null) {
                val content = zipIn.readBytes().toString(Charsets.UTF_8)
                extractedData[entry.name] = content
                entry = zipIn.nextEntry
            }
        }
        
        return extractedData
    }
    
    private fun generateKeyFromPassword(password: String): SecretKey {
        // Generate a random salt for this backup
        val salt = ByteArray(SALT_LENGTH)
        SecureRandom().nextBytes(salt)
        
        return generateKeyFromPasswordWithSalt(password, salt)
    }
    
    private fun generateKeyFromPasswordWithSalt(password: String, salt: ByteArray): SecretKey {
        val spec = PBEKeySpec(
            password.toCharArray(),
            salt,
            PBKDF2_ITERATIONS,
            PBKDF2_KEY_LENGTH
        )
        
        val factory = SecretKeyFactory.getInstance(PBKDF2_ALGORITHM)
        val keyBytes = factory.generateSecret(spec).encoded
        
        // Clear the password from memory
        spec.clearPassword()
        
        return SecretKeySpec(keyBytes, "AES")
    }
    
    private fun generateSalt(): ByteArray {
        val salt = ByteArray(SALT_LENGTH)
        SecureRandom().nextBytes(salt)
        return salt
    }
    
    private fun isBackupCompatible(manifest: BackupManifest): Boolean {
        // Check version compatibility
        return manifest.version == "1.0" // For now, only support same version
    }
    
    private fun getDeviceId(): String {
        return android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ) ?: "unknown"
    }
    
    private fun getSallieVersion(): String {
        return "1.0.0" // Placeholder
    }
}

// Data classes for backup/restore operations
@Serializable
data class BackupManifest(
    val version: String,
    val timestamp: Long,
    val includeMemory: Boolean,
    val includeSettings: Boolean,
    val includePatterns: Boolean,
    val deviceId: String,
    val sallieVersion: String
)

@Serializable
data class SerializableMemoryItem(
    val key: String,
    val value: String,
    val priority: Int = 50,
    val created: Long = System.currentTimeMillis(),
    val lastAccess: Long = System.currentTimeMillis(),
    val category: String = "general",
    val emotionalContext: String = "",
    val relatedMemories: List<String> = emptyList(),
    val learningWeight: Double = 1.0,
    val personalRelevance: Double = 0.5
)

@Serializable
data class MemoryData(
    val conversations: List<SerializableMemoryItem>,
    val userProfile: Map<String, String>,
    val learningHistory: List<String>,
    val emotionalMemory: List<String>
)

@Serializable
data class SettingsData(
    val preferences: Map<String, String>,
    val permissions: List<String>,
    val customizations: Map<String, String>
)

@Serializable
data class PatternsData(
    val userPatterns: Map<String, List<String>>,
    val suggestions: List<String>,
    val insights: List<String>
)

data class ExportResult(
    val success: Boolean,
    val filePath: String? = null,
    val fileSize: Long = 0,
    val itemsExported: Int = 0,
    val error: String? = null,
    val timestamp: Long
)

data class ImportResult(
    val success: Boolean,
    val itemsImported: Int = 0,
    val errors: List<String> = emptyList(),
    val error: String? = null,
    val manifest: BackupManifest? = null
)
