
DO $$
DECLARE
  v_uid uuid;
  v_first_names text[] := ARRAY[
    'Jack','Sofia','Adil','Layla','Omar','Emma','Liam','Noah','Olivia','Aisha',
    'Yusuf','Maria','Lucas','Mia','Hassan','Fatima','Mohamed','Sara','Ali','Nour',
    'Ahmed','Karim','Zayd','Ibrahim','Khalid','Hiroshi','Yuki','Sakura','Wei','Lin',
    'Chen','Mei','Raj','Priya','Arjun','Anika','Diego','Carmen','Pablo','Isabella',
    'Mateo','Valentina','Pierre','Camille','Luc','Chloe','Antoine','Manon','Leo','Anna',
    'Hans','Greta','Klaus','Heidi','Otto','Ingrid','Lars','Astrid','Erik','Freya',
    'Mehmet','Elif','Ahmet','Zeynep','Mustafa','Ayse','Burak','Selin','Emre','Defne',
    'Ivan','Olga','Dimitri','Natasha','Sergei','Anastasia','Vladimir','Ekaterina','Mikhail','Tatiana',
    'Kwame','Amara','Kofi','Zola','Tunde','Ngozi','Chidi','Ade','Femi','Ife',
    'Marcus','Henry','Daniel','Grace','James','Lily','William','Ava','Ethan','Madison',
    'Alexander','Charlotte','Benjamin','Amelia','Samuel','Ella','David','Zoe','Carlos','Lucia',
    'Javier','Elena','Miguel','Paula','Andres','Marta','Sergio','Adriana','Giovanni','Giulia',
    'Luca','Martina','Marco','Chiara','Andrea','Francesca','Davide','Park','Min','Jung',
    'Soo','Kim','Hye','Lee','Joon','Choi','Yoon','Tariq','Mariam','Salem',
    'Huda','Bashir','Asma','Rashid','Farah','Tamer','Lina','Rana','Reem','Zaid',
    'Nadia','Hamza','Salma','Bilal','Dina','Wael','Hala','Khaled','Joud','Saif',
    'Lana','Adam','Yara','Malik','Tala','Faris','Mira','Anwar','Nora','Bassel',
    'Maya','Talal','Lara','Nabil','Rima','Ziad','Razan','Idris','Sumaya','Hadi',
    'Jana','Murad','Ranya','Sami','Diana','Tarek','Roaa','Rami','Yasmin','Walid',
    'Habiba','Ammar','Bushra','Zakaria','Marwa','Imad','Hadia','Bao','Linh','Minh',
    'Thuy','Tran','Nguyen','Hoa','Pham','Anh','Stefan','Klara','Rafael','Beatriz',
    'Bruno','Catarina','Tiago','Ines','Joao','Rita','Aleksander','Magdalena','Pawel','Zofia',
    'Tomasz','Hanna','Krzysztof','Julia','Marek','Wiktoria','Niko','Sanna','Jukka','Helmi',
    'Juhani','Aada','Mikko','Iida','Ville','Veera','Aiden','Harper','Logan','Aria',
    'Mason','Scarlett','Caleb','Hazel','Owen','Stella','Theo','Penelope','Felix','Maeve',
    'Silas','Ruby','Atlas','Ivy','Jasper','Wren','Reza','Shirin','Amir','Nasim',
    'Behnam','Roxana','Kian','Nasrin','Pouya','Mateusz','Aleksandra','Krystian','Karolina','Jakub',
    'Natalia','Dawid','Patrycja','Filip','Weronika','Lior','Tamar','Eitan','Noa','Itai',
    'Shira','Yoav','Aviv','Talia','Simba','Jamila','Bakari','Zuri','Chima','Adaeze',
    'Obi','Folake','Sade','Yetunde','Bjorn','Saga','Jonas','Linnea','Magnus','Axel',
    'Ebba','Viktor','Alma','Jorge','Renata','Camila','Eduardo','Mariana','Felipe','Gabriel',
    'Larissa','Augustin','Margaux','Romain','Salome','Nicolas','Oceane','Maxime','Lou','Hugo',
    'Romane','Costas','Eleni','Yannis','Despina','Stavros','Athina','Petros','Alexis','Haruto',
    'Riku','Hina','Sota','Yuna','Asahi','Mio','Kaito','Cheng','Xia','Fang',
    'Hong','Bo','Ling','Tao','Yan','Jian','Xue','Aakash','Pooja','Vikram',
    'Neha','Rohan','Divya','Karan','Kavya','Aditya','Shreya','Ayan','Arham','Hira',
    'Ifra','Usman','Maham','Zain','Aiman','Cesar','Hector','Daniela','Manuel','Veronica',
    'Antonio','Patricia','Cecilia','Pedro','Gloria','Ricardo','Estela','Alvaro','Silvia','Vicente',
    'Alicia','Roberto','Marisol','Hayden','Quinn','Sage','River','Phoenix','Skyler','Rowan',
    'Blake','Cameron','Avery','Drew','Jordan','Morgan','Reese','Taylor','Bailey','Dakota',
    'Eden','Finley','Hadley','Sayid','Jamil','Tareq','Manal','Abdo','Jihan','Mounir',
    'Salwa','Yassin','Inaam','Saeed','Ghada','Adnan','Iman','Ayman','Wafa','Marwan',
    'Souad','Nabeel','Najwa','Amer','Maysoon','Hisham','Joumana','Sufian','Wijdan','Kamel',
    'Saleh','Maysa','Nizar','Rasha','Husam','Areej','Tamim','Mayar','Adib','Sireen',
    'Bahaa','Lamis','Suheil','Tamara','Wesam','Roula','Hatem','Rola','Anas','Joelle',
    'Imran','Hadeel','Fadi','Carla','Fouad','Vivian','Ghassan','Petra','Nael','Lamia',
    'Maged','Suzan','Rabih','Lamya','Sharif','Reema','Tawfik','Maha','Bashar','Salam',
    'Munir','Layan','Adham','Tasneem','Wissam','Sara2','Riad','Bayan','Murad2','Reema2',
    'Tamer2','Lina2','Hadi2','Mira2','Ramy','Yara2','Saif2','Joud2','Faris2','Tala2'
  ];
  v_msgs text[] := ARRAY[
    'مرحبا بالجميع 👋','كيف الحال اليوم؟','الموقع رائع جداً','هل من جديد؟','مساء الخير من المغرب',
    'أهلا من مصر','شكراً على هذا التطبيق الرائع','أحب الدردشة هنا','من أين أنتم؟','صباح الخير ☀️',
    'Hello everyone!','How is everyone doing?','This app is amazing 🔥','Greetings from London','Anyone here from NYC?',
    'Just discovered this platform','Loving the design','Who wants to chat?','Good vibes only ✨','Have a great day!',
    'Bonjour tout le monde','Comment ça va?','Salut depuis Paris','Belle journée à tous','Quelqu''un parle français?',
    'Hola a todos','¿Cómo están?','Saludos desde Madrid','Me encanta esta app','¿Alguien de México?',
    'Merhaba arkadaşlar','Nasılsınız?','İstanbul''dan selamlar','Harika bir uygulama','Sohbet edelim mi?',
    'Привет всем','Как дела?','Из Москвы','Отличное приложение','Кто хочет поговорить?',
    'こんにちは皆さん','元気ですか？','東京から','素晴らしいアプリ','チャットしましょう',
    '大家好','你们好吗？','来自北京','应用很棒','一起聊天吧',
    'नमस्ते सभी','कैसे हो?','दिल्ली से','बहुत अच्छा ऐप','चैट करें?',
    'Hallo zusammen','Wie geht es euch?','Grüße aus Berlin','Tolle App','Lass uns chatten',
    'Ciao a tutti','Come state?','Saluti da Roma','App fantastica','Chattiamo?',
    'Olá pessoal','Tudo bem?','Saudações do Brasil','App maravilhoso','Vamos conversar?',
    '안녕하세요 여러분','잘 지내세요?','서울에서 인사','멋진 앱이에요','채팅해요',
    'Xin chào mọi người','Khỏe không?','Từ Hà Nội','Ứng dụng tuyệt vời','Trò chuyện nhé',
    '🌍 العالم صغير هنا','🚀 منصة المستقبل','💬 أحب التواصل','🌟 تجربة جميلة','❤️ شكراً للجميع',
    'من يحب الكرة؟','أي فيلم شاهدت مؤخراً؟','ما رأيكم بالذكاء الاصطناعي؟','هل تستخدمون ChatGPT؟','أفضل لغة برمجة؟',
    'Best coffee in the world?','Tea or coffee?','Favorite movie this year?','Anyone into AI?','Crypto news today?',
    'يوم سعيد للجميع','تحياتي من الجزائر','من السعودية 🇸🇦','من الإمارات 🇦🇪','من الأردن 🇯🇴',
    'Greetings from Brazil 🇧🇷','From Germany 🇩🇪','Hello from Japan 🇯🇵','From Canada 🇨🇦','Australia here 🇦🇺',
    'موضوع شيق','أتفق معك تماماً','رأي جميل','شاركوا أفكاركم','نقاش رائع',
    'Great point!','Totally agree','Interesting take','Share your thoughts','Awesome discussion',
    'انضممت اليوم وسعيد بالتعرف عليكم','عضو جديد، مرحبا','أول مرة ادخل، الموقع ممتاز','هذي أحلى منصة','واصلوا 👏'
  ];
  v_post_contents text[] := ARRAY[
    'بدأت رحلتي مع البرمجة اليوم 💻 أي نصائح؟',
    'المنصة الجديدة hnChat تجربة مذهلة',
    'الذكاء الاصطناعي يغير كل شيء 🤖',
    'أفضل تطبيق دردشة جربته منذ سنوات',
    'الجو رائع اليوم 🌤️ أين أنتم؟',
    'Just shipped a new feature 🚀',
    'AI is the future, no doubt',
    'Coffee + Code = Happy day ☕',
    'Loving the new design of hnChat',
    'Working remotely has changed my life',
    'Découverte du jour: hnChat ✨','L''IA va transformer notre quotidien','Belle communauté ici 💜',
    'Recién descubrí esta plataforma 🤩','La IA está cambiando todo',
    'Bu uygulama gerçekten harika 👏','Yapay zeka inanılmaz',
    'Невероятная платформа!','AI меняет мир','人工智能改变世界','这个应用太棒了',
    'AI से दुनिया बदल रही है','मुझे यह ऐप बहुत पसंद है',
    'Nuova scoperta: hnChat 🎉','L''intelligenza artificiale è il futuro',
    'Diese App ist genial 🚀','KI ist die Zukunft',
    'Adoro essa plataforma 💚','IA está mudando tudo',
    'مشاركة من المغرب 🇲🇦','تحية من السعودية 🇸🇦','من قلب الإمارات ❤️','يوم منتج 💪','هل جربتم الميزات الجديدة؟',
    'New article published, check it out!','Reading about machine learning today 📚','Best practices for clean code',
    'Tips for productivity 🎯','Building in public is amazing','Just hit 1000 followers, thank you all! 🙏',
    '🔥🔥🔥 hot take: AI > Web3','Sunset vibes 🌅','Morning routine sets the tone of the day ☀️',
    'Reading list for this week 📖','Fitness journey day 30 💪','New recipe to try this weekend 🍳',
    'Travel diaries: Istanbul 🕌','Nature walk thoughts 🌳','Music recommendations? 🎵','Best book you''ve read recently?'
  ];
  v_article_titles_ar text[] := ARRAY[
    'مستقبل الذكاء الاصطناعي في 2026','كيف تبدأ رحلتك في البرمجة','10 نصائح لزيادة الإنتاجية',
    'دليلك الشامل إلى ChatGPT','أدوات الذكاء الاصطناعي التي يجب أن تعرفها','العملات الرقمية: ما تحتاج لمعرفته',
    'كيف تبني علامتك الشخصية','أفضل ممارسات الكود النظيف','العمل عن بعد: الإيجابيات والسلبيات','تعلم Python في 30 يوماً'
  ];
  v_article_titles_en text[] := ARRAY[
    'The Future of AI in 2026','How to Start Your Coding Journey','10 Productivity Hacks That Work',
    'A Complete Guide to ChatGPT','AI Tools You Must Know','Cryptocurrency Explained',
    'Building Your Personal Brand','Clean Code Best Practices','Remote Work: Pros and Cons','Learn Python in 30 Days'
  ];
  v_article_titles_fr text[] := ARRAY[
    'L''avenir de l''IA en 2026','Comment commencer en programmation','Guide complet de ChatGPT',
    '10 astuces de productivité','Outils IA à connaître','Les cryptomonnaies expliquées'
  ];
  v_article_titles_es text[] := ARRAY[
    'El futuro de la IA en 2026','Cómo empezar a programar','Guía completa de ChatGPT',
    '10 trucos de productividad','Herramientas de IA','Criptomonedas explicadas'
  ];
  v_categories uuid[];
  v_cat_id uuid;
  v_lang text;
  v_country text;
  v_title text;
  v_languages text[] := ARRAY['ar','en','fr','es','tr','ru','ja','zh','hi','de','it','pt','ko','vi'];
  v_countries text[] := ARRAY['MA','EG','SA','AE','JO','TN','DZ','US','GB','FR','ES','TR','RU','JP','CN','IN','DE','IT','BR','PT','KR','VN'];
  v_username text;
  v_full text;
BEGIN
  SELECT array_agg(id) INTO v_categories FROM article_categories;

  FOR i IN 1..500 LOOP
    v_uid := gen_random_uuid();
    v_full := v_first_names[1 + (i % array_length(v_first_names,1))];
    v_username := lower(v_full) || (1000 + i)::text;
    v_lang := v_languages[1 + (i % array_length(v_languages,1))];
    v_country := v_countries[1 + (i % array_length(v_countries,1))];

    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'seed_' || v_uid || '@seed.local',
      crypt(v_uid::text, gen_salt('bf')), now(),
      jsonb_build_object('provider','seed','providers',ARRAY['seed']),
      jsonb_build_object('seed', true),
      now() - (random() * interval '180 days'), now(),
      '', '', '', ''
    ) ON CONFLICT DO NOTHING;

    INSERT INTO profiles (id, username, full_name, country_code, language_code, is_online, last_seen, created_at, bio)
    VALUES (
      v_uid, v_username, v_full, v_country, v_lang,
      (random() < 0.35),
      now() - (random() * interval '7 days'),
      now() - (random() * interval '180 days'),
      CASE (i % 5)
        WHEN 0 THEN 'مرحباً، أحب التكنولوجيا 🚀'
        WHEN 1 THEN 'Tech enthusiast & coffee lover ☕'
        WHEN 2 THEN 'Designer | Dreamer | Doer ✨'
        WHEN 3 THEN 'Building cool stuff on the internet'
        ELSE 'Explorer of ideas 💡'
      END
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Chat messages
  FOR i IN 1..600 LOOP
    INSERT INTO public_chat_messages (user_id, content, created_at)
    SELECT id, v_msgs[1 + (floor(random() * array_length(v_msgs,1)))::int],
           now() - (random() * interval '30 days')
    FROM auth.users WHERE email LIKE 'seed_%@seed.local' ORDER BY random() LIMIT 1;
  END LOOP;

  -- Posts
  FOR i IN 1..1200 LOOP
    INSERT INTO posts (user_id, content, type, likes_count, comments_count, views_count, created_at)
    SELECT id,
           v_post_contents[1 + (floor(random() * array_length(v_post_contents,1)))::int],
           'post'::post_type,
           (random() * 250)::int,
           (random() * 40)::int,
           (random() * 5000)::int,
           now() - (random() * interval '60 days')
    FROM auth.users WHERE email LIKE 'seed_%@seed.local' ORDER BY random() LIMIT 1;
  END LOOP;

  -- Articles (only allowed langs: ar/en/fr/es)
  FOR i IN 1..120 LOOP
    v_cat_id := v_categories[1 + (floor(random() * array_length(v_categories,1)))::int];
    v_lang := (ARRAY['ar','en','fr','es'])[1 + (i % 4)];
    v_title := CASE v_lang
      WHEN 'ar' THEN v_article_titles_ar[1 + (i % array_length(v_article_titles_ar,1))]
      WHEN 'en' THEN v_article_titles_en[1 + (i % array_length(v_article_titles_en,1))]
      WHEN 'fr' THEN v_article_titles_fr[1 + (i % array_length(v_article_titles_fr,1))]
      ELSE v_article_titles_es[1 + (i % array_length(v_article_titles_es,1))]
    END;

    INSERT INTO articles (
      author_id, title, slug, category_id, language, status, published_at,
      short_description, content, views_count, likes_count, reading_time, created_at, source_project
    )
    SELECT id, v_title,
      'seed-' || gen_random_uuid()::text,
      v_cat_id, v_lang, 'published',
      now() - (random() * interval '90 days'),
      'مقدمة قصيرة عن الموضوع. A great short introduction.',
      E'## مقدمة\n\nمقالة تجريبية رائعة عن أحدث التطورات في عالم التكنولوجيا.\n\n## النقاط الرئيسية\n\n- الذكاء الاصطناعي يتطور بسرعة\n- المستقبل واعد\n- علينا أن نكون مستعدين\n\n## Introduction\n\nThis is a sample article about technology trends and AI developments.\n\n1. AI is evolving fast\n2. The future looks bright\n3. We must be prepared\n\nThank you for reading!',
      (random() * 10000)::int,
      (random() * 500)::int,
      3 + (random() * 8)::int,
      now() - (random() * interval '90 days'),
      'seed_demo'
    FROM auth.users WHERE email LIKE 'seed_%@seed.local' ORDER BY random() LIMIT 1;
  END LOOP;

END $$;
