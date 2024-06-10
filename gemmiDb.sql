create database gemmi;
DROP DATABASE gemmi;
use gemmi;

CREATE TABLE gemmi(
	useridx int primary key auto_increment,
	username varchar(300) NOT NULL unique,
	vitualGame integer,
	wordGame integer
);



select * from gemmi;