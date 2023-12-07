FROM node:lts

RUN npm install -g @nestjs/cli

WORKDIR /app

COPY config/package.json .

RUN	npm install							\
		@nestjs/common					\
		@nestjs/core					\
		@nestjs/platform-express		\
		@nestjs/platform-socket.io		\
		@nestjs/schematics				\
		@nestjs/serve-static			\
		@nestjs/websockets				\
		rxjs							\
		reflect-metadata

COPY config/nest-cli.json .
COPY config/tsconfig.json .
COPY src/ src/

CMD [ "/bin/bash", "-c", "npm run start:dev" ]
