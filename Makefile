api/start:
	sudo docker-compose up -d

api/status:
	sudo docker-compose ps -a

api/restart:
	sudo docker-compose down && sudo docker-compose up -d

api/stop:
	sudo docker-compose stop

api/down:
	sudo docker-compose down

test/local:
	k6 run tests/loadtest/index.js

test/docker:
	sudo docker run --net=host -i loadimpact/k6 run - <tests/load-test/index.js