/*Clear database*/
DELETE FROM team;

/*Add teams*/
INSERT INTO team (team_number,team_name) VALUES
("3506","Yeti Robotics"),
("4540","Neque Inc."),
("8526","Risus Corp.");

/*Add users*/
INSERT INTO user (user_id,user_name,team_number,user_email,user_password,user_admin) VALUES
("3506-1","Regina Norton","3506","Pellentesque.tincidunt.tempus@etlibero.co.uk","5f4dcc3b5aa765d61d8327deb882cf99",1),
("3506-2","Vielka Cantu","3506","ultricies@euismod.co.uk","5f4dcc3b5aa765d61d8327deb882cf99",0),
("3506-3","Odessa Ramirez","3506","felis.purus.ac@rutrumeu.org","5f4dcc3b5aa765d61d8327deb882cf99",0),
("3506-4","Megan Johnston","3506","semper.egestas@ultricies.net","5f4dcc3b5aa765d61d8327deb882cf99",0),
("4540-1","Peter Slater","4540","elit@lobortisnisi.co.uk","5f4dcc3b5aa765d61d8327deb882cf99",0),
("4540-2","Hop Norton","4540","ante@cursus.edu","5f4dcc3b5aa765d61d8327deb882cf99",0),
("4540-3","Raymond Doyle","4540","ac@ligula.com","5f4dcc3b5aa765d61d8327deb882cf99",0),
("8526-1","Moana Bradley","8526","a.facilisis.non@DonectinciduntDonec.org","5f4dcc3b5aa765d61d8327deb882cf99",0),
("8526-2","Aileen Mayo","8526","in.lobortis.tellus@pedesagittisaugue.ca","5f4dcc3b5aa765d61d8327deb882cf99",0),
("8526-3","Nina Guerrero","8526","Donec@utlacusNulla.com","5f4dcc3b5aa765d61d8327deb882cf99",0);

/*Add teams*/
INSERT INTO session (user_id,session_key) VALUES
("3506-1","ham");