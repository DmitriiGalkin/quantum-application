# Структура базы данных MySQL

Дата выгрузки: 2026-10-06T14:07:04.993Z

Выгружены только метаданные доступных объектов; строки таблиц и реквизиты подключения не включены.

Таблицы и представления: 18.

## Объекты

| Название | Тип | Движок | Сопоставление | Комментарий |
| --- | --- | --- | --- | --- |
| conversation | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| conversationPassport | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| idea | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| ideaUser | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| meet | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| meetUser | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| message2 | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| passport | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| passport_session | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| payment | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| place | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| placeLocation | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| placePassport | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| placeSchedule | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| project | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| projectUser | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| teacherUser | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| user | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |

## conversation

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | NULL | PRI | auto_increment |  |
| type | enum('direct') | NO | direct |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| updatedAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |  |
| deletedAt | datetime | YES | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `conversation` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('direct') NOT NULL DEFAULT 'direct',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## conversationPassport

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| conversationId | int unsigned | NO | NULL | PRI |  |  |
| passportId | int unsigned | NO | NULL | PRI |  |  |
| lastReadAt | datetime | YES | NULL |  |  |  |
| isArchived | tinyint(1) | NO | 0 |  |  |  |
| isMuted | tinyint(1) | NO | 0 |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | conversationId | NULL | BTREE |
| PRIMARY | Да | 2 | passportId | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_conversationPassport_conversation | conversationId | conversation | id | NO ACTION | CASCADE |

### DDL

```sql
CREATE TABLE `conversationPassport` (
  `conversationId` int unsigned NOT NULL,
  `passportId` int unsigned NOT NULL,
  `lastReadAt` datetime DEFAULT NULL,
  `isArchived` tinyint(1) NOT NULL DEFAULT '0',
  `isMuted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversationId`,`passportId`),
  CONSTRAINT `fk_conversationPassport_conversation` FOREIGN KEY (`conversationId`) REFERENCES `conversation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## idea

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| userId | int | YES | NULL |  |  |  |
| passportId | int | NO | NULL |  |  |  |
| title | varchar(255) | NO | NULL |  |  |  |
| description | text | NO | NULL |  |  |  |
| image | varchar(255) | YES | NULL |  |  |  |
| deletedAt | timestamp | YES | NULL |  |  |  |
| userCount | int | NO | 0 |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `idea` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `passportId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `userCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## ideaUser

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| ideaId | int | NO | NULL |  |  |  |
| userId | int | NO | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `ideaUser` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ideaId` int NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## meet

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| projectId | int | NO | NULL |  |  |  |
| passportId | int | NO | NULL |  |  |  |
| price | int | YES | NULL |  |  |  |
| duration | int | YES | NULL |  |  |  |
| status | enum('pending','published','cancelled') | NO | pending |  |  |  |
| startedAt | timestamp | YES | NULL |  |  |  |
| deletedAt | timestamp | YES | NULL |  |  |  |
| placeId | int | NO | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `meet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `passportId` int NOT NULL,
  `price` int DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `status` enum('pending','published','cancelled') NOT NULL DEFAULT 'pending',
  `startedAt` timestamp NULL DEFAULT NULL,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `placeId` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## meetUser

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| userId | int | NO | NULL |  |  |  |
| meetId | int | NO | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `meetUser` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `meetId` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## message2

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | NULL | PRI | auto_increment |  |
| conversationId | int unsigned | NO | NULL | MUL |  |  |
| senderPassportId | int unsigned | NO | NULL |  |  |  |
| text | text | NO | NULL |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| updatedAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |  |
| editedAt | datetime | YES | NULL |  |  |  |
| deletedAt | datetime | YES | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| idx_message_conversation | Нет | 1 | conversationId | NULL | BTREE |
| idx_message_conversation | Нет | 2 | createdAt | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_message_conversation | conversationId | conversation | id | NO ACTION | CASCADE |

### DDL

```sql
CREATE TABLE `message2` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `conversationId` int unsigned NOT NULL,
  `senderPassportId` int unsigned NOT NULL,
  `text` text NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `editedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_message_conversation` (`conversationId`,`createdAt`),
  CONSTRAINT `fk_message_conversation` FOREIGN KEY (`conversationId`) REFERENCES `conversation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## passport

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| provider | varchar(32) | NO | NULL |  |  |  |
| providerId | varchar(128) | NO | NULL |  |  |  |
| title | varchar(255) | NO | NULL |  |  |  |
| description | text | YES | NULL |  |  |  |
| email | varchar(255) | YES | NULL |  |  |  |
| image | varchar(255) | YES | NULL |  |  |  |
| createdAt | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| updatedAt | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |  |
| accessToken | varchar(1000) | YES | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `passport` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` varchar(32) NOT NULL,
  `providerId` varchar(128) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `email` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `accessToken` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## passport_session

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | bigint unsigned | NO | NULL | PRI | auto_increment |  |
| passport_id | int | NO | NULL | MUL |  |  |
| token_hash | varchar(255) | NO | NULL | MUL |  |  |
| user_agent | text | YES | NULL |  |  |  |
| ip | varbinary(16) | YES | NULL |  |  |  |
| created_at | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| last_activity_at | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |  |
| expires_at | datetime | YES | NULL |  |  |  |
| is_active | tinyint(1) | NO | 1 | MUL |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| idx_passport_session_is_active | Нет | 1 | is_active | NULL | BTREE |
| idx_passport_session_passport_id | Нет | 1 | passport_id | NULL | BTREE |
| idx_passport_session_token_hash | Нет | 1 | token_hash | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_passport_session_passport | passport_id | passport | id | NO ACTION | CASCADE |

### DDL

```sql
CREATE TABLE `passport_session` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `passport_id` int NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `user_agent` text,
  `ip` varbinary(16) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_passport_session_token_hash` (`token_hash`),
  KEY `idx_passport_session_is_active` (`is_active`),
  KEY `idx_passport_session_passport_id` (`passport_id`),
  CONSTRAINT `fk_passport_session_passport` FOREIGN KEY (`passport_id`) REFERENCES `passport` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## payment

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | bigint unsigned | NO | NULL | PRI | auto_increment |  |
| passportId | int | NO | NULL | MUL |  |  |
| provider | enum('yookassa','cloudpayments','tbank','stripe','paypal') | NO | NULL | MUL |  |  |
| providerPaymentId | varchar(255) | YES | NULL |  |  |  |
| status | enum('pending','paid','failed','canceled','refunded') | NO | pending | MUL |  |  |
| amount | int unsigned | NO | NULL |  |  | Стоимость в минимальных единицах (копейки, центы) |
| currency | char(3) | NO | RUB |  |  |  |
| targetType | enum('idea','meet','project') | NO | NULL | MUL |  |  |
| targetId | bigint unsigned | NO | NULL |  |  |  |
| metadata | json | YES | NULL |  |  |  |
| paidAt | datetime | YES | NULL |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| updatedAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |  |
| userId | int | NO | NULL |  |  |  |
| description | varchar(255) | YES | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| idx_payment_passport | Нет | 1 | passportId | NULL | BTREE |
| idx_payment_provider | Нет | 1 | provider | NULL | BTREE |
| idx_payment_provider | Нет | 2 | providerPaymentId | NULL | BTREE |
| idx_payment_status | Нет | 1 | status | NULL | BTREE |
| idx_payment_target | Нет | 1 | targetType | NULL | BTREE |
| idx_payment_target | Нет | 2 | targetId | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_payment_passport | passportId | passport | id | NO ACTION | CASCADE |

### DDL

```sql
CREATE TABLE `payment` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `passportId` int NOT NULL,
  `provider` enum('yookassa','cloudpayments','tbank','stripe','paypal') NOT NULL,
  `providerPaymentId` varchar(255) DEFAULT NULL,
  `status` enum('pending','paid','failed','canceled','refunded') NOT NULL DEFAULT 'pending',
  `amount` int unsigned NOT NULL COMMENT 'Стоимость в минимальных единицах (копейки, центы)',
  `currency` char(3) NOT NULL DEFAULT 'RUB',
  `targetType` enum('idea','meet','project') NOT NULL,
  `targetId` bigint unsigned NOT NULL,
  `metadata` json DEFAULT NULL,
  `paidAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `userId` int NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payment_passport` (`passportId`),
  KEY `idx_payment_status` (`status`),
  KEY `idx_payment_target` (`targetType`,`targetId`),
  KEY `idx_payment_provider` (`provider`,`providerPaymentId`),
  CONSTRAINT `fk_payment_passport` FOREIGN KEY (`passportId`) REFERENCES `passport` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## place

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| title | varchar(255) | YES | NULL |  |  |  |
| description | varchar(255) | YES | NULL |  |  |  |
| address | varchar(255) | NO | NULL |  |  |  |
| latitude | varchar(255) | NO | NULL |  |  |  |
| longitude | varchar(255) | NO | NULL |  |  |  |
| image | varchar(255) | YES | NULL |  |  |  |
| provider | varchar(255) | YES | NULL | MUL |  |  |
| providerId | bigint | YES | NULL |  |  |  |
| phone | varchar(255) | YES | NULL |  |  |  |
| priceFrom | int | YES | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| place_provider_unique | Да | 1 | provider | NULL | BTREE |
| place_provider_unique | Да | 2 | providerId | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `place` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` varchar(255) NOT NULL,
  `longitude` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `providerId` bigint DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `priceFrom` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `place_provider_unique` (`provider`,`providerId`)
) ENGINE=InnoDB AUTO_INCREMENT=593 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## placeLocation

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| title | varchar(255) | NO | NULL |  |  |  |
| deletedAt | timestamp | YES | NULL |  |  |  |
| placeId | int | NO | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `placeLocation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `placeId` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## placePassport

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| placeId | int | NO | NULL |  |  |  |
| passportId | int | NO | NULL |  |  |  |
| role | enum('admin','teacher') | NO | NULL |  |  |  |
| createdAt | timestamp | NO | now() |  | DEFAULT_GENERATED |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `placePassport` (
  `id` int NOT NULL AUTO_INCREMENT,
  `placeId` int NOT NULL,
  `passportId` int NOT NULL,
  `role` enum('admin','teacher') NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## placeSchedule

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| placeId | int | NO | NULL | MUL |  |  |
| weekday | tinyint | NO | NULL |  |  |  |
| enabled | tinyint(1) | NO | 1 |  |  |  |
| startTime | time | NO | NULL |  |  |  |
| endTime | time | NO | NULL |  |  |  |
| createdAt | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| updatedAt | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |
| uq_placeSchedule | Да | 1 | placeId | NULL | BTREE |
| uq_placeSchedule | Да | 2 | weekday | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_placeSchedule_place | placeId | place | id | NO ACTION | CASCADE |

### DDL

```sql
CREATE TABLE `placeSchedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `placeId` int NOT NULL,
  `weekday` tinyint NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_placeSchedule` (`placeId`,`weekday`),
  CONSTRAINT `fk_placeSchedule_place` FOREIGN KEY (`placeId`) REFERENCES `place` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## project

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| passportId | int | NO | NULL |  |  |  |
| placeId | int | NO | NULL |  |  |  |
| ideaId | int | YES | NULL |  |  |  |
| deletedAt | timestamp | YES | NULL |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| title | varchar(255) | NO | NULL |  |  |  |
| description | text | NO | NULL |  |  |  |
| image | varchar(255) | YES | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `passportId` int NOT NULL,
  `placeId` int NOT NULL,
  `ideaId` int DEFAULT NULL,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## projectUser

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| projectId | int | NO | NULL |  |  |  |
| userId | int | NO | NULL |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `projectUser` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## teacherUser

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| teacherId | int | NO | NULL | MUL |  |  |
| userId | int | NO | NULL |  |  |  |
| createdAt | datetime | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |
| uniq_teacher_user | Да | 1 | teacherId | NULL | BTREE |
| uniq_teacher_user | Да | 2 | userId | NULL | BTREE |

### DDL

```sql
CREATE TABLE `teacherUser` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacherId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_teacher_user` (`teacherId`,`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## user

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| passportId | int | NO | NULL |  |  |  |
| title | varchar(255) | NO | NULL |  |  |  |
| description | text | NO | NULL |  |  |  |
| age | int | YES | NULL |  |  |  |
| image | varchar(255) | YES | NULL |  |  |  |
| createdAt | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| deletedAt | timestamp | YES | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `passportId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `age` int DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## Триггеры

Нет доступных объектов.

## Процедуры и функции

Нет доступных объектов.

## События

Нет доступных объектов.
