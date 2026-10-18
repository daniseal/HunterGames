FROM nginx:stable-alpine

COPY *.html main.css Mvc.js /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY img/ /usr/share/nginx/html/img/
COPY js/ /usr/share/nginx/html/js/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD wget -q -O /dev/null http://127.0.0.1/index.html || exit 1
