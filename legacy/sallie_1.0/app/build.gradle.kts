/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main Android launcher application.
 * Got it, love.
 */

plugins {
    id("com.android.application")
    id("kotlin-android")
}

android {
    namespace = "com.sallie.launcher"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.sallie.launcher"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug { }
    }

    // Product flavors for local-only vs cloud functionality
    flavorDimensions += "connectivity"
    productFlavors {
        create("localOnly") {
            dimension = "connectivity"
            applicationIdSuffix = ".local"
            versionNameSuffix = "-local"
            resValue("string", "app_name", "Sallie Local")
        }
        create("cloud") {
            dimension = "connectivity"
            applicationIdSuffix = ".cloud"
            versionNameSuffix = "-cloud"
            resValue("string", "app_name", "Sallie Cloud")
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }


    kotlinOptions {
        jvmTarget = "17"
    }

    packaging {
        resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" }
    }
}

dependencies {
    // Project modules - core architecture
    implementation(project(":core"))
    implementation(project(":ai"))
    implementation(project(":feature"))
    implementation(project(":components"))
    implementation(project(":ui"))
    implementation(project(":identity"))
    implementation(project(":onboarding"))
    implementation(project(":personaCore"))
    implementation(project(":responseTemplates"))
    implementation(project(":tone"))
    implementation(project(":values"))

    // Compose BOM for version alignment
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.01"))

    // Android core
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")

    // Compose UI
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.1")

    // Cloud flavor specific dependencies
    "cloudImplementation"("com.google.firebase:firebase-firestore-ktx:24.10.0")
    "cloudImplementation"("com.google.firebase:firebase-auth-ktx:22.3.1")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test:1.6.10")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")

    // Debug tools
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}

tasks.withType<Test> { useJUnitPlatform() }