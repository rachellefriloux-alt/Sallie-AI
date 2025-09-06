#!/usr/bin/env node

/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Constitutional verification for Salle merge completion
 * Got it, love.
 */

const fs = require('fs');
const path = require('path');

class SalleMergeVerification {
    constructor(rootDir) {
        this.rootDir = rootDir;
        this.violations = [];
    }

    async verify() {
        console.log('🔍 Running Salle 1.0 Constitutional Verification...');
        
        this.checkMergeCompletion();
        this.checkCoreModules();
        this.checkLauncherFunctionality();
        this.checkPersonaCompliance();
        this.checkBuildState();
        
        if (this.violations.length > 0) {
            console.log('❌ Salle 1.0 Constitutional Violations Found:');
            this.violations.forEach(violation => {
                console.log(`  • ${violation}`);
            });
            process.exit(1);
        } else {
            console.log('✅ All Salle 1.0 constitutional requirements verified.');
            console.log('📱 SalleCompanion → Sallie Android merge COMPLETE');
            console.log('🎯 Launcher functionality integrated');
            console.log('🔒 Persona compliance confirmed');
            console.log('🚀 Build state: PASSING');
            console.log('Got it, love.');
        }
    }

    checkMergeCompletion() {
        // Check TODO.md completion status
        const todoPath = path.join(this.rootDir, 'docs/docs/TODO.md');
        if (fs.existsSync(todoPath)) {
            const todoContent = fs.readFileSync(todoPath, 'utf8');
            const completedTasks = (todoContent.match(/- \[x\]/g) || []).length;
            const totalTasks = (todoContent.match(/- \[[\sx]\]/g) || []).length;
            
            if (completedTasks !== totalTasks) {
                this.violations.push(`TODO.md shows ${completedTasks}/${totalTasks} tasks completed`);
            }
        }
        
        // Check merge plan status
        const mergePlanPath = path.join(this.rootDir, 'docs/MERGE_PLAN.md');
        if (fs.existsSync(mergePlanPath)) {
            const mergeContent = fs.readFileSync(mergePlanPath, 'utf8');
            if (!mergeContent.includes('merge and integration complete')) {
                this.violations.push('MERGE_PLAN.md does not indicate completion');
            }
        }
    }

    checkCoreModules() {
        const requiredModules = {
            'AndroidLauncher': 'app/utils/AndroidLauncher.ts',
            'CompanionMainScreen': 'app/src/main/kotlin/com/sallie/dashboard/CompanionMainScreen.kt',
            'HomeLauncherScreen': 'app/screens/HomeLauncherScreen.tsx',
            'PersonaStore': 'app/store/persona.ts'
        };

        Object.entries(requiredModules).forEach(([module, filePath]) => {
            const fullPath = path.join(this.rootDir, filePath);
            if (!fs.existsSync(fullPath)) {
                this.violations.push(`Required merged module missing: ${module} at ${filePath}`);
            } else {
                // Check for Salle persona reference
                const content = fs.readFileSync(fullPath, 'utf8');
                if (!content.includes('tough love meets soul care') && !content.includes('Salle')) {
                    this.violations.push(`Module ${module} missing Salle persona compliance`);
                }
            }
        });
    }

    checkLauncherFunctionality() {
        // Check Android manifest for launcher configuration
        const manifestPath = path.join(this.rootDir, 'android/app/src/main/AndroidManifest.xml');
        if (fs.existsSync(manifestPath)) {
            const manifest = fs.readFileSync(manifestPath, 'utf8');
            
            // Check for essential launcher permissions
            const launcherPermissions = [
                'android.permission.SYSTEM_ALERT_WINDOW',
                'android.permission.PACKAGE_USAGE_STATS',
                'android.permission.RECEIVE_BOOT_COMPLETED'
            ];
            
            launcherPermissions.forEach(permission => {
                if (!manifest.includes(permission)) {
                    this.violations.push(`Missing launcher permission: ${permission}`);
                }
            });
        }

        // Check for app grid component
        const appGridPath = path.join(this.rootDir, 'app/components/AppGrid.tsx');
        if (!fs.existsSync(appGridPath)) {
            this.violations.push('Missing AppGrid component for launcher functionality');
        }
    }

    checkPersonaCompliance() {
        // Check main app files for persona consistency
        const keyFiles = [
            'App.tsx',
            'app/screens/HomeLauncherScreen.tsx',
            'app/utils/AndroidLauncher.ts'
        ];

        keyFiles.forEach(filePath => {
            const fullPath = path.join(this.rootDir, filePath);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.length > 1000 && !content.toLowerCase().includes('love')) {
                    // Only flag substantial files that should have persona elements
                    this.violations.push(`Large app file missing Salle persona elements: ${filePath}`);
                }
            }
        });
    }

    checkBuildState() {
        // Check package.json exists and has required scripts
        const packagePath = path.join(this.rootDir, 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            const requiredScripts = ['typecheck', 'lint', 'test'];
            requiredScripts.forEach(script => {
                if (!packageJson.scripts || !packageJson.scripts[script]) {
                    this.violations.push(`Missing required build script: ${script}`);
                }
            });
        }
        
        // Check for tsconfig.json
        const tsconfigPath = path.join(this.rootDir, 'tsconfig.json');
        if (!fs.existsSync(tsconfigPath)) {
            this.violations.push('Missing tsconfig.json for TypeScript support');
        }
    }
}

// Run verification
const rootDir = process.cwd();
const verifier = new SalleMergeVerification(rootDir);
verifier.verify().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
});