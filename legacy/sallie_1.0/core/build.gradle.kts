/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core data models, memory management, and system state.
 * Got it, love.
 */

plugins {
    kotlin("jvm")
    // Removed application plugin to avoid main class issues
}

dependencies {
    implementation(project(":personaCore"))
    implementation(project(":tone"))
    implementation(project(":values"))
    implementation(project(":responseTemplates"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("junit:junit:4.13.2")
}

kotlin {
    jvmToolchain(17)
}

sourceSets {
    main {
        java.srcDirs("src/main/kotlin")
    }
    test {
        java.srcDirs("src/test/kotlin")
    }
}
