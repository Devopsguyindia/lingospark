-- LingoSpark Seed Data
-- A1 & A2 English lessons for all LSRW skills
-- Compatible with MySQL 8.0+ and MariaDB 10.2+

USE lingospark;

-- ============================================================
-- Languages
-- ============================================================
INSERT INTO languages (code, name, course_title, enabled) VALUES
('en', 'English', 'Speak English', TRUE),
('de', 'German', 'Speak German', FALSE),
('es', 'Spanish', 'Speak Spanish', FALSE);

-- ============================================================
-- Badges
-- ============================================================
INSERT INTO badges (name, description, icon, skill, cefr_level, requirement_type, requirement_value) VALUES
('First Listen', 'Complete your first listening lesson', '🎧', 'listening', 'A1', 'lessons_completed', 1),
('Listening Star', 'Complete 5 listening lessons', '⭐', 'listening', 'A1', 'lessons_completed', 5),
('Listening Champion A1', 'Complete all A1 listening lessons', '🏆', 'listening', 'A1', 'level_complete', 1),
('First Words', 'Complete your first speaking lesson', '🗣️', 'speaking', 'A1', 'lessons_completed', 1),
('Chatterbox', 'Complete 5 speaking lessons', '💬', 'speaking', 'A1', 'lessons_completed', 5),
('Speaker Champion A1', 'Complete all A1 speaking lessons', '🏆', 'speaking', 'A1', 'level_complete', 1),
('Bookworm', 'Complete your first reading lesson', '📖', 'reading', 'A1', 'lessons_completed', 1),
('Reading Star', 'Complete 5 reading lessons', '⭐', 'reading', 'A1', 'lessons_completed', 5),
('Reading Champion A1', 'Complete all A1 reading lessons', '🏆', 'reading', 'A1', 'level_complete', 1),
('First Scribble', 'Complete your first writing lesson', '✏️', 'writing', 'A1', 'lessons_completed', 1),
('Writing Star', 'Complete 5 writing lessons', '⭐', 'writing', 'A1', 'lessons_completed', 5),
('Writing Champion A1', 'Complete all A1 writing lessons', '🏆', 'writing', 'A1', 'level_complete', 1),
('A1 Master', 'Complete all A1 skills', '👑', 'general', 'A1', 'all_skills_complete', 1),
('A2 Explorer', 'Start your A2 journey', '🚀', 'general', 'A2', 'lessons_completed', 1),
('A2 Master', 'Complete all A2 skills', '🎓', 'general', 'A2', 'all_skills_complete', 1);

-- ============================================================
-- A1 LISTENING LESSONS
-- ============================================================
INSERT INTO lessons (language_code, cefr_level, skill, title, description, content, order_index) VALUES

('en', 'A1', 'listening', 'Hello & Goodbye', 'Learn basic greetings by listening',
'{"type":"listen_and_choose","instructions":"Listen to the audio and choose the correct picture.","exercises":[{"prompt":"Hello! How are you?","options":["A person waving","A person sleeping","A person eating","A person running"],"correct":0,"hint":"This is a friendly greeting"},{"prompt":"Goodbye! See you later!","options":["A person arriving","A person waving goodbye","A person sitting","A person cooking"],"correct":1,"hint":"Someone is leaving"},{"prompt":"Good morning!","options":["A night sky","A sunrise","A rainy day","A sunset"],"correct":1,"hint":"Think about when you wake up"},{"prompt":"Good night! Sweet dreams!","options":["A sunny day","A person at work","A moon and stars","A playground"],"correct":2,"hint":"Time to sleep"},{"prompt":"Nice to meet you!","options":["Two people shaking hands","A person alone","A person angry","A person running"],"correct":0,"hint":"Meeting someone new"}]}', 1),

('en', 'A1', 'listening', 'Numbers 1 to 10', 'Listen and learn numbers one through ten',
'{"type":"listen_and_choose","instructions":"Listen to the number and choose the correct one.","exercises":[{"prompt":"Three","options":["1","3","5","7"],"correct":1,"hint":"It comes after two"},{"prompt":"Seven","options":["4","6","7","9"],"correct":2,"hint":"It comes after six"},{"prompt":"One","options":["1","2","10","8"],"correct":0,"hint":"The very first number"},{"prompt":"Ten","options":["2","5","8","10"],"correct":3,"hint":"The biggest single-digit group"},{"prompt":"Five","options":["3","5","4","6"],"correct":1,"hint":"Right in the middle"}]}', 2),

('en', 'A1', 'listening', 'Colors Around Us', 'Listen and identify colors',
'{"type":"listen_and_choose","instructions":"Listen to the color name and pick the right one.","exercises":[{"prompt":"Red","options":["🔴","🔵","🟢","🟡"],"correct":0,"hint":"The color of a fire truck"},{"prompt":"Blue","options":["🟠","🔵","🟣","🔴"],"correct":1,"hint":"The color of the sky"},{"prompt":"Green","options":["🟡","🔴","🟢","🔵"],"correct":2,"hint":"The color of grass"},{"prompt":"Yellow","options":["🟢","🟣","🔴","🟡"],"correct":3,"hint":"The color of the sun"},{"prompt":"Orange","options":["🟠","🔵","🟢","🟡"],"correct":0,"hint":"A fruit has this name too"}]}', 3),

('en', 'A1', 'listening', 'My Family', 'Listen and learn family member names',
'{"type":"listen_and_choose","instructions":"Listen and choose who is being described.","exercises":[{"prompt":"This is my mother. She is very kind.","options":["👩 Mother","👨 Father","👦 Brother","👧 Sister"],"correct":0,"hint":"A female parent"},{"prompt":"My father likes to cook.","options":["👧 Sister","👦 Brother","👨 Father","👩 Mother"],"correct":2,"hint":"A male parent"},{"prompt":"I have a baby sister.","options":["👦 Brother","👨 Father","👩 Mother","👧 Sister"],"correct":3,"hint":"A young female sibling"},{"prompt":"My brother plays football.","options":["👦 Brother","👧 Sister","👩 Mother","👨 Father"],"correct":0,"hint":"A male sibling"},{"prompt":"Grandmother tells us stories.","options":["👨 Father","👩 Mother","👵 Grandmother","👦 Brother"],"correct":2,"hint":"Your parent''s mother"}]}', 4),

('en', 'A1', 'listening', 'Animals I Know', 'Listen to animal names and sounds',
'{"type":"listen_and_choose","instructions":"Listen and choose the correct animal.","exercises":[{"prompt":"The cat says meow.","options":["🐱","🐶","🐦","🐸"],"correct":0,"hint":"A small furry pet"},{"prompt":"The dog is barking.","options":["🐱","🐶","🐟","🐘"],"correct":1,"hint":"A loyal pet that fetches"},{"prompt":"Look at the big elephant!","options":["🐁","🐦","🐘","🐟"],"correct":2,"hint":"The largest land animal"},{"prompt":"The bird is singing.","options":["🐸","🐦","🐱","🐶"],"correct":1,"hint":"It has wings and feathers"},{"prompt":"The fish swims in the water.","options":["🐦","🐱","🐶","🐟"],"correct":3,"hint":"It lives underwater"}]}', 5);

-- ============================================================
-- A1 SPEAKING LESSONS
-- ============================================================
INSERT INTO lessons (language_code, cefr_level, skill, title, description, content, order_index) VALUES

('en', 'A1', 'speaking', 'Say Hello', 'Practice greeting people',
'{"type":"speak_and_compare","instructions":"Listen to the phrase, then say it aloud. We will check your pronunciation!","exercises":[{"prompt":"Hello!","expected":"hello","hint":"A simple greeting"},{"prompt":"Good morning!","expected":"good morning","hint":"What you say in the morning"},{"prompt":"How are you?","expected":"how are you","hint":"Asking about someone''s feelings"},{"prompt":"Nice to meet you!","expected":"nice to meet you","hint":"When you meet someone new"},{"prompt":"Goodbye!","expected":"goodbye","hint":"When you are leaving"}]}', 1),

('en', 'A1', 'speaking', 'Tell Me About You', 'Practice introducing yourself',
'{"type":"speak_and_compare","instructions":"Say each sentence out loud. Try to match the words exactly!","exercises":[{"prompt":"My name is...","expected":"my name is","hint":"Tell your name"},{"prompt":"I am six years old.","expected":"i am six years old","hint":"Tell your age"},{"prompt":"I like to play.","expected":"i like to play","hint":"Something you enjoy"},{"prompt":"I am happy!","expected":"i am happy","hint":"How you feel"},{"prompt":"Thank you!","expected":"thank you","hint":"Being polite"}]}', 2),

('en', 'A1', 'speaking', 'Count With Me', 'Practice saying numbers aloud',
'{"type":"speak_and_compare","instructions":"Say each number clearly.","exercises":[{"prompt":"One","expected":"one","hint":"The first number"},{"prompt":"Two","expected":"two","hint":"After one"},{"prompt":"Five","expected":"five","hint":"Half of ten"},{"prompt":"Eight","expected":"eight","hint":"After seven"},{"prompt":"Ten","expected":"ten","hint":"Two hands of fingers"}]}', 3),

('en', 'A1', 'speaking', 'Name the Colors', 'Say color names aloud',
'{"type":"speak_and_compare","instructions":"Look at the color and say its name.","exercises":[{"prompt":"Red 🔴","expected":"red","hint":"Color of fire"},{"prompt":"Blue 🔵","expected":"blue","hint":"Color of the ocean"},{"prompt":"Green 🟢","expected":"green","hint":"Color of leaves"},{"prompt":"Yellow 🟡","expected":"yellow","hint":"Color of bananas"},{"prompt":"Purple 🟣","expected":"purple","hint":"Mix of red and blue"}]}', 4),

('en', 'A1', 'speaking', 'Animal Sounds', 'Say the names of animals',
'{"type":"speak_and_compare","instructions":"Say the animal name when you see it!","exercises":[{"prompt":"🐱 What animal is this?","expected":"cat","hint":"It says meow"},{"prompt":"🐶 What animal is this?","expected":"dog","hint":"It says woof"},{"prompt":"🐦 What animal is this?","expected":"bird","hint":"It can fly"},{"prompt":"🐟 What animal is this?","expected":"fish","hint":"It swims"},{"prompt":"🐘 What animal is this?","expected":"elephant","hint":"Very large with a trunk"}]}', 5);

-- ============================================================
-- A1 READING LESSONS
-- ============================================================
INSERT INTO lessons (language_code, cefr_level, skill, title, description, content, order_index) VALUES

('en', 'A1', 'reading', 'Match the Word', 'Read simple words and match to pictures',
'{"type":"read_and_match","instructions":"Read the word and choose the matching picture.","exercises":[{"word":"Cat","options":["🐱","🐶","🐟","🐦"],"correct":0},{"word":"Sun","options":["🌙","⭐","☀️","🌧️"],"correct":2},{"word":"Book","options":["📱","📖","🎮","🎸"],"correct":1},{"word":"Apple","options":["🍌","🍇","🍎","🍊"],"correct":2},{"word":"House","options":["🏫","🏠","🏥","🏪"],"correct":1}]}', 1),

('en', 'A1', 'reading', 'Simple Sentences', 'Read short sentences and understand them',
'{"type":"read_and_choose","instructions":"Read the sentence and choose what it means.","exercises":[{"sentence":"The cat is on the mat.","question":"Where is the cat?","options":["On the mat","Under the table","In the box","On the bed"],"correct":0},{"sentence":"I have two apples.","question":"How many apples?","options":["One","Two","Three","Four"],"correct":1},{"sentence":"The sun is yellow.","question":"What color is the sun?","options":["Red","Blue","Yellow","Green"],"correct":2},{"sentence":"My dog is big.","question":"What is big?","options":["The cat","The bird","The fish","The dog"],"correct":3},{"sentence":"She likes ice cream.","question":"What does she like?","options":["Ice cream","Pizza","Cake","Bread"],"correct":0}]}', 2),

('en', 'A1', 'reading', 'Fill the Blank', 'Complete simple sentences',
'{"type":"fill_blank","instructions":"Read the sentence and choose the missing word.","exercises":[{"sentence":"The sky is ___.","options":["blue","big","fast","hot"],"correct":0},{"sentence":"I ___ a student.","options":["is","am","are","be"],"correct":1},{"sentence":"She ___ to school.","options":["go","goes","going","gone"],"correct":1},{"sentence":"We have ___ dogs.","options":["a","an","two","the"],"correct":2},{"sentence":"This is ___ apple.","options":["a","an","the","two"],"correct":1}]}', 3),

('en', 'A1', 'reading', 'True or False', 'Read and decide if statements are true',
'{"type":"true_false","instructions":"Read the sentence. Is it TRUE or FALSE?","exercises":[{"statement":"A cat can fly.","correct":false,"explanation":"Cats cannot fly. Birds can fly!"},{"statement":"The sun is hot.","correct":true,"explanation":"Yes! The sun is very hot."},{"statement":"Fish live in water.","correct":true,"explanation":"Correct! Fish live in water."},{"statement":"Ice cream is hot.","correct":false,"explanation":"No! Ice cream is cold and yummy."},{"statement":"People have two eyes.","correct":true,"explanation":"Yes! We have two eyes."}]}', 4),

('en', 'A1', 'reading', 'Word Families', 'Group related words together',
'{"type":"read_and_match","instructions":"Read the word and choose which group it belongs to.","exercises":[{"word":"Dog","options":["Animals","Foods","Colors","Numbers"],"correct":0},{"word":"Red","options":["Animals","Foods","Colors","Numbers"],"correct":2},{"word":"Apple","options":["Animals","Foods","Colors","Numbers"],"correct":1},{"word":"Three","options":["Animals","Foods","Colors","Numbers"],"correct":3},{"word":"Banana","options":["Animals","Foods","Colors","Numbers"],"correct":1}]}', 5);

-- ============================================================
-- A1 WRITING LESSONS
-- ============================================================
INSERT INTO lessons (language_code, cefr_level, skill, title, description, content, order_index) VALUES

('en', 'A1', 'writing', 'Type the Letters', 'Practice typing individual letters',
'{"type":"type_word","instructions":"Type the letter you see on screen.","exercises":[{"prompt":"Type the letter: A","expected":"A","hint":"The first letter of the alphabet"},{"prompt":"Type the letter: B","expected":"B","hint":"The second letter"},{"prompt":"Type the letter: C","expected":"C","hint":"Cat starts with this letter"},{"prompt":"Type the letter: D","expected":"D","hint":"Dog starts with this letter"},{"prompt":"Type the letter: E","expected":"E","hint":"Elephant starts with this letter"}]}', 1),

('en', 'A1', 'writing', 'Spell Simple Words', 'Type short words correctly',
'{"type":"type_word","instructions":"Listen to the word and type it correctly.","exercises":[{"prompt":"cat","expected":"cat","hint":"🐱 Three letters, starts with C"},{"prompt":"dog","expected":"dog","hint":"🐶 Three letters, starts with D"},{"prompt":"sun","expected":"sun","hint":"☀️ Three letters, starts with S"},{"prompt":"red","expected":"red","hint":"🔴 Three letters, a color"},{"prompt":"big","expected":"big","hint":"The opposite of small"}]}', 2),

('en', 'A1', 'writing', 'Unscramble Words', 'Rearrange letters to make words',
'{"type":"unscramble","instructions":"The letters are mixed up! Type the correct word.","exercises":[{"scrambled":"tac","expected":"cat","hint":"🐱 A pet that says meow"},{"scrambled":"nus","expected":"sun","hint":"☀️ It shines in the sky"},{"scrambled":"ppalpe","expected":"apple","hint":"🍎 A red fruit"},{"scrambled":"okbo","expected":"book","hint":"📖 You read this"},{"scrambled":"ishf","expected":"fish","hint":"🐟 It swims in water"}]}', 3),

('en', 'A1', 'writing', 'Complete the Word', 'Fill in missing letters',
'{"type":"fill_letters","instructions":"Some letters are missing. Type the complete word.","exercises":[{"partial":"c_t","expected":"cat","hint":"🐱 A furry pet"},{"partial":"d_g","expected":"dog","hint":"🐶 A loyal pet"},{"partial":"b__k","expected":"book","hint":"📖 You read it"},{"partial":"h__se","expected":"house","hint":"🏠 Where you live"},{"partial":"fl__er","expected":"flower","hint":"🌸 Grows in a garden"}]}', 4),

('en', 'A1', 'writing', 'Write a Sentence', 'Copy simple sentences by typing',
'{"type":"copy_sentence","instructions":"Read the sentence and type it exactly as shown.","exercises":[{"sentence":"I am happy.","expected":"I am happy.","hint":"Three words and a period"},{"sentence":"The cat is big.","expected":"The cat is big.","hint":"Four words about a cat"},{"sentence":"I like red.","expected":"I like red.","hint":"Three words about a color"},{"sentence":"She has a dog.","expected":"She has a dog.","hint":"Four words about a pet"},{"sentence":"We go to school.","expected":"We go to school.","hint":"Four words about where you learn"}]}', 5);

-- ============================================================
-- A2 LISTENING LESSONS
-- ============================================================
INSERT INTO lessons (language_code, cefr_level, skill, title, description, content, order_index) VALUES

('en', 'A2', 'listening', 'My Daily Routine', 'Listen to descriptions of daily activities',
'{"type":"listen_and_choose","instructions":"Listen to the sentence and answer the question.","exercises":[{"prompt":"I wake up at seven o''clock every morning.","question":"What time does the person wake up?","options":["6 o''clock","7 o''clock","8 o''clock","9 o''clock"],"correct":1},{"prompt":"After breakfast, I brush my teeth and go to school.","question":"What happens after breakfast?","options":["Sleep","Play games","Brush teeth and go to school","Watch TV"],"correct":2},{"prompt":"I have lunch at twelve thirty.","question":"When is lunch?","options":["11:00","12:00","12:30","1:00"],"correct":2},{"prompt":"In the evening, I do my homework.","question":"When does homework happen?","options":["Morning","Afternoon","Evening","Night"],"correct":2},{"prompt":"I go to bed at nine o''clock.","question":"What is the bedtime?","options":["8 PM","9 PM","10 PM","11 PM"],"correct":1}]}', 1),

('en', 'A2', 'listening', 'At the Shop', 'Listen to shopping dialogues',
'{"type":"listen_and_choose","instructions":"Listen to the conversation and answer.","exercises":[{"prompt":"Can I have two apples, please? That will be one dollar.","question":"How much do the apples cost?","options":["Two dollars","One dollar","Three dollars","Five dollars"],"correct":1},{"prompt":"Do you have any milk? Yes, it is in the fridge.","question":"Where is the milk?","options":["On the shelf","In the fridge","On the table","In the bag"],"correct":1},{"prompt":"I would like a sandwich and some juice, please.","question":"What does the person want?","options":["Pizza and water","Sandwich and juice","Cake and tea","Burger and cola"],"correct":1},{"prompt":"How much is this book? It costs five dollars.","question":"How much is the book?","options":["Three dollars","Four dollars","Five dollars","Six dollars"],"correct":2},{"prompt":"Thank you for shopping with us. Have a nice day!","question":"What does the shopkeeper say?","options":["Come back tomorrow","Have a nice day","The shop is closed","Goodbye forever"],"correct":1}]}', 2),

('en', 'A2', 'listening', 'Weather Report', 'Listen to weather descriptions',
'{"type":"listen_and_choose","instructions":"Listen to the weather report and answer.","exercises":[{"prompt":"Today will be sunny and warm. The temperature is 25 degrees.","question":"What is the weather like?","options":["Rainy","Sunny and warm","Cold and snowy","Windy"],"correct":1},{"prompt":"It is raining outside. Don''t forget your umbrella!","question":"What should you bring?","options":["Sunglasses","An umbrella","A hat","Gloves"],"correct":1},{"prompt":"Tomorrow will be cloudy with a chance of rain.","question":"What will tomorrow be like?","options":["Sunny","Snowy","Cloudy with rain","Hot"],"correct":2},{"prompt":"In winter, it is very cold and it sometimes snows.","question":"What happens in winter?","options":["It is hot","It is cold and snowy","It is rainy","It is windy"],"correct":1},{"prompt":"The wind is strong today. Hold onto your hat!","question":"What is strong today?","options":["The rain","The sun","The wind","The snow"],"correct":2}]}', 3),

('en', 'A2', 'listening', 'Asking for Directions', 'Listen to direction conversations',
'{"type":"listen_and_choose","instructions":"Listen and answer the question about directions.","exercises":[{"prompt":"Excuse me, where is the library? Go straight and turn left.","question":"How do you get to the library?","options":["Turn right","Go straight and turn left","Go back","Turn around"],"correct":1},{"prompt":"The school is next to the park.","question":"Where is the school?","options":["Far from the park","Next to the park","Behind the park","In front of the park"],"correct":1},{"prompt":"Walk for five minutes and you will see the hospital on your right.","question":"Where is the hospital?","options":["On the left","On the right","Behind you","Very far away"],"correct":1},{"prompt":"The supermarket is between the bank and the post office.","question":"Where is the supermarket?","options":["Next to the school","Behind the bank","Between bank and post office","Far away"],"correct":2},{"prompt":"Cross the street and the bus stop is right there.","question":"What should you do?","options":["Turn left","Go back home","Cross the street","Take a taxi"],"correct":2}]}', 4);

-- ============================================================
-- A2 SPEAKING LESSONS
-- ============================================================
INSERT INTO lessons (language_code, cefr_level, skill, title, description, content, order_index) VALUES

('en', 'A2', 'speaking', 'Describe Your Day', 'Talk about daily routines',
'{"type":"speak_and_compare","instructions":"Say each sentence clearly. We will check your words!","exercises":[{"prompt":"I wake up early in the morning.","expected":"i wake up early in the morning","hint":"Start of your day"},{"prompt":"I eat breakfast at eight o''clock.","expected":"i eat breakfast at eight o clock","hint":"Your first meal"},{"prompt":"I go to school by bus.","expected":"i go to school by bus","hint":"How you travel"},{"prompt":"I play with my friends after school.","expected":"i play with my friends after school","hint":"After classes finish"},{"prompt":"I read a book before bed.","expected":"i read a book before bed","hint":"Something you do at night"}]}', 1),

('en', 'A2', 'speaking', 'At the Restaurant', 'Practice ordering food',
'{"type":"speak_and_compare","instructions":"Pretend you are at a restaurant. Say each sentence.","exercises":[{"prompt":"Can I see the menu, please?","expected":"can i see the menu please","hint":"Asking for the menu"},{"prompt":"I would like a pizza, please.","expected":"i would like a pizza please","hint":"Ordering food"},{"prompt":"Can I have some water?","expected":"can i have some water","hint":"Ordering a drink"},{"prompt":"How much does it cost?","expected":"how much does it cost","hint":"Asking about the price"},{"prompt":"Thank you, the food was delicious!","expected":"thank you the food was delicious","hint":"Complimenting the meal"}]}', 2),

('en', 'A2', 'speaking', 'Tell a Short Story', 'Describe a sequence of events',
'{"type":"speak_and_compare","instructions":"Read the story prompt and say the sentence out loud.","exercises":[{"prompt":"Yesterday, I went to the park.","expected":"yesterday i went to the park","hint":"Past tense of go"},{"prompt":"I saw a big brown dog there.","expected":"i saw a big brown dog there","hint":"Describing what you saw"},{"prompt":"The dog was playing with a ball.","expected":"the dog was playing with a ball","hint":"What was the dog doing?"},{"prompt":"I wanted to play with the dog.","expected":"i wanted to play with the dog","hint":"What you wanted"},{"prompt":"It was a wonderful day!","expected":"it was a wonderful day","hint":"How the day was"}]}', 3);

-- ============================================================
-- A2 READING LESSONS
-- ============================================================
INSERT INTO lessons (language_code, cefr_level, skill, title, description, content, order_index) VALUES

('en', 'A2', 'reading', 'A Short Story', 'Read and understand a simple story',
'{"type":"read_and_choose","instructions":"Read the story and answer the questions.","passage":"Tom gets up at seven o''clock. He eats toast and drinks orange juice for breakfast. Then he walks to school with his friend Sam. At school, they learn math and science. After school, Tom plays football in the park. He comes home at five o''clock and does his homework. After dinner, he reads a book and goes to bed at nine.","exercises":[{"question":"What does Tom eat for breakfast?","options":["Toast and juice","Cereal and milk","Eggs and bacon","Pancakes"],"correct":0},{"question":"How does Tom go to school?","options":["By bus","By car","He walks","By bicycle"],"correct":2},{"question":"What does Tom do after school?","options":["Watches TV","Plays football","Goes shopping","Sleeps"],"correct":1},{"question":"What time does Tom come home?","options":["4 o''clock","5 o''clock","6 o''clock","7 o''clock"],"correct":1},{"question":"What does Tom do before bed?","options":["Plays games","Watches TV","Reads a book","Eats snacks"],"correct":2}]}', 1),

('en', 'A2', 'reading', 'Reading Signs & Menus', 'Understand everyday signs and menus',
'{"type":"read_and_choose","instructions":"Read the sign or menu item and answer.","exercises":[{"sentence":"⚠️ CAUTION: Wet Floor","question":"What does this sign mean?","options":["The floor is dirty","The floor is wet, be careful","The floor is new","The floor is hot"],"correct":1},{"sentence":"🍕 Pizza — $8 | 🍔 Burger — $6 | 🥤 Juice — $3","question":"How much is a burger?","options":["$3","$6","$8","$10"],"correct":1},{"sentence":"🚫 No Swimming","question":"What can you NOT do here?","options":["Running","Swimming","Walking","Sitting"],"correct":1},{"sentence":"🕐 Open: 9 AM — 6 PM","question":"When does the place close?","options":["5 PM","6 PM","7 PM","8 PM"],"correct":1},{"sentence":"📧 Email us at info@school.com","question":"How can you contact them?","options":["By phone","By email","In person","By mail"],"correct":1}]}', 2),

('en', 'A2', 'reading', 'Understanding Messages', 'Read and understand short messages',
'{"type":"read_and_choose","instructions":"Read the message and answer the question.","exercises":[{"sentence":"Hi Mom! I am at Sara''s house. I will come home at 5. Love, Tom","question":"Where is Tom?","options":["At school","At Sara''s house","At the park","At home"],"correct":1},{"sentence":"Dear class, there is no school tomorrow because of the holiday. Enjoy! — Mrs. Smith","question":"Why is there no school?","options":["It is raining","The teacher is sick","It is a holiday","The school is broken"],"correct":2},{"sentence":"Don''t forget: soccer practice at 4 PM on the big field!","question":"When is soccer practice?","options":["3 PM","4 PM","5 PM","6 PM"],"correct":1},{"sentence":"Happy Birthday, Lily! 🎂 Party at my house, Saturday at 3 PM. Bring your swimsuit!","question":"What should Lily bring?","options":["A gift","Food","A swimsuit","Books"],"correct":2},{"sentence":"Library books are due on Friday. Please return them on time.","question":"When should books be returned?","options":["Monday","Wednesday","Friday","Sunday"],"correct":2}]}', 3);

-- ============================================================
-- A2 WRITING LESSONS
-- ============================================================
INSERT INTO lessons (language_code, cefr_level, skill, title, description, content, order_index) VALUES

('en', 'A2', 'writing', 'Complete the Sentence', 'Type the missing word to complete sentences',
'{"type":"fill_blank_type","instructions":"Read the sentence and type the missing word.","exercises":[{"sentence":"I ___ to school every day.","expected":"go","hint":"How you travel to school"},{"sentence":"She ___ a red dress yesterday.","expected":"wore","hint":"Past tense of wear"},{"sentence":"They are ___ in the park.","expected":"playing","hint":"Having fun, -ing form"},{"sentence":"We ___ dinner at seven.","expected":"eat","hint":"What you do with food"},{"sentence":"He ___ his homework last night.","expected":"did","hint":"Past tense of do"}]}', 1),

('en', 'A2', 'writing', 'Write About Yourself', 'Type short sentences about yourself',
'{"type":"guided_writing","instructions":"Answer each question by typing a complete sentence.","exercises":[{"question":"What is your favorite color?","starter":"My favorite color is","example":"My favorite color is blue.","hint":"Name any color"},{"question":"What do you like to eat?","starter":"I like to eat","example":"I like to eat pizza.","hint":"Name a food you enjoy"},{"question":"Where do you live?","starter":"I live in","example":"I live in a big city.","hint":"Name your city or town"},{"question":"What is your hobby?","starter":"My hobby is","example":"My hobby is reading books.","hint":"Something you enjoy doing"},{"question":"How many people are in your family?","starter":"There are","example":"There are four people in my family.","hint":"Count your family members"}]}', 2),

('en', 'A2', 'writing', 'Short Descriptions', 'Write short descriptions of pictures',
'{"type":"guided_writing","instructions":"Look at the description and type a similar sentence.","exercises":[{"question":"Describe a sunny day ☀️","starter":"The weather is","example":"The weather is sunny and warm today.","hint":"Talk about how it looks and feels outside"},{"question":"Describe your best friend 👫","starter":"My best friend is","example":"My best friend is kind and funny.","hint":"Use adjectives to describe them"},{"question":"Describe your school 🏫","starter":"My school is","example":"My school is big and has a beautiful garden.","hint":"Talk about its size and features"},{"question":"Describe your bedroom 🛏️","starter":"My bedroom has","example":"My bedroom has a bed, a desk, and many books.","hint":"List things in your room"},{"question":"Describe your favorite animal 🐾","starter":"My favorite animal is","example":"My favorite animal is a dog because it is friendly.","hint":"Name the animal and say why you like it"}]}', 3);
