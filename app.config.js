const IS_CLIENT = process.env.EXPO_PUBLIC_APP_VARIANT === 'client';

export default {
    expo: {
        name: IS_CLIENT ? "RVB FC" : "RVB Admin",
        slug: "rvbfc_antigravity",
        version: "1.0.0",
        orientation: "portrait",
        icon: IS_CLIENT ? "./assets/images/client/icon.png" : "./assets/images/admin/icon.png",
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
                foregroundImage: IS_CLIENT ? "./assets/images/client/android-icon-foreground.png" : "./assets/images/admin/android-icon-foreground.png",
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
                    "image": IS_CLIENT ? "./assets/images/client/splash-icon.png" : "./assets/images/admin/splash-icon.png",
                    "imageWidth": 500,
                    "resizeMode": "contain",
                    "backgroundColor": "#ffffff"
                }
            ]
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true
        },
        extra: {
            eas: {
                projectId: "0212fa99-f2b6-47af-8f3b-e8fac25de2f7"
            }
        }
    }
};
