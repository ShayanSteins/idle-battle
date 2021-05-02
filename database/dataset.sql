-- This file contain some data sets if you want to begin the game faster. 
-- That way, you'll don't have to create fake accounts and heroes, just to fill the pool

delimiter |
INSERT INTO User (idUser, typeUser, email, hashedPassword, salt) VALUES ('383202e8-2841-43e9-9764-ee9acce87783', 1, 'tchiichan@orange.fr', '5a3f1b4aaf6c9a482aa01e42735fa7c57079ceaf9e04c91054cf848cd0cbbfccf8d66d10676109f0b2bf15c69e1e37bee2d75af5406069a79b3fbedac5c61652', '72bb96a52f69');
INSERT INTO Hero (idHero, firstName, rankLvl, skillPoint, health, attack, defense, magik, idUser) VALUES ('a5416918-a08f-4297-a1f7-4a7b85db02b4', 'GON', 5, 0, 15, 10, 5, 3, '383202e8-2841-43e9-9764-ee9acce87783');
|
delimiter ;

delimiter |
DELETE FROM Fight;
DELETE FROM Hero;
DELETE FROM User;
delimiter ;