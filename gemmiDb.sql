create database gemmi;
DROP DATABASE gemmi;
use gemmi;

drop table gemmi;

CREATE TABLE virtualGame ( 
	useridx int primary key auto_increment, 
    username varchar(20) NOT NULL, 
    Score integer, 
    createdAt datetime not null default now()
);

CREATE TABLE WordGame (
	useridx int primary key auto_increment, 
    username varchar(20) NOT NULL, 
    Score integer, 
    createdAt datetime not null default now()
);

select * from gemmi;
select * from WordGame;
select * from virtualGame;