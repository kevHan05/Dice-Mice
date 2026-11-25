# Dice-Mice! i en container
# Spillet er bare vanlig HTML, CSS og JavaScript, så det trengs ingen bygging –
# en liten nginx-webserver viser filene.
#
# Bygg:  docker build -t dice-mice .
# Kjør:  docker run --rm -p 8080:80 dice-mice
# Åpne:  http://localhost:8080

FROM nginx:1.27-alpine

# Bare spillfilene kopieres inn (ikke .git, .claude, skjermbilder/ osv.)
COPY index.html style.css game.js favicon.svg /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80
