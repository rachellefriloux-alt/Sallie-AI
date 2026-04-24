module.exports = {
  packagerConfig: {
    osxSign: {
      identity: 'Developer ID Application: Your Name',
      'hardened-runtime': true,
      entitlements: 'entitlements.plist',
      'entitlements-inherit': 'entitlements.plist',
      'signature-flags': 'library'
    },
    osxNotarize: {
      appleId: 'your-email@example.com',
      appleIdPassword: '@keychain:APPLE_ID_PASSWORD'
    }
  },
  rebuildConfig: {
    rebuildModulePath: '<<REBUILD_MODULE_PATH>>'
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'SallieStudio',
        authors: 'Sallie',
        description: 'Your AI Companion',
        setupIcon: 'assets/icon.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'sallie-studio',
          productName: 'Sallie Studio',
          genericName: 'AI Companion',
          description: 'Your AI companion with Southern wisdom',
          maintainer: 'Your Name <your-email@example.com>',
          homepage: 'https://sallie.live',
          categories: ['Utility', 'Education']
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          name: 'sallie-studio',
          productName: 'Sallie Studio',
          description: 'Your AI companion with Southern wisdom',
          maintainer: 'Your Name <your-email@example.com>',
          homepage: 'https://sallie.live',
          categories: ['Utility', 'Education']
        }
      }
    }
  ],
  plugins: [
    [
      '@electron-forge/plugin-auto-unpack-natives',
      {
        config: {}
      }
    ]
  ]
};
