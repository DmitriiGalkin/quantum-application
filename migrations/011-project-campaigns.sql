CREATE TABLE IF NOT EXISTS `projectCampaign` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `creatorPassportId` int NOT NULL,
  `initiator` enum('teacher','place') NOT NULL,
  `channel` varchar(120) NOT NULL,
  `token` char(36) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_campaign_token` (`token`),
  KEY `idx_project_campaign_project` (`projectId`),
  CONSTRAINT `fk_project_campaign_project` FOREIGN KEY (`projectId`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `projectCampaignVisit` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `campaignId` int NOT NULL,
  `visitorId` char(36) NOT NULL,
  `visitedOn` date NOT NULL,
  `visitedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_campaign_visitor_day` (`campaignId`,`visitorId`,`visitedOn`),
  KEY `idx_campaign_visit_visitor` (`visitorId`,`visitedAt`),
  CONSTRAINT `fk_project_campaign_visit_campaign` FOREIGN KEY (`campaignId`) REFERENCES `projectCampaign` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `projectCampaignBooking` (
  `meetUserId` int NOT NULL,
  `campaignId` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`meetUserId`),
  KEY `idx_campaign_booking_campaign` (`campaignId`),
  CONSTRAINT `fk_campaign_booking_meet_user` FOREIGN KEY (`meetUserId`) REFERENCES `meetUser` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_campaign_booking_campaign` FOREIGN KEY (`campaignId`) REFERENCES `projectCampaign` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
