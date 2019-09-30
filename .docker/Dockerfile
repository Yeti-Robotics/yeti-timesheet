FROM php:5.6.36-apache

COPY . /srv/app
COPY .docker/vhost.config /etc/apache2/sites-available/000-default.conf

WORKDIR /srv/app

RUN docker-php-ext-install mbstring pdo pdo_mysql mysqli \
    && chown -R www-data:www-data /srv/app
