# Структура базы данных MySQL

Дата выгрузки: 2026-10-16T21:44:49.683Z

Выгружены только метаданные доступных объектов; строки таблиц и реквизиты подключения не включены.

Таблицы и представления: 28.

## Объекты

| Название | Тип | Движок | Сопоставление | Комментарий |
| --- | --- | --- | --- | --- |
| appNotification | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| conversation | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| conversationPassport | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| demoSeedRecord | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| idea | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| ideaPhoto | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| ideaUser | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| meet | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| meetBookingChange | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| meetChangeParticipant | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| meetUser | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| message2 | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| passport | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| passport_session | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| payment | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| paymentRefund | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| place | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| placeLocation | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| placeLocationPhoto | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| placePassport | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| placeRental | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| placeSchedule | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| project | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| projectUser | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| pushSubscription | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| quantumMigration | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| teacherUser | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |
| user | BASE TABLE | InnoDB | utf8mb4_0900_ai_ci |  |

## appNotification

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | NULL | PRI | auto_increment |  |
| passportId | int unsigned | NO | NULL | MUL |  |  |
| eventKey | varchar(190) | NO | NULL |  |  |  |
| title | varchar(255) | NO | NULL |  |  |  |
| body | text | NO | NULL |  |  |  |
| url | varchar(500) | NO | NULL |  |  |  |
| readAt | datetime | YES | NULL |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| pushedAt | datetime | YES | NULL |  |  |  |
| attempts | int unsigned | NO | 0 |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| ix_notification_event | Да | 1 | passportId | NULL | BTREE |
| ix_notification_event | Да | 2 | eventKey | NULL | BTREE |
| ix_notification_unread | Нет | 1 | passportId | NULL | BTREE |
| ix_notification_unread | Нет | 2 | readAt | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `appNotification` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `passportId` int unsigned NOT NULL,
  `eventKey` varchar(190) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `url` varchar(500) NOT NULL,
  `readAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pushedAt` datetime DEFAULT NULL,
  `attempts` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_notification_event` (`passportId`,`eventKey`),
  KEY `ix_notification_unread` (`passportId`,`readAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
| lastDeliveredMessageId | int unsigned | YES | NULL |  |  |  |
| lastReadMessageId | int unsigned | YES | NULL |  |  |  |

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
  `lastDeliveredMessageId` int unsigned DEFAULT NULL,
  `lastReadMessageId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`conversationId`,`passportId`),
  CONSTRAINT `fk_conversationPassport_conversation` FOREIGN KEY (`conversationId`) REFERENCES `conversation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## demoSeedRecord

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| seedKey | varchar(64) | NO | NULL | PRI |  |  |
| entityType | varchar(32) | NO | NULL | PRI |  |  |
| entityKey | varchar(128) | NO | NULL | PRI |  |  |
| recordId | int | NO | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| demo_record_unique | Да | 1 | entityType | NULL | BTREE |
| demo_record_unique | Да | 2 | recordId | NULL | BTREE |
| PRIMARY | Да | 1 | seedKey | NULL | BTREE |
| PRIMARY | Да | 2 | entityType | NULL | BTREE |
| PRIMARY | Да | 3 | entityKey | NULL | BTREE |

### DDL

```sql
CREATE TABLE `demoSeedRecord` (
  `seedKey` varchar(64) NOT NULL,
  `entityType` varchar(32) NOT NULL,
  `entityKey` varchar(128) NOT NULL,
  `recordId` int NOT NULL,
  PRIMARY KEY (`seedKey`,`entityType`,`entityKey`),
  UNIQUE KEY `demo_record_unique` (`entityType`,`recordId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## idea

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| userId | int | YES | NULL |  |  |  |
| passportId | int | YES | NULL |  |  |  |
| title | varchar(255) | NO | NULL |  |  |  |
| description | text | NO | NULL |  |  |  |
| image | varchar(255) | YES | NULL |  |  |  |
| deletedAt | timestamp | YES | NULL |  |  |  |
| userCount | int | NO | 0 |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| catalogId | varchar(128) | YES | NULL | UNI |  |  |
| cardData | json | YES | NULL |  |  |  |
| catalogMetadata | json | YES | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | id | NULL | BTREE |
| uq_idea_catalogId | Да | 1 | catalogId | NULL | BTREE |

### DDL

```sql
CREATE TABLE `idea` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `passportId` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `userCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `catalogId` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `cardData` json DEFAULT NULL,
  `catalogMetadata` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_idea_catalogId` (`catalogId`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## ideaPhoto

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | varchar(128) | NO | NULL | PRI |  |  |
| ideaId | int | NO | NULL | MUL |  |  |
| position | int unsigned | NO | NULL |  |  |  |
| photoData | json | NO | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| ix_ideaPhoto_ideaId | Нет | 1 | ideaId | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_ideaPhoto_idea | ideaId | idea | id | NO ACTION | CASCADE |

### DDL

```sql
CREATE TABLE `ideaPhoto` (
  `id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `ideaId` int NOT NULL,
  `position` int unsigned NOT NULL,
  `photoData` json NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_ideaPhoto_ideaId` (`ideaId`),
  CONSTRAINT `fk_ideaPhoto_idea` FOREIGN KEY (`ideaId`) REFERENCES `idea` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
| passportId | int | NO | NULL | MUL |  |  |
| price | int | YES | NULL |  |  |  |
| duration | int | YES | NULL |  |  |  |
| status | enum('pending','published','cancelled') | NO | pending |  |  |  |
| startedAt | timestamp | YES | NULL |  |  |  |
| deletedAt | timestamp | YES | NULL |  |  |  |
| placeId | int | NO | NULL |  |  |  |
| locationId | int | YES | NULL | MUL |  |  |
| maxParticipants | int | YES | NULL |  |  |  |
| bookingState | varchar(24) | NO | requested |  |  |  |
| bookingRevision | int unsigned | NO | 0 |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| idx_meet_location_time | Нет | 1 | locationId | NULL | BTREE |
| idx_meet_location_time | Нет | 2 | startedAt | NULL | BTREE |
| idx_meet_teacher_time | Нет | 1 | passportId | NULL | BTREE |
| idx_meet_teacher_time | Нет | 2 | startedAt | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_meet_location | locationId | placeLocation | id | NO ACTION | SET NULL |

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
  `locationId` int DEFAULT NULL,
  `maxParticipants` int DEFAULT NULL,
  `bookingState` varchar(24) NOT NULL DEFAULT 'requested',
  `bookingRevision` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_meet_teacher_time` (`passportId`,`startedAt`),
  KEY `idx_meet_location_time` (`locationId`,`startedAt`),
  CONSTRAINT `fk_meet_location` FOREIGN KEY (`locationId`) REFERENCES `placeLocation` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_meet_max_participants` CHECK (((`maxParticipants` is null) or (`maxParticipants` > 0)))
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## meetBookingChange

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | NULL | PRI | auto_increment |  |
| meetId | int unsigned | NO | NULL | MUL |  |  |
| revision | int unsigned | NO | NULL |  |  |  |
| oldPlaceId | int unsigned | NO | NULL |  |  |  |
| oldLocationId | int unsigned | YES | NULL |  |  |  |
| newPlaceId | int unsigned | NO | NULL |  |  |  |
| newLocationId | int unsigned | YES | NULL |  |  |  |
| reason | varchar(2000) | NO | NULL |  |  |  |
| actorPassportId | int unsigned | NO | NULL |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| ix_meet_change | Да | 1 | meetId | NULL | BTREE |
| ix_meet_change | Да | 2 | revision | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `meetBookingChange` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `meetId` int unsigned NOT NULL,
  `revision` int unsigned NOT NULL,
  `oldPlaceId` int unsigned NOT NULL,
  `oldLocationId` int unsigned DEFAULT NULL,
  `newPlaceId` int unsigned NOT NULL,
  `newLocationId` int unsigned DEFAULT NULL,
  `reason` varchar(2000) NOT NULL,
  `actorPassportId` int unsigned NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_meet_change` (`meetId`,`revision`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## meetChangeParticipant

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| meetId | int unsigned | NO | NULL | PRI |  |  |
| revision | int unsigned | NO | NULL | PRI |  |  |
| userId | int unsigned | NO | NULL | PRI |  |  |
| response | varchar(16) | NO | pending |  |  |  |
| respondedAt | datetime | YES | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | meetId | NULL | BTREE |
| PRIMARY | Да | 2 | revision | NULL | BTREE |
| PRIMARY | Да | 3 | userId | NULL | BTREE |

### DDL

```sql
CREATE TABLE `meetChangeParticipant` (
  `meetId` int unsigned NOT NULL,
  `revision` int unsigned NOT NULL,
  `userId` int unsigned NOT NULL,
  `response` varchar(16) NOT NULL DEFAULT 'pending',
  `respondedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`meetId`,`revision`,`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
) ENGINE=InnoDB AUTO_INCREMENT=425 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
| provider | enum('yookassa','cloudpayments','tbank','stripe','paypal','robokassa') | NO | NULL | MUL |  |  |
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
  `provider` enum('yookassa','cloudpayments','tbank','stripe','paypal','robokassa') NOT NULL,
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

## paymentRefund

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | NULL | PRI | auto_increment |  |
| paymentId | int unsigned | NO | NULL | UNI |  |  |
| status | varchar(20) | NO | queued |  |  |  |
| requestId | varchar(100) | YES | NULL |  |  |  |
| error | varchar(2000) | YES | NULL |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |
| updatedAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| ix_refund_payment | Да | 1 | paymentId | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `paymentRefund` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paymentId` int unsigned NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'queued',
  `requestId` varchar(100) DEFAULT NULL,
  `error` varchar(2000) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_refund_payment` (`paymentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
) ENGINE=InnoDB AUTO_INCREMENT=598 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## placeLocation

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| title | varchar(255) | NO | NULL |  |  |  |
| deletedAt | timestamp | YES | NULL |  |  |  |
| placeId | int | NO | NULL |  |  |  |
| description | text | YES | NULL |  |  |  |
| capacity | int | YES | NULL |  |  |  |
| hourlyRate | decimal(10,2) | YES | NULL |  |  |  |
| rentalEnabled | tinyint(1) | NO | 0 |  |  |  |

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
  `description` text,
  `capacity` int DEFAULT NULL,
  `hourlyRate` decimal(10,2) DEFAULT NULL,
  `rentalEnabled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_room_capacity` CHECK (((`capacity` is null) or (`capacity` > 0))),
  CONSTRAINT `chk_room_rate` CHECK (((`hourlyRate` is null) or (`hourlyRate` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## placeLocationPhoto

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| locationId | int | NO | NULL | MUL |  |  |
| url | varchar(2048) | NO | NULL |  |  |  |
| position | int | NO | NULL |  |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| ix_room_photo | Нет | 1 | locationId | NULL | BTREE |
| ix_room_photo | Нет | 2 | position | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_room_photo | locationId | placeLocation | id | NO ACTION | CASCADE |

### DDL

```sql
CREATE TABLE `placeLocationPhoto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `locationId` int NOT NULL,
  `url` varchar(2048) NOT NULL,
  `position` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_room_photo` (`locationId`,`position`),
  CONSTRAINT `fk_room_photo` FOREIGN KEY (`locationId`) REFERENCES `placeLocation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## placeRental

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int | NO | NULL | PRI | auto_increment |  |
| placeId | int | NO | NULL | MUL |  |  |
| locationId | int | NO | NULL | MUL |  |  |
| passportId | int | NO | NULL | MUL |  |  |
| startedAt | datetime | NO | NULL |  |  |  |
| endedAt | datetime | NO | NULL |  |  |  |
| participants | int | NO | NULL |  |  |  |
| comment | text | NO | NULL |  |  |  |
| status | enum('pending','confirmed','rejected','cancelled') | NO | pending |  |  |  |
| rejectionReason | text | YES | NULL |  |  |  |
| hourlyRate | decimal(10,2) | YES | NULL |  |  |  |
| estimatedTotal | decimal(12,2) | YES | NULL |  |  |  |
| createdAt | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| ix_rental_applicant | Нет | 1 | passportId | NULL | BTREE |
| ix_rental_applicant | Нет | 2 | startedAt | NULL | BTREE |
| ix_rental_place | Нет | 1 | placeId | NULL | BTREE |
| ix_rental_place | Нет | 2 | startedAt | NULL | BTREE |
| ix_rental_room_slot | Нет | 1 | locationId | NULL | BTREE |
| ix_rental_room_slot | Нет | 2 | status | NULL | BTREE |
| ix_rental_room_slot | Нет | 3 | startedAt | NULL | BTREE |
| ix_rental_room_slot | Нет | 4 | endedAt | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_rental_applicant | passportId | passport | id | NO ACTION | NO ACTION |
| fk_rental_place | placeId | place | id | NO ACTION | NO ACTION |
| fk_rental_room | locationId | placeLocation | id | NO ACTION | NO ACTION |

### DDL

```sql
CREATE TABLE `placeRental` (
  `id` int NOT NULL AUTO_INCREMENT,
  `placeId` int NOT NULL,
  `locationId` int NOT NULL,
  `passportId` int NOT NULL,
  `startedAt` datetime NOT NULL,
  `endedAt` datetime NOT NULL,
  `participants` int NOT NULL,
  `comment` text NOT NULL,
  `status` enum('pending','confirmed','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `rejectionReason` text,
  `hourlyRate` decimal(10,2) DEFAULT NULL,
  `estimatedTotal` decimal(12,2) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_rental_room_slot` (`locationId`,`status`,`startedAt`,`endedAt`),
  KEY `ix_rental_applicant` (`passportId`,`startedAt`),
  KEY `ix_rental_place` (`placeId`,`startedAt`),
  CONSTRAINT `fk_rental_applicant` FOREIGN KEY (`passportId`) REFERENCES `passport` (`id`),
  CONSTRAINT `fk_rental_place` FOREIGN KEY (`placeId`) REFERENCES `place` (`id`),
  CONSTRAINT `fk_rental_room` FOREIGN KEY (`locationId`) REFERENCES `placeLocation` (`id`),
  CONSTRAINT `chk_rental_interval` CHECK (((`endedAt` > `startedAt`) and (`endedAt` <= (`startedAt` + interval 24 hour)))),
  CONSTRAINT `chk_rental_participants` CHECK ((`participants` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
| locationId | int | YES | NULL | MUL |  |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| idx_project_location | Нет | 1 | locationId | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### Внешние ключи

| Название | Столбец | Таблица | Столбец назначения | ON UPDATE | ON DELETE |
| --- | --- | --- | --- | --- | --- |
| fk_project_location | locationId | placeLocation | id | NO ACTION | NO ACTION |

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
  `locationId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_project_location` (`locationId`),
  CONSTRAINT `fk_project_location` FOREIGN KEY (`locationId`) REFERENCES `placeLocation` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
) ENGINE=InnoDB AUTO_INCREMENT=352 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## pushSubscription

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | NULL | PRI | auto_increment |  |
| passportId | int unsigned | NO | NULL | MUL |  |  |
| endpoint | text | NO | NULL |  |  |  |
| endpointHash | char(64) | NO | NULL | UNI |  |  |
| subscription | json | NO | NULL |  |  |  |
| createdAt | datetime | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| ix_push_endpoint | Да | 1 | endpointHash | NULL | BTREE |
| ix_push_passport | Нет | 1 | passportId | NULL | BTREE |
| PRIMARY | Да | 1 | id | NULL | BTREE |

### DDL

```sql
CREATE TABLE `pushSubscription` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `passportId` int unsigned NOT NULL,
  `endpoint` text NOT NULL,
  `endpointHash` char(64) NOT NULL,
  `subscription` json NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_push_endpoint` (`endpointHash`),
  KEY `ix_push_passport` (`passportId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## quantumMigration

### Столбцы

| Столбец | Тип | NULL | По умолчанию | Ключ | Дополнительно | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| name | varchar(100) | NO | NULL | PRI |  |  |
| appliedAt | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |  |

### Индексы

| Название | Уникальный | Позиция | Столбец | Длина префикса | Тип |
| --- | --- | --- | --- | --- | --- |
| PRIMARY | Да | 1 | name | NULL | BTREE |

### DDL

```sql
CREATE TABLE `quantumMigration` (
  `name` varchar(100) NOT NULL,
  `appliedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
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
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## Триггеры

Нет доступных объектов.

## Процедуры и функции

Нет доступных объектов.

## События

Нет доступных объектов.
