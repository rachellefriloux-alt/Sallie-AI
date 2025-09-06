/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Test encrypted export/import functionality.
 * Got it, love.
 */
package com.sallie.backup

import android.content.Context
import com.sallie.core.MemoryManager
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.test.assertFalse

@RunWith(MockitoJUnitRunner::class)
class EncryptedExportModuleTest {

    @Mock
    private lateinit var mockContext: Context
    
    @Mock
    private lateinit var mockMemoryManager: MemoryManager
    
    private lateinit var encryptedExportModule: EncryptedExportModule
    private lateinit var tempFile: File

    @Before
    fun setUp() {
        encryptedExportModule = EncryptedExportModule(
            context = mockContext,
            memoryManager = mockMemoryManager
        )
        tempFile = File.createTempFile("test_backup", ".sallie_backup")
    }

    @Test
    fun `test password-based key derivation is deterministic with same password and salt`() {
        val password = "test_password_123"
        val module = EncryptedExportModule(mockContext)
        
        // Access private method via reflection for testing
        val method = EncryptedExportModule::class.java.getDeclaredMethod(
            "generateKeyFromPasswordWithSalt", 
            String::class.java, 
            ByteArray::class.java
        )
        method.isAccessible = true
        
        val salt = byteArrayOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                              17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32)
        
        val key1 = method.invoke(module, password, salt)
        val key2 = method.invoke(module, password, salt)
        
        assertEquals(key1.toString(), key2.toString(), "Keys should be identical with same password and salt")
    }

    @Test
    fun `test backup manifest creation`() {
        val manifest = BackupManifest(
            version = "1.0",
            timestamp = System.currentTimeMillis(),
            includeMemory = true,
            includeSettings = true,
            includePatterns = true,
            deviceId = "test_device",
            sallieVersion = "1.0.0"
        )
        
        assertTrue(manifest.includeMemory, "Memory should be included")
        assertTrue(manifest.includeSettings, "Settings should be included")
        assertTrue(manifest.includePatterns, "Patterns should be included")
        assertEquals("1.0", manifest.version, "Version should match")
    }

    @Test
    fun `test memory data serialization`() {
        val memoryItem = SerializableMemoryItem(
            key = "test_key",
            value = "test_value",
            priority = 75,
            category = "test",
            emotionalContext = "positive",
            relatedMemories = listOf("related1", "related2"),
            learningWeight = 1.5,
            personalRelevance = 0.8
        )
        
        val memoryData = MemoryData(
            conversations = listOf(memoryItem),
            userProfile = mapOf("name" to "Test User"),
            learningHistory = listOf("Learned something"),
            emotionalMemory = listOf("Happy moment")
        )
        
        assertEquals(1, memoryData.conversations.size, "Should have one conversation")
        assertEquals("test_key", memoryData.conversations[0].key, "Key should match")
        assertEquals(75, memoryData.conversations[0].priority, "Priority should match")
    }

    @Test
    fun `test export result structure`() {
        val result = ExportResult(
            success = true,
            filePath = "/test/path",
            fileSize = 1024L,
            itemsExported = 5,
            timestamp = System.currentTimeMillis()
        )
        
        assertTrue(result.success, "Export should be successful")
        assertEquals("/test/path", result.filePath, "File path should match")
        assertEquals(1024L, result.fileSize, "File size should match")
        assertEquals(5, result.itemsExported, "Items exported should match")
    }

    @Test
    fun `test import result structure`() {
        val manifest = BackupManifest(
            version = "1.0",
            timestamp = System.currentTimeMillis(),
            includeMemory = true,
            includeSettings = false,
            includePatterns = true,
            deviceId = "test_device",
            sallieVersion = "1.0.0"
        )
        
        val result = ImportResult(
            success = true,
            itemsImported = 3,
            errors = emptyList(),
            manifest = manifest
        )
        
        assertTrue(result.success, "Import should be successful")
        assertEquals(3, result.itemsImported, "Items imported should match")
        assertTrue(result.errors.isEmpty(), "Should have no errors")
        assertEquals("1.0", result.manifest?.version, "Manifest version should match")
    }

    @Test
    fun `test backup compatibility check`() {
        val encryptedExportModule = EncryptedExportModule(mockContext)
        
        // Access private method via reflection
        val method = EncryptedExportModule::class.java.getDeclaredMethod(
            "isBackupCompatible", 
            BackupManifest::class.java
        )
        method.isAccessible = true
        
        val compatibleManifest = BackupManifest(
            version = "1.0",
            timestamp = System.currentTimeMillis(),
            includeMemory = true,
            includeSettings = true,
            includePatterns = true,
            deviceId = "test_device",
            sallieVersion = "1.0.0"
        )
        
        val incompatibleManifest = BackupManifest(
            version = "2.0",
            timestamp = System.currentTimeMillis(),
            includeMemory = true,
            includeSettings = true,
            includePatterns = true,
            deviceId = "test_device",
            sallieVersion = "2.0.0"
        )
        
        val isCompatible = method.invoke(encryptedExportModule, compatibleManifest) as Boolean
        val isIncompatible = method.invoke(encryptedExportModule, incompatibleManifest) as Boolean
        
        assertTrue(isCompatible, "Version 1.0 should be compatible")
        assertFalse(isIncompatible, "Version 2.0 should be incompatible")
    }

    fun tearDown() {
        if (tempFile.exists()) {
            tempFile.delete()
        }
    }
}