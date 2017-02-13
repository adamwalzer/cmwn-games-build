FROM ubuntu:14.04
MAINTAINER Chuck "MANCHUCK" Reeves <chuck@manchuck.com>

RUN apt-get update && apt-get install -y \
    nginx openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -newkey rsa:2048 \
      -subj "/C=XX/ST=XXXX/L=XXXX/O=XXXX/CN=api-local.changemyworldnow.com" \
      -keyout "/etc/nginx/ssl/key.pem" \
      -out "/etc/nginx/ssl/cert.crt" \
      -days 3650 -nodes -sha256

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]