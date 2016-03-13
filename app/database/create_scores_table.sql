CREATE TABLE Scores(
  id int auto_increment,
  pseudo varchar(30),
  score int,
  CONSTRAINT pkScores PRIMARY KEY(id)
) DEFAULT charset=utf8;