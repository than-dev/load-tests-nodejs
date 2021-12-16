api/up:
	sudo docker-compose up -d --build

api/status:
	sudo docker-compose ps -a

api/restart:
	sudo docker-compose down && sudo docker-compose up -d --build

api/stop:
	sudo docker-compose stop

api/down:
	sudo docker-compose down

test/local:
	k6 run tests/loadtest/index.js

test/docker:
	sudo docker-compose run --rm k6 run --out influxdb=http://influxdb:8086/resultsdb /tests/load-test/index.js