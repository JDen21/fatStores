create database if not exists  fatStore;

use fatStore;

create table if not exists seller (
    sellerId varchar(64),
    email varchar(128) not null,
    password varchar(512) not null,

    primary key (sellerId),
    unique index (email)
);

create table if not exists designer (
    designerId varchar(64),
    email varchar(128) not null,
    password varchar(512) not null,

    primary key (designerId),
    unique index (email)
);

create table if not exists producer (
    producerId varchar(64),
    email varchar(128) not null,
    password varchar(512) not null,

    primary key (producerId),
    unique index (email)
);

-- list of undesigned products where product designs can be applied
create table if not exists baseProducts (
  productId varchar(64),
  type varchar(64) not null,
  description text,
  createdAt timestamp default current_timestamp,

  primary key(productId)
);

-- list of designed products ready to be sold
create table if not exists  fatStoreProducts (
    designId varchar(64),
    productId varchar(64) not null,
    designerId varchar(64) not null,
    producerId varchar(64),
    name varchar(128) not null,
    description text,
    price decimal(15, 2),
    salesCount int default 0,
    maxSeller int default 0,
    activeSellersCount int default 0,
    onSale boolean default false comment 'if this product is viewable in fatStore',
    requestProducer boolean default false comment 'if this product is looking for a producer',

    primary key(designId),
    index (onSale, producerId),
    -- index (onSale, requestDesigner, name),
    -- index (onSale, requestDesigner, price),
    -- index (onSale, requestDesigner, maxSeller),
    -- index (onSale, salesCount),
    foreign key (productId) references baseProducts(productId),
    foreign key (designerId) references designer(designerId),
    foreign key (producerId) references producer(producerId)
);

-- products in the sellers personal store
create table if not exists sellerProducts (
    sellerId varchar(64),
    designId varchar(64) not null,
    expiry timestamp not null,

    primary key (sellerId, designId),
    index (expiry),
    foreign key (sellerId) references seller(sellerId),
    foreign key (designId) references fatStoreProducts(designId)
);
