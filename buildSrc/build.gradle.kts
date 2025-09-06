/*
* Salle 1.0 Module
* Persona: Tough love meets soul care.
* Function: BuildSrc configuration for custom Gradle tasks and plugin injection.
* Got it, love.
*/

plugins {
   `kotlin-dsl`
   `groovy-gradle-plugin`
}

repositories {
   gradlePluginPortal()
   google()
   mavenCentral()
}

dependencies {
   implementation("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25")
   implementation("com.android.tools.build:gradle:8.7.3")
   implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
}

kotlin {
   jvmToolchain(17)
}/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: BuildSrc configuration for custom Gradle tasks and plugin injection.
 * Got it, love.
 */

plugins {
    `kotlin-dsl`
    `groovy-gradle-plugin`
}

repositories {
    gradlePluginPortal()
    google()
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25")
    implementation("com.android.tools.build:gradle:8.7.3")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    
    // Test dependencies
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.1")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation(gradleTestKit())
}

kotlin {
    jvmToolchain(17)
}

tasks.test {
    useJUnitPlatform()
}