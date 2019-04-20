FROM mcr.microsoft.com/dotnet/core/sdk:2.2 as dotnet

FROM openjdk:13-oracle as openjdk

FROM php:zts-stretch

ENV DOTNET_SDK_VERSION=2.2.203 \
	ASPNETCORE_URLS=http://+:80 \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_USE_POLLING_FILE_WATCHER=true \
    NUGET_XMLDOC_MODE=skip \
    JAVA_HOME=/usr/java/openjdk-13 \
    DOTNET_HOME=/usr/share/dotnet

ENV PATH=$PATH:${JAVA_HOME}/bin:/opt/multithreading

WORKDIR /tmp
EXPOSE 9000

RUN apt update 1>/dev/null && \
	apt install -y --no-install-recommends python 1>/dev/null && \
	find /var/lib/apt/lists -type f -delete && \
	find /var/cache/apt/archives -type f -delete && \
	curl -sSL https://github.com/krakjoe/pthreads/archive/master.tar.gz -o pthreads.tar.gz && \
	curl -sSL https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.xz -o node.tar.xz

RUN mkdir pthreads && tar xf pthreads.tar.gz --strip-components 1 -C pthreads && cd pthreads && \
	phpize && ./configure 1>/dev/null && make 1>/dev/null && make install 1>/dev/null && \
	rm -rf pthreads* && mkdir -p /opt/multithreading && \
	cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini && \
	sed -i 's/memory_limit = .*/memory_limit = 0/g' /usr/local/etc/php/php.ini && \
	echo 'extension=pthreads.so' >> /usr/local/etc/php/php.ini && \
	cd /tmp && \
	tar xf node.tar.xz --strip-components 1 -C /usr
WORKDIR /opt/multithreading
COPY --from=openjdk $JAVA_HOME $JAVA_HOME
COPY --from=dotnet $DOTNET_HOME $DOTNET_HOME
RUN ln -s $DOTNET_HOME/dotnet /usr/bin/dotnet
RUN ln -s /opt/multithreading/run.sh /bin/start
COPY . .

ENV REBUILD=true
ENTRYPOINT ["/usr/bin/node", "/opt/multithreading/run.js", "5000", "2"]
CMD ["/opt/multithreading/run.sh"]
