FROM node:9.5

ENV PORT 3039

RUN apt-get update \
	&& apt-get install -y nodejs npm git git-core \
    && ln -s /usr/bin/nodejs /usr/bin/node

# Adding sources
WORKDIR /home/arisen-blockchain-explorer
COPY . /home/arisen-blockchain-explorer

RUN cd /home/arisen-blockchain-explorer && npm install -g @angular/cli@1.7.1
RUN cd /home/arisen-blockchain-explorer && npm install
RUN cd /home/arisen-blockchain-explorer && ng build --prod
RUN cd /home/arisen-blockchain-explorer && mkdir server/logs

CMD [ "node", "/home/arisen-blockchain-explorer/server/server.js" ]

EXPOSE 3039
EXPOSE 3001
