## المشكلة
عند انتهاء الفيديو يظهر شريط YouTube في الأسفل («Plus de vidéos» + زر YouTube). حاليًا يوجد غطاء فقط لأعلى-يمين المشغّل في `src/routes/_authenticated/watch-yt.$videoId.tsx`.

## الخطة
في نفس الملف، داخل `<Cinematic3DScreen>`، إضافة طبقة سوداء سفلية تغطي شريط النهاية:

```tsx
<div className="absolute bottom-0 right-0 left-0 h-14 bg-black pointer-events-none z-10" aria-hidden />
```

- موضعها أسفل المشغّل بكامل العرض بارتفاع ~56px لتغطية «Plus de vidéos» وزر YouTube.
- `pointer-events-none` حتى لا تعطّل عناصر التحكم بالفيديو (شريط التشغيل يظهر فوقها لأن YouTube iframe يضع controls في طبقة أعلى عند الـ hover، لكن سنتحقق بصريًا بعد التطبيق ونرفع/نخفض الارتفاع إن لزم).
- بالإضافة لذلك تمرير `controls=0` ليس مرغوبًا (يخفي شريط التحكم)، لذا سنبقي الـ params كما هي ونكتفي بالغطاء البصري.

ملف واحد فقط: `src/routes/_authenticated/watch-yt.$videoId.tsx`.
