/*Clear database*/
DELETE FROM team;

/*Add teams*/
INSERT INTO team (team_number,team_name) VALUES
("3506","Yeti Robotics"),
("4540","Neque Inc."),
("8526","Risus Corp."),
("0", "Guests");

/*Add users*/
INSERT INTO user (user_name,team_number,user_email,user_password,user_admin, user_mentor) VALUES
("Regina Norton","3506","Pellentesque.tincidunt.tempus@etlibero.co.uk","5f4dcc3b5aa765d61d8327deb882cf99",1, 0),
("Vielka Cantu","3506","ultricies@euismod.co.uk","5f4dcc3b5aa765d61d8327deb882cf99",0, 0),
("Odessa Ramirez","3506","felis.purus.ac@rutrumeu.org","5f4dcc3b5aa765d61d8327deb882cf99",0, 0),
("Megan Johnston","3506","semper.egestas@ultricies.net","5f4dcc3b5aa765d61d8327deb882cf99",0, 0),
("Peter Slater","4540","elit@lobortisnisi.co.uk","5f4dcc3b5aa765d61d8327deb882cf99",0, 0),
("Hop Norton","4540","ante@cursus.edu","5f4dcc3b5aa765d61d8327deb882cf99",0, 0),
("Raymond Doyle","4540","ac@ligula.com","5f4dcc3b5aa765d61d8327deb882cf99",0, 0),
("Moana Bradley","8526","a.facilisis.non@DonectinciduntDonec.org","5f4dcc3b5aa765d61d8327deb882cf99",0, 0),
("Aileen Mayo","8526","in.lobortis.tellus@pedesagittisaugue.ca","5f4dcc3b5aa765d61d8327deb882cf99",0, 0),
("Nina Guerrero","8526","Donec@utlacusNulla.com","5f4dcc3b5aa765d61d8327deb882cf99",0, 0);

/*Add teams*/
INSERT INTO session (user_id, session_key) VALUES
(1, "ham");