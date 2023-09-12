-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Wrz 11, 2023 at 10:10 PM
-- Wersja serwera: 10.6.15-MariaDB-cll-lve
-- Wersja PHP: 8.1.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kapitula_zwierz`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `time` varchar(128) NOT NULL,
  `total_candidates` tinyint(4) NOT NULL,
  `registered_candidates` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `appointment_registrations`
--

CREATE TABLE `appointment_registrations` (
  `id` int(11) NOT NULL,
  `login` varchar(50) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `intent` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `attachments`
--

CREATE TABLE `attachments` (
  `id` int(11) NOT NULL,
  `login` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `content` longblob NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `extension` varchar(15) DEFAULT NULL,
  `thumbnail` mediumblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `quests`
--

CREATE TABLE `quests` (
  `id` int(11) NOT NULL,
  `login` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `finish_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `teams`
--

CREATE TABLE `teams` (
  `name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `trials`
--

CREATE TABLE `trials` (
  `login` varchar(50) NOT NULL,
  `open_date` timestamp NULL DEFAULT NULL,
  `closed_date` timestamp NULL DEFAULT NULL,
  `open_document` int(11) DEFAULT NULL,
  `closing_document` int(11) DEFAULT NULL,
  `mentor_name` varchar(128) NOT NULL,
  `mentor_email` varchar(50) NOT NULL,
  `mentor_phone` varchar(15) NOT NULL,
  `projected_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `archived` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `trials_logbook`
--

CREATE TABLE `trials_logbook` (
  `entry_id` int(11) NOT NULL,
  `trialid` varchar(50) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `log` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(6) UNSIGNED NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(128) NOT NULL,
  `name` varchar(128) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `edited` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `activationkey` varchar(64) DEFAULT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT 0,
  `commitee` varchar(32) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `team` varchar(64) DEFAULT NULL,
  `interests` varchar(256) DEFAULT NULL,
  `function` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `appointment_registrations`
--
ALTER TABLE `appointment_registrations`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `quests`
--
ALTER TABLE `quests`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`name`);

--
-- Indeksy dla tabeli `trials`
--
ALTER TABLE `trials`
  ADD PRIMARY KEY (`login`);

--
-- Indeksy dla tabeli `trials_logbook`
--
ALTER TABLE `trials_logbook`
  ADD PRIMARY KEY (`entry_id`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appointment_registrations`
--
ALTER TABLE `appointment_registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quests`
--
ALTER TABLE `quests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trials_logbook`
--
ALTER TABLE `trials_logbook`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(6) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
