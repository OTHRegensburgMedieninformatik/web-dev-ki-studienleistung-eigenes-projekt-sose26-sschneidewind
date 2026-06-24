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
	password text not null,
	lat decimal(10,7),
	long decimal(10,7)
);

insert into users(email, name, surname, street, postal_code, city, country, password) values
	('max_mustermann@gmail.com', 'Max', 'Mustermann', 'Schubertstraße 24', 93053, 'Regensburg', 'Germany', '999'),
	('moritz_mustermann@gmail.com', 'Moritz', 'Mustermann', 'Schubertstraße 25', 93053, 'Regensburg', 'Germany', '123456789'),
	('mina_mustermann@gmail.com', 'Mina', 'Mustermann', 'Schubertstraße 30', 93053, 'Regensburg', 'Germany', '147258369'),
	('info@mini_napoli.de', 'Mini', 'Napoli', 'Fikentscherstraße 2', 93051, 'Regensburg', 'Germany', '123'),
	('test@g.de', 'Tester', 'McTestFace', 'Holzheimer Straße 2', 93183, 'Kallmünz', 'Germany', '1');

create table restaurants(
	id serial primary key,
	name text not null,
	street text not null,
	postal_code int not null,
	city text not null,
	country text not null,
	image text,
	lat decimal(10,7),
	long decimal(10,7)
);

insert into restaurants(name, street, postal_code, city, country, image) values
	('Luigis Pizzeria', 'Ägidienplatz 1', 93047, 'Regensburg', 'Germany', '/1.png'),
	('Marios Nudel Restaurant', 'Friedrich-Ebert-Straße 15', 93051, 'Regensburg', 'Germany', '/2.png'),
	('The not-leaky Cauldron', 'Burgunderstraße 25', 93053, 'Regensburg', 'Germany', '/no_image.png'),
	('Mini Napoli', 'Fikentscherstraße 2', 93051, 'Regensburg', 'Germany', '/no_image.png'),
	('Waluigis Pizzeria', 'Mulzgasse 5', 93183, 'Kallmünz', 'Germany', '/no_image.png'),
	('Warios Italian Cuisine', 'Ecksteingäßchen 9', 93183, 'Kallmünz', 'Germany', '/no_image.png');

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
	(3, 'Asian'),
	(4, 'Pizza'),
	(4, 'Salads'),
	(4, 'Lasagna'),
	(4, 'Drinks'),
	(5, 'Pizza'),
	(5, 'Lasagna'),
	(5, 'Cocktails'),
	(6, 'Gnocchi'),
	(6, 'Lasagna'),
	(6, 'Drinks'),
	(6, 'Bruschetta');

create table dishes(
	r_id int references restaurants(id),
	d_id int, check(d_id > 0),
	primary key (d_id, r_id),
	name text not null,
	price decimal(6,2) not null,
	description text,
	image text
);

insert into dishes(name, r_id, d_id, price, description, image) values
	('Pizza Margherita', 1, 1, 5.99, 'Tomato Sauce, Mozzarella', '/1/1.png'),
	('Pizza Tonno', 1, 2, 7.99, 'Tomato Sauce, Mozzarella, Tuna, Onions', '/1/2.png'),
	('Noodles Red and White', 2, 1, 3.99, 'Noodles with Ketchup and Mayonnaise', '/2/1.png'),
	('Spaghetti Carbonara', 2, 2, 5.99, 'Spaghetti with a creamy sauce and diced ham', '/no_image.png'),
	('Soup Soup Soup', 3, 1, 9.99, 'Special Soup... Let us surprise you!', '/3/1.png'),
	('Leaky House Soup', 3, 2, 7.99, 'Leaky Soup', '/no_image.png'),
	('House Leaky Soup', 3, 3, 8.99, 'Soup of the House', '/no_image.png');

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
	(3, 2, 4, 'It was interesting to eat these noodles... Certainly special!'),
	(4, 5, 5, 'Waaaah!');

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
