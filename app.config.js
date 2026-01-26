const IS_CLIENT = process.env.EXPO_PUBLIC_APP_VARIANT === 'client';

export default {
    expo: {
        name: IS_CLIENT ? "RVB FC" : "RVB Admin",
        slug: "rvbfc_antigravity",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/client/icon.png",
        scheme: "rvbfcantigravity",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            bundleIdentifier: IS_CLIENT ? "com.rvbfc.client" : "com.rvbfc.admin",
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false
            }
        },
        android: {
            adaptiveIcon: {
                backgroundColor: "#E6F4FE",
                foregroundImage: "./assets/images/client/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png", // Shared background
                monochromeImage: "./assets/images/android-icon-monochrome.png"
            },
            package: IS_CLIENT ? "com.rvbfc.client" : "com.rvbfc.admin",
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false
        },
        web: {
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    "image": "./assets/images/client/splash-icon.png",
                    "imageWidth": 200,
                    "resizeMode": "contain",
                    "backgroundColor": "#ffffff",
                    "dark": {
                        "backgroundColor": "#000000"
                    }
                }
            ]
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true
        },
        extra: {
            eas: {
                projectId: "75bd7534-1d55-45b5-9870-770280d6a785"
            }
        }
    }
};
