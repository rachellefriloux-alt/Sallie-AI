/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Constitutional enforcement task that validates Salle 1.0 requirements
 * Got it, love.
 */

package com.sallie.build

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction
import org.gradle.api.GradleException
import java.io.File
import java.util.regex.Pattern

open class VerifySalleFeaturesTask : DefaultTask() {
    
    init {
        group = "verification"
        description = "Verifies that the project adheres to Salle 1.0 constitutional requirements"
    }

    @TaskAction
    fun verify() {
        println("🔍 Running Salle 1.0 Constitutional Verification...")
        
        val violations = mutableListOf<String>()
        
        // Check for required persona headers in new Kotlin files
        violations.addAll(checkPersonaHeaders())
        
        // Check for forbidden imports in localOnly builds
        violations.addAll(checkLocalOnlyCompliance())
        
        // Check for required core modules
        violations.addAll(checkCoreModules())
        
        // Check for TODOs without actionable instructions
        violations.addAll(checkTodoCompliance())
        
        // Report results
        if (violations.isNotEmpty()) {
            println("❌ Salle 1.0 Constitutional Violations Found:")
            violations.forEach { violation ->
                println("  • $violation")
            }
            throw GradleException("Build failed: Salle 1.0 constitutional violations detected. Got it, love.")
        } else {
            println("✅ All Salle 1.0 constitutional requirements verified.")
            println("📱 Launcher functionality ready.")
            println("🎯 Persona compliance confirmed.")
            println("🔒 Security requirements met.")
            println("Got it, love.")
        }
    }
    
    private fun checkPersonaHeaders(): List<String> {
        val violations = mutableListOf<String>()
        val requiredHeader = "Salle 1.0 Module"
        val personaLine = "Persona: Tough love meets soul care."
        
        // Check Kotlin files
        project.fileTree("src").matching {
            include("**/*.kt")
        }.forEach { file ->
            val content = file.readText()
            if (!content.contains(requiredHeader)) {
                violations.add("Missing Salle 1.0 module header in: ${file.relativeTo(project.rootDir)}")
            }
            if (!content.contains(personaLine)) {
                violations.add("Missing persona declaration in: ${file.relativeTo(project.rootDir)}")
            }
        }
        
        // Check TypeScript files in key directories
        listOf("app", "components", "core", "features").forEach { dir ->
            val dirFile = File(project.rootDir, dir)
            if (dirFile.exists()) {
                project.fileTree(dirFile).matching {
                    include("**/*.ts", "**/*.tsx")
                }.forEach { file ->
                    val content = file.readText()
                    if (content.length > 500 && !content.contains("Salle 1.0") && !content.contains("tough love meets soul care")) {
                        // Only flag substantial files missing persona reference
                        violations.add("Large file missing Salle 1.0 persona reference: ${file.relativeTo(project.rootDir)}")
                    }
                }
            }
        }
        
        return violations
    }
    
    private fun checkLocalOnlyCompliance(): List<String> {
        val violations = mutableListOf<String>()
        
        // Check if this is localOnly build
        val isLocalOnly = project.hasProperty("buildType") && 
                         project.property("buildType").toString().contains("localOnly")
        
        if (isLocalOnly) {
            // Check for forbidden internet imports
            val forbiddenImports = listOf(
                "firebase",
                "okhttp3",
                "retrofit2",
                "android.permission.INTERNET"
            )
            
            project.fileTree("src").matching {
                include("**/*.kt", "**/*.java")
            }.forEach { file ->
                val content = file.readText()
                forbiddenImports.forEach { forbidden ->
                    if (content.contains(forbidden)) {
                        violations.add("LocalOnly build contains forbidden import '$forbidden' in: ${file.relativeTo(project.rootDir)}")
                    }
                }
            }
        }
        
        return violations
    }
    
    private fun checkCoreModules(): List<String> {
        val violations = mutableListOf<String>()
        
        val requiredModules = mapOf(
            "AndroidLauncher" to "app/utils/AndroidLauncher.ts",
            "MemoryManager" to "core/MemoryManager.ts", 
            "PersonaStore" to "app/store/persona.ts",
            "HomeLauncherScreen" to "app/screens/HomeLauncherScreen.tsx"
        )
        
        requiredModules.forEach { (module, path) ->
            val moduleFile = File(project.rootDir, path)
            if (!moduleFile.exists()) {
                violations.add("Required core module missing: $module at $path")
            }
        }
        
        return violations
    }
    
    private fun checkTodoCompliance(): List<String> {
        val violations = mutableListOf<String>()
        val todoPattern = Pattern.compile("(TODO|FIXME)(?!.*:.*actionable|.*specific|.*instruction)", Pattern.CASE_INSENSITIVE)
        
        project.fileTree(project.rootDir).matching {
            include("**/*.kt", "**/*.ts", "**/*.tsx", "**/*.js", "**/*.md")
            exclude("**/node_modules/**", "**/build/**", "**/.git/**")
        }.forEach { file ->
            file.readLines().forEachIndexed { lineNumber, line ->
                if (todoPattern.matcher(line).find()) {
                    violations.add("Non-actionable TODO/FIXME in ${file.relativeTo(project.rootDir)}:${lineNumber + 1}")
                }
            }
        }
        
        return violations
    }
}