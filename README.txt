ZIYOKOR — ADMIN PANEL YANGILANISHI

1. Avval ziyokor papkasining va ziyokor.db faylining zaxira nusxasini oling.
2. ZIP ichidagi server.js va database.js ni mavjud ziyokor papkasiga ko'chiring (eskilarini almashtiring).
3. ZIP ichidagi public/admin.html ni mavjud ziyokor/public/admin.html bilan almashtiring.
4. Boshqa fayllarni, ayniqsa index.html, style.css, script.js, admin-login.html, .env va ziyokor.db ni O'CHIRMANG.
5. .env faylida SESSION_SECRET (kamida 32 belgili, haqiqiy maxfiy qiymat) borligini tekshiring.
6. Terminalda ziyokor papkasiga o'tib: npm install
7. Serverni Ctrl+C bilan to'xtatib: node server.js
8. Brauzer: http://localhost:4001/admin-login.html
9. Admin sifatida kiring, keyin /admin.html ni oching.
10. To'lovlar bo'limida oyni tanlang va "Oylik hisoblarni yaratish" ni bosing. Keyin to'lov kiritishingiz mumkin.

ESLATMA:
- Bu lokal kompyuterda sinov uchun. Ommaviy internetga hozircha joylamang.
- express-session standart MemoryStore production uchun emas; doimiy sessiya saqlash, HTTPS, CSRF himoyasi, to'liq audit, zaxiralash va testlar zarur.
- Admin login paroli avval admins jadvalida yaratilgan bo'lishi kerak.
- Oylik hisob yaratilgandan keyin o'quvchining oylik narxi o'zgarsa, avvalgi hisob o'zgarmaydi.
- O'quvchini "Faol emas" qilish keyingi oylik hisoblarni yaratishda uni chetlab o'tadi.
- O'chirilgan arizani qaytarib bo'lmaydi; ehtiyot bo'ling.
