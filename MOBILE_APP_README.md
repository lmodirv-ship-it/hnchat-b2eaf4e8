# hnChat Mobile App (APK / iOS)

## المتطلبات
- Node.js أو Bun
- Android Studio (لبناء APK)
- Xcode على macOS (لبناء iOS)

## خطوات بناء APK

```bash
# 1. استنساخ المشروع وتثبيت التبعيات
bun install

# 2. تثبيت حزم Capacitor
bun add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
bun add @capacitor/camera @capacitor/haptics @capacitor/keyboard
bun add @capacitor/share @capacitor/browser @capacitor/app
bun add @capacitor/network @capacitor/device @capacitor/clipboard
bun add @capacitor/push-notifications @capacitor/local-notifications
bun add @capacitor/status-bar @capacitor/splash-screen
bun add @capacitor/screen-orientation

# 3. بناء المشروع
bun run build

# 4. إضافة منصة Android (أول مرة فقط)
npx cap add android

# 5. إضافة منصة iOS (أول مرة فقط — يحتاج macOS)
npx cap add ios

# 6. مزامنة الملفات
npx cap sync

# 7. فتح Android Studio لبناء APK
npx cap open android

# 8. أو فتح Xcode لبناء iOS
npx cap open ios
```

## إعداد Deep Links (روابط تطبيق)

### Android — App Links
أضف في `android/app/src/main/AndroidManifest.xml`:
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="www.hn-chat.com" />
    <data android:scheme="https" android:host="hn-chat.com" />
</intent-filter>
```

### iOS — Universal Links
أضف في ملف `apple-app-site-association` على الخادم:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["TEAM_ID.com.hnchat.app"],
        "paths": ["*"]
      }
    ]
  }
}
```

## إعداد إشعارات Push

### Firebase (Android)
1. أنشئ مشروع Firebase
2. أضف `google-services.json` إلى `android/app/`
3. فعّل Cloud Messaging

### APNs (iOS)
1. فعّل Push Notifications في Apple Developer
2. أنشئ مفتاح APNs
3. ارفع المفتاح إلى Firebase أو أضفه مباشرة

## النطاق الأساسي
النطاق الأساسي للتطبيق: **https://www.hn-chat.com**

## معرّف التطبيق
- Android: `com.hnchat.app`
- iOS: `com.hnchat.app`

## الأيقونات المطلوبة
ضع الأيقونات في:
- `android/app/src/main/res/` — بأحجام مختلفة (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/` — بالأحجام المطلوبة من Apple

## ملاحظات
- التطبيق يستخدم نفس قاعدة البيانات والتوثيق الموجود في الموقع
- جميع الميزات (الدردشة، الفيديو، المتجر، AI) تعمل بنفس الطريقة
- يدعم الإشعارات، الكاميرا، المشاركة، والاهتزاز
