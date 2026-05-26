drop table if exists restaurant_ratings;
drop table if exists dish_ratings;
drop table if exists users;
drop table if exists keywords;
drop table if exists dishes;
drop table if exists restaurants;

create table users(
	id serial primary key,
	email text unique not null check (email like '%@%.%'),
	name text not null,
	surname text not null,
	street text not null,
	postal_code int not null,
	city text not null,
	country text not null,
	password text not null
);

insert into users(email, name, surname, street, postal_code, city, country, password) values
	('max_mustermann@gmail.com', 'Max', 'Mustermann', 'Schubertstraße 24', 93053, 'Regensburg', 'Deutschland', '987654321'),
	('moritz_mustermann@gmail.com', 'Moritz', 'Mustermann', 'Schubertstraße 25', 93053, 'Regensburg', 'Deutschland', '123456789'),
	('mina_mustermann@gmail.com', 'Mina', 'Mustermann', 'Schubertstraße 30', 93053, 'Regensburg', 'Deutschland', '147258369'),
	('info@mini_napoli.de', 'Mini', 'Napoli', 'Fikentscherstraße 2', 93051, 'Regensburg', 'Deutschland', '123');

create table restaurants(
	id serial primary key,
	name text not null,
	street text not null,
	postal_code int not null,
	city text not null,
	country text not null
);

insert into restaurants(name, street, postal_code, city, country) values
	('Luigis Pizzeria', 'Ägidienplatz 1', 93047, 'Regensburg', 'Germany'),
	('Marios Nudel Restaurant', 'Friedrich-Ebert-Straße 15', 93051, 'Regensburg', 'Deutschland'),
	('The not-leaky Cauldron', 'Burgunderstraße 25', 93053, 'Regensburg', 'Deutschland'),
	('Mini Napoli', 'Fikentscherstraße 2', 93051, 'Regensburg', 'Deutschland');

create table keywords(
	r_id int references restaurants(id),
	keyword text,
	primary key (r_id, keyword)
);

insert into keywords (r_id, keyword) values
	(1, 'Pizza'),
	(1, 'Pasta'),
	(1, 'Cocktails'),
	(2, 'Pasta'),
	(2, 'Drinks'),
	(3, 'Soup'),
	(3, 'Drinks'),
	(3, 'Asian');

create table dishes(
	r_id int references restaurants(id),
	d_id int, check(d_id > 0),
	primary key (d_id, r_id),
	name text not null,
	price decimal(6,2) not null,
	description text
);

insert into dishes(name, r_id, d_id, price, description) values
	('Pizza Margherita', 1, 1, 5.99, 'Tomato Sauce, Mozzarella'),
	('Pizza Tonno', 1, 2, 7.99, 'Tomato Sauce, Mozzarella, Tuna, Onions'),
	('Noodles Red and White', 2, 1, 3.99, 'Noodles with Ketchup and Mayonnaise'),
	('Spaghetti Carbonara', 2, 2, 5.99, 'Spaghetti with a creamy sauce and diced ham'),
	('Soup Soup Soup', 3, 1, 9.99, 'Special Soup... Let us surprise you!'),
	('Leaky House Soup', 3, 2, 7.99, 'Leaky Soup'),
	('House Leaky Soup', 3, 3, 8.99, 'Soup of the House');

create table restaurant_ratings(
	u_id int references users(id),
	r_id int references restaurants(id),
	primary key (u_id, r_id),
	stars int not null, check (stars >= 0 and stars <= 5),
	text text,
	time timestamptz not null default now ()
);

insert into restaurant_ratings(u_id, r_id, stars, text) values
	(1, 1, 4, 'Great Pizza but not tso great staff'),
	(1, 2, 2, 'The Noodles were cold...'),
	(2, 1, 5, 'Everything was perfect!'),
	(2, 3, 4, 'The soups were truly... inspirational'),
	(3, 2, 4, 'It was interesting to eat these noodles... Certainly special!');

create table dish_ratings(
	u_id int references users(id),
	r_id int,
	d_id int, 
	foreign key (r_id, d_id) references dishes(r_id, d_id),
	primary key (u_id, r_id, d_id),
	stars int not null, check (stars >= 0 and stars <= 5),
	text text,
	time timestamptz not null default now ()
);

insert into dish_ratings(u_id, r_id, d_id, stars, text) values 
	(1, 1, 1, 5, 'The best Pizza I ever ate!'),
	(1, 2, 1, 2, 'The noodles were not great to say the least'),
	(2, 1, 1, 4, 'Really great pizza, but I had better'),
	(2, 3, 1, 3, 'The soup was truly... a surprise...'),
	(4, 3, 1, 5, 'There was a fly in the soup, good protein :)');


select * from users;
/*
select * from restaurants;

select * from dishes

select users.name, restaurants.name, restaurant_ratings.stars 
from users join restaurant_ratings on restaurant_ratings.u_id = users.id join restaurants on restaurant_ratings.r_id = restaurants.id;

select users.name, restaurants.name, dishes.name, dish_ratings.stars, dish_ratings.text
from users join dish_ratings on users.id = dish_ratings.u_id
		   join restaurants on dish_ratings.r_id = restaurants.id
		   join dishes on dishes.r_id = restaurants.id
where dish_ratings.d_id = dishes.d_id;

select avg(stars) as average_rating, dishes.name, restaurants.name
from users join dish_ratings on users.id = dish_ratings.u_id
		   join restaurants on dish_ratings.r_id = restaurants.id
		   join dishes on dishes.r_id = restaurants.id
where dish_ratings.d_id = dishes.d_id
group by dishes.name, restaurants.id;

select  * from dishes where r_id=3;

select max(d_id) as max_id from dishes where r_id = 1;
select max(d_id) as max_id from dishes where r_id = 4;
select max(d_id) as max_id from dishes where r_id = 5;

insert into dishes(name, r_id, d_id, price, description) values 
('new_dish', 4, (select coalesce(max(d_id),0)+1 from dishes where r_id = 4), 5.99, 'some dish');

select dishes.r_id as rest_id, dishes.d_id as dish_id, stars, text as string, time, restaurants.name as restaurant, dishes.name as dish
from dish_ratings 
join dishes on (dish_ratings.d_id = dishes.d_id) and (dish_ratings.r_id = dishes.r_id)
join restaurants on dish_ratings.r_id = restaurants.id
where u_id=2;

select r_id as rest_id, stars, text as string, time, name as restaurant
from restaurant_ratings 
join restaurants on restaurant_ratings.r_id = restaurants.id
where u_id=1;

select * from restaurant_ratings where u_id = 1;
select avg(stars) as avg_stars from dish_ratings where r_id=3 and d_id=1 group by d_id;

select * from restaurant_ratings where r_id=1
*/