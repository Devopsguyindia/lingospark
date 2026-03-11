-- LingoSpark Database Schema
-- Compatible with MySQL 8.0+ and MariaDB 10.2+

CREATE DATABASE IF NOT EXISTS lingospark
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lingospark;

-- ============================================================
-- Languages table (multi-language support)
-- ============================================================
CREATE TABLE IF NOT EXISTS languages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  course_title VARCHAR(100),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Users table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar VARCHAR(50) DEFAULT 'default',
  age INT NOT NULL CHECK (age >= 6),
  cefr_level ENUM('A1', 'A2') DEFAULT 'A1',
  target_language VARCHAR(10) DEFAULT 'en',
  total_stars INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (target_language) REFERENCES languages(code)
);

-- ============================================================
-- Lessons table
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  language_code VARCHAR(10) NOT NULL,
  cefr_level ENUM('A1', 'A2') NOT NULL,
  skill ENUM('listening', 'speaking', 'reading', 'writing') NOT NULL,
  title VARCHAR(200) NOT NULL,
  title_translation VARCHAR(200),
  description TEXT,
  description_translation TEXT,
  content LONGTEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (language_code) REFERENCES languages(code),
  INDEX idx_lesson_filter (language_code, cefr_level, skill)
);

-- ============================================================
-- Progress table
-- ============================================================
CREATE TABLE IF NOT EXISTS progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  skill ENUM('listening', 'speaking', 'reading', 'writing') NOT NULL,
  score INT DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  stars INT DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
  completed BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 1,
  time_spent_seconds INT DEFAULT 0,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_lesson (user_id, lesson_id)
);

-- ============================================================
-- Badges table
-- ============================================================
CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  icon VARCHAR(50) NOT NULL,
  skill ENUM('listening', 'speaking', 'reading', 'writing', 'general') NOT NULL,
  cefr_level ENUM('A1', 'A2') DEFAULT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INT NOT NULL DEFAULT 1
);

-- ============================================================
-- User badges (earned)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_badge (user_id, badge_id)
);
