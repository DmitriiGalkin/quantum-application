CREATE TABLE conversationPassport (
                                         conversationId INT UNSIGNED NOT NULL,
                                         passportId INT UNSIGNED NOT NULL,

                                         lastReadAt DATETIME NULL,

                                         isArchived BOOLEAN NOT NULL DEFAULT FALSE,
                                         isMuted BOOLEAN NOT NULL DEFAULT FALSE,

                                         createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                         PRIMARY KEY (conversationId, passportId),

                                         CONSTRAINT fk_conversationPassport_conversation
                                             FOREIGN KEY (conversationId)
                                                 REFERENCES conversation(id)
                                                 ON DELETE CASCADE
);

CREATE TABLE message2 (
                         id INT UNSIGNED NOT NULL AUTO_INCREMENT,

                         conversationId INT UNSIGNED NOT NULL,
                         senderPassportId INT UNSIGNED NOT NULL,

                         text TEXT NOT NULL,

                         createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                         editedAt DATETIME NULL,
                         deletedAt DATETIME NULL,

                         PRIMARY KEY (id),

                         KEY idx_message_conversation (conversationId, createdAt),

                         CONSTRAINT fk_message_conversation
                             FOREIGN KEY (conversationId)
                                 REFERENCES conversation(id)
                                 ON DELETE CASCADE
);