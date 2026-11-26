# Dice-Mice! i en container
# Flerspiller-serveren (server.js) kjører med Node, og viser spillfilene i public/.
#
# Bygg:  docker build -t dice-mice .
# Kjør:  docker run --rm -p 3000:3000 dice-mice
# Åpne:  http://localhost:3000

FROM node:22-alpine

WORKDIR /app

# Pakkene først: da kan Docker gjenbruke dette laget så lenge package.json og package-lock.json ikke endres
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Bare serveren og spillfilene kopieres inn (ikke .git, .claude, skjermbilder/ osv.)
COPY server.js spillregler.js ./
COPY public/ ./public/

ENV NODE_ENV=production
EXPOSE 3000

# Kjører som brukeren «node», ikke root
USER node
CMD ["node", "server.js"]
