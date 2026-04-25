# 📱 hnChat — تحويل التطبيق إلى Android APK / iOS

تم تجهيز المشروع ليعمل كـ **PWA قابل للتثبيت** فورًا، وأيضًا كتطبيق **Android / iOS أصلي** عبر Capacitor.

---

## ✅ المسار 1 — PWA (الأسهل، يعمل الآن)

التطبيق الآن قابل للتثبيت مباشرة من المتصفح بدون أي build:

### على Android (Chrome):
1. افتح [hnchat.lovable.app](https://hnchat.lovable.app)
2. اضغط قائمة المتصفح ⋮ → **"تثبيت التطبيق"** (أو سيظهر بانر تلقائي).
3. سيظهر أيقونة hnChat على الشاشة الرئيسية ويعمل ملء الشاشة بدون شريط متصفح.

### على iPhone (Safari):
1. افتح الموقع في **Safari** (مهم — لا يعمل من Chrome على iOS).
2. اضغط زر المشاركة 📤 → **"إضافة إلى الشاشة الرئيسية"**.
3. سيظهر التطبيق بأيقونته كاملة الشاشة.

✨ هذا الخيار يكفي لمعظم المستخدمين ولا يحتاج Google Play أو App Store.

---

## 📦 المسار 2 — تطبيق Android أصلي (APK / Play Store)

عندما تريد ملف APK رسميًا أو نشرًا على Google Play.

> ⚠️ هذه الخطوات يجب تنفيذها على جهازك المحلي. Lovable لا تبني APK داخل المعاينة.

### المتطلبات
- [Node.js](https://nodejs.org) ≥ 18 و [Bun](https://bun.sh)
- [Android Studio](https://developer.android.com/studio) (يثبت Android SDK تلقائيًا)
- JDK 17 (يأتي مع Android Studio)

### خطوات البناء

```bash
# 1) استنساخ المشروع من Lovable (Connect to GitHub أولًا)
git clone <your-repo-url>
cd <project>

# 2) تثبيت الاعتمادات
bun install

# 3) تثبيت Capacitor
bun add @capacitor/core @capacitor/cli @capacitor/android
bun add -d @capacitor/cli

# 4) بناء الواجهة
bun run build

# 5) إضافة منصة Android (مرة واحدة فقط)
npx cap add android

# 6) مزامنة الملفات
npx cap sync android

# 7) فتح في Android Studio
npx cap open android
```

### في Android Studio:
1. انتظر حتى ينتهي Gradle sync.
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. ستجد ملف APK في: `android/app/build/outputs/apk/debug/app-debug.apk`.
4. للنشر على Play Store: **Build → Generate Signed Bundle / APK → Android App Bundle**.

### تحديث التطبيق بعد تعديل الكود:
```bash
bun run build && npx cap sync android
```

---

## 🍎 المسار 3 — تطبيق iOS أصلي (App Store)

> ⚠️ يحتاج جهاز **macOS** + **Xcode** + حساب Apple Developer ($99/سنة).

```bash
bun add @capacitor/ios
bun run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

في Xcode: **Product → Archive → Distribute App**.

---

## 🔌 إضافات مفيدة (اختيارية)

```bash
bun add @capacitor/push-notifications  # إشعارات
bun add @capacitor/camera              # كاميرا للقصص
bun add @capacitor/haptics             # اهتزاز ناعم
bun add @capacitor/share               # مشاركة أصلية
bun add @capacitor/status-bar          # شريط الحالة
bun add @capacitor/splash-screen       # شاشة البداية
```

بعد التثبيت: `npx cap sync` ثم `npx cap open android`.

---

## 🐛 استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| الشاشة بيضاء بعد البناء | تأكد من `webDir: "dist"` في `capacitor.config.ts` |
| `gradlew: permission denied` | `chmod +x android/gradlew` |
| `SDK location not found` | افتح Android Studio مرة → File → Project Structure → SDK |
| التطبيق لا يحدث بعد التعديل | `bun run build && npx cap sync` |

---

## 📂 ملفات Capacitor في المشروع

- `capacitor.config.ts` — إعدادات التطبيق (appId, appName, splash, status bar).
- `android/` — مشروع Android (يُنشأ عند `cap add android`).
- `ios/` — مشروع iOS (يُنشأ عند `cap add ios`).

🎉 **تم!** اختر المسار المناسب لك.
