# 📧 إعداد البريد (Mail Server) وربط الـ IP

## 1️⃣ سجلات DNS للبريد (لكل نطاق)

استبدل `VPS_IP` بـ IP السيرفار الخاص بك (مثلاً `203.0.113.45`).

### لـ `hnchat.net`:
| النوع | الاسم | القيمة | الأولوية |
|---|---|---|---|
| A | `mail` | `VPS_IP` | — |
| MX | `@` | `mail.hnchat.net` | 10 |
| TXT | `@` | `v=spf1 a mx ip4:VPS_IP ~all` | — |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:admin@hnchat.net` | — |
| PTR (Reverse DNS) | — | اطلب من مزوّد VPS ربط `VPS_IP` → `mail.hnchat.net` | — |

### لـ `hn-chat.com` (نفس النمط):
| النوع | الاسم | القيمة | الأولوية |
|---|---|---|---|
| A | `mail` | `VPS_IP` | — |
| MX | `@` | `mail.hn-chat.com` | 10 |
| TXT | `@` | `v=spf1 a mx ip4:VPS_IP ~all` | — |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:admin@hn-chat.com` | — |

---

## 2️⃣ تثبيت Postfix + Dovecot على VPS (سيرفر بريد كامل)

```bash
sudo apt update
sudo apt install postfix dovecot-core dovecot-imapd opendkim opendkim-tools -y
# اختر: Internet Site → اسم النطاق: hnchat.net

# توليد مفتاح DKIM
sudo mkdir -p /etc/opendkim/keys/hnchat.net
cd /etc/opendkim/keys/hnchat.net
sudo opendkim-genkey -s default -d hnchat.net
sudo cat default.txt
# انسخ القيمة وأضفها كسجل TXT باسم: default._domainkey
```

أضف سجل DKIM في DNS:
| النوع | الاسم | القيمة |
|---|---|---|
| TXT | `default._domainkey` | `v=DKIM1; k=rsa; p=...` (من الملف أعلاه) |

---

## 3️⃣ فتح منافذ البريد في Firewall

```bash
sudo ufw allow 25/tcp     # SMTP
sudo ufw allow 465/tcp    # SMTPS
sudo ufw allow 587/tcp    # Submission
sudo ufw allow 993/tcp    # IMAPS
sudo ufw reload
```

---

## 4️⃣ بديل أسهل: استخدم خدمة بريد جاهزة

بدل إدارة Postfix بنفسك، يمكنك استخدام:
- **Lovable Emails** (مدمج، لا يحتاج إعداد) — للإيميلات التلقائية فقط
- **Mailgun / SendGrid / Resend** — أضف فقط سجلات DNS التي يعطونك إياها

---

## 5️⃣ اختبار البريد

```bash
# أرسل بريد تجريبي
echo "Test from hnChat" | mail -s "Test" you@gmail.com

# تحقق من السجلات
sudo tail -f /var/log/mail.log

# اختبر السمعة
# https://www.mail-tester.com  → أرسل بريد للعنوان الذي يعطونك
```

النتيجة المثالية: **10/10**.
