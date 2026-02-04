# Supabase Configuration Guide

To fix the issue where links (Password Resets, User Invites) redirect to `localhost`, you must update your Supabase project settings.

## 1. Login to Supabase
Go to [supabase.com/dashboard](https://supabase.com/dashboard) and select your project.

## 2. Update Authentication Settings
Navigate to: **Authentication** (icon on the left) -> **URL Configuration**.

### Site URL
-   **Current Value**: `http://localhost:3000` (likely)
-   **New Value**: `onenessfc://`
-   *Action*: Change this and click **Save**.

### Redirect URLs
-   **Action**: Click **Add URL**.
-   **Value**: `onenessfc://**`
-   *Action*: Click **Add**, then click **Save**.

## 3. Verify
Send a new "Invite User" email or click "Forgot Password" in the app. The link should now open your app directly.
