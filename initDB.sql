DROP DATABASE IF EXISTS idlebattle;
CREATE DATABASE IF NOT EXISTS idlebattle;

use idlebattle;

CREATE TABLE IF NOT EXISTS User (
  idUser VARCHAR(36) NOT NULL,
  typeUser SMALLINT(1) NOT NULL,
  email VARCHAR(320),
  hashedPassword VARCHAR(128),
  salt VARCHAR(12),
  PRIMARY KEY (idUser)
);

CREATE TABLE IF NOT EXISTS Hero (
  idHero CHAR(36) NOT NULL,
  firstName VARCHAR(30) NOT NULL,
  rankLvl TINYINT(255) UNSIGNED NOT NULL,
  skillPoint TINYINT(255) UNSIGNED NOT NULL,
  health TINYINT(255) UNSIGNED NOT NULL,
  attack TINYINT(255) UNSIGNED NOT NULL, 
  defense TINYINT(255) UNSIGNED NOT NULL,
  magik TINYINT(255) UNSIGNED NOT NULL,
  idUser VARCHAR(36) NOT NULL,
  FOREIGN KEY(idUser) REFERENCES User(idUser),
  PRIMARY KEY (idHero)
);

CREATE TABLE IF NOT EXISTS Fight (
  idFight CHAR(36) NOT NULL,
  idHero CHAR(36) NOT NULL,
  opponentName VARCHAR(30) NOT NULL,
  result SMALLINT(1) NOT NULL,
  dateFight DATETIME NOT NULL,
  report VARCHAR(2000),
  FOREIGN KEY(idHero) REFERENCES Hero(idHero),
  PRIMARY KEY (idFight)
);

-- delimiter |
-- INSERT INTO User (idUser, typeUser, email, hashedPassword, salt) VALUES ('383202e8-2841-43e9-9764-ee9acce87783', 1, 'tchiichan@orange.fr', '5a3f1b4aaf6c9a482aa01e42735fa7c57079ceaf9e04c91054cf848cd0cbbfccf8d66d10676109f0b2bf15c69e1e37bee2d75af5406069a79b3fbedac5c61652', '72bb96a52f69');
-- INSERT INTO Hero (idHero, firstName, rankLvl, skillPoint, health, attack, defense, magik, idUser) VALUES ('a5416918-a08f-4297-a1f7-4a7b85db02b4', 'GON', 5, 0, 15, 10, 5, 3, '383202e8-2841-43e9-9764-ee9acce87783');
-- |
-- delimiter ;

-- delimiter |
-- DELETE FROM Fight;
-- DELETE FROM Hero;
-- DELETE FROM User;
-- delimiter ;

