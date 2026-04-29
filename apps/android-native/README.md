# apps/android-native/ — Native Android / Kotlin launcher

**Canonical home for:** the native Android launcher app (separate from the
Expo mobile shell — this is the Kotlin/Compose launcher per `before/`'s
original vision).

**Current implementation:** lives at the repo root (`android/`,
`build.gradle.kts`, `settings.gradle.kts`, `buildSrc/`, `gradle/`).
Migration into this folder happens phase-by-phase.

### Sources to merge here
| Source                              | What to take                                  |
|-------------------------------------|-----------------------------------------------|
| Root `android/`, `*.gradle.kts`     | Existing host Kotlin app                      |
| `legacy/before/android/`            | 1,200+ Kotlin launcher modules                |
| `legacy/sallie_1.0/app/`            | Earlier Vue+Kotlin Android implementation     |

### Build (today)
Use the existing root Gradle: `./gradlew :app:assembleDebug`.
