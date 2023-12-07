FROM node:lts

WORKDIR /app

COPY config/package.json .

RUN	npm install							\
		react							\
		react-dom						\
		react-spring					\
		socket.io-client				\
	&& npm install --save-dev			\
		css-loader						\
		dotenv-webpack					\
		esbuild-loader					\
		html-webpack-plugin				\
		style-loader					\
		webpack							\
		webpack-cli						\
		webpack-dev-server

COPY config/* .
COPY src/ src/
COPY public/ public/

EXPOSE 3000

CMD [ "/bin/bash", "-c", "npm run start:dev" ]
