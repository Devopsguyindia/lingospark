# LingoSpark Use Cases & Test Scenarios

This document defines the primary user journeys and expected behaviors for the LingoSpark platform.

## 🇬🇧 English Course (Learning Target: English)

### 1. Listening Proficiency
- **Scenario**: Learner selects "Colors Around Us".
- **Interaction**: App plays "Red".
- **Expectation**: Large red color block appears. Learner selects "Red" button.
- **Outcome**: Positive feedback (✅) and progress recorded.

### 2. Speaking Proficiency
- **Scenario**: Learner practices animal names in "Animal Sounds".
- **Interaction**: App shows 🐱 icon.
- **Expectation**: Learner clicks record and says "Cat".
- **Outcome**: Voice recognition matches "cat" (threshold 70%). Success animation plays.

### 3. Reading Proficiency
- **Scenario**: Learner takes "Daily Routines" match lesson.
- **Interaction**: App shows "I wake up at 7am".
- **Expectation**: Learner matches text to the correct clock image or emoji.
- **Outcome**: Match is validated; explanation provided if wrong.

### 4. Writing Proficiency
- **Scenario**: Learner spells "Apple".
- **Interaction**: App shows 🍎.
- **Expectation**: Learner types "A-P-P-L-E".
- **Outcome**: Letter-by-letter coloring (Green for correct, Red for wrong).

---

## 🇩🇪 German Course (Learning Target: German)

### 1. Multi-Language Hint Fallback (LSRW)
- **Scenario**: Learner is stuck on a German Listening exercise.
- **Interaction**: Learner clicks "💡 Show Hint".
- **Expectation**: Hint appears/speaks in German: "Hör gut zu."
- **Action**: Learner clicks "🔊 Listen in English".
- **Outcome**: App speaks: "Listen carefully." (English Voice).

### 2. German Vocabulary (Reading)
- **Scenario**: Learner matches "Der Hund".
- **Interaction**: List shows "Der Hund", "Die Katze".
- **Expectation**: Learner matches "Der Hund" to "The Dog" or 🐶 icon.
- **Outcome**: Translation confirmed.

### 3. German Sentence Construction (Writing)
- **Scenario**: Learner types "Guten Morgen".
- **Interaction**: Prompt says "Say 'Good Morning'".
- **Expectation**: Learner types exact spelling, including capitalization if required by course level.
- **Outcome**: Validation against German dictionary entries.

### 4. Audio Discrimination (Listening)
- **Scenario**: Distinguishing "U" vs "Ü".
- **Interaction**: Audio plays "Apfel" vs "Äpfel".
- **Expectation**: Learner identifies the plural/singular form based on sound.
- **Outcome**: Comprehension check completed.
