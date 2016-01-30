/*Clear database*/
DELETE FROM team;

/*Add teams*/
INSERT INTO team (team_number,team_name) VALUES
("3506","Yeti Robotics"),
("4540","Neque Inc."),
("8526","Risus Corp.");

/*Add users*/
INSERT INTO user (user_id,user_name,team_number,user_email,user_password) VALUES
("3506-1","Regina Norton","3506","Pellentesque.tincidunt.tempus@etlibero.co.uk","ZTZ62NGR4EF"),
("3506-2","Vielka Cantu","3506","ultricies@euismod.co.uk","TRL84OQP6OG"),
("3506-3","Odessa Ramirez","3506","felis.purus.ac@rutrumeu.org","VZV00BFD9GB"),
("3506-4","Megan Johnston","3506","semper.egestas@ultricies.net","KNK77ESF1AA"),
("4540-1","Peter Slater","4540","elit@lobortisnisi.co.uk","ZUK84LZK4MF"),
("4540-2","Hop Norton","4540","ante@cursus.edu","KUB90ZCT0DT"),
("4540-3","Raymond Doyle","4540","ac@ligula.com","YDF17DCP5RD"),
("8526-1","Moana Bradley","8526","a.facilisis.non@DonectinciduntDonec.org","SMG21PNQ6CB"),
("8526-2","Aileen Mayo","8526","in.lobortis.tellus@pedesagittisaugue.ca","JYG39MSU8YO"),
("8526-3","Nina Guerrero","8526","Donec@utlacusNulla.com","FNC00SCD7XH");