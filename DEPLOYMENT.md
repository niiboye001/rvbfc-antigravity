# Deployment Guide

This project is configured for deployment using **Expo Application Services (EAS)**.

## Prerequisites

1.  **EAS CLI**: Ensure you have the EAS CLI installed.
    ```bash
    npm install -g eas-cli
    ```
2.  **Expo Login**: Login to your Expo account.
    ```bash
    eas login
    ```

## Build Profiles

The `eas.json` file defines several build profiles for different environments and app variants:

| Profile | Variant | Description |
| :--- | :--- | :--- |
| **development** | Admin | Development build for admin features |
| **development-client** | Client | Development build for client features |
| **preview** | Admin | Internal distribution (Admin) |
| **preview-client** | Client | Internal distribution (Client) |
| **production** | Admin | Production build for Store (Admin) |
| **production-client** | Client | Production build for Store (Client) |

## Android Deployment

To build an APK for the **Admin** app:
```bash
eas build --profile production --platform android
```

To build an APK for the **Client** app:
```bash
eas build --profile production-client --platform android
```

### Building for Internal Testing (Preview)
To build for internal distribution:
```bash
eas build --profile preview --platform android
```

## Building in Android Studio

If you prefer to build locally using Android Studio:

1.  **Open Folder**: Open the `/android` folder in Android Studio.
2.  **Wait for Sync**: Let Gradle sync finish. Android Studio will automatically generate your `local.properties` file.

### Building a Release APK (Production)
To get the optimized, release version for sharing:

1.  **Switch Variant**: 
    -   In Android Studio, go to **View -> Tool Windows -> Build Variants**.
    -   Change the **Active Build Variant** for `:app` from `debug` to **`release`**.
2.  **Sync**: Gradle will re-sync for the release configuration.
3.  **Generate APK**:
    -   Go to **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
    -   Android Studio will bundle the JavaScript and compile the production code.
4.  **Locate**: Click "Locate" on the notification to find `app-release.apk`.

> [!TIP]
> This APK is signed with a debug key so it can be installed on any phone for testing, but it cannot be uploaded to the Play Store.

### Switching App Variants (Admin vs. Client)

## iOS Deployment

### Building for Production
```bash
eas build --profile production --platform ios
```

## Web Deployment

To deploy the web version:

1.  Export the project:
    ```bash
    npx expo export
    ```
2.  The output will be in the `dist` directory. You can host this static folder on any provider (Vercel, Netlify, AWS S3, etc.).

## Common Issues

-   **ProjectId Missing**: Ensure `app.config.js` has the correct `extra.eas.projectId`. (Already verified: `75bd7534-1d55-45b5-9870-770280d6a785`)
-   **Credentials**: If this is your first time building, EAS will ask to generate Keystores (Android) and Certificates (iOS). Follow the prompts to generate them.
