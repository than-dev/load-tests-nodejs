import { check, sleep } from "k6";
import http from "k6/http";
import { Trend, Counter } from "k6/metrics";

// requests
const get = ({ name, delay } = {}) => {
    const nameParam = name || ''
    const delayParam = delay || ''
    const url = `${config.BASE_URL}/hello/${nameParam}?${delayParam}`
    const response = http.get(url)
    return checks(report(response))
}

// helpers
const randomElement = array => array[Math.floor(Math.random() * array.length)]

const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + 1) + min

// config
const config = {
    BASE_URL: __ENV.LOCAL_API_URL || 'http://api:5000',
    POSSIBLE_NAMES: [
        'nodejs',
        'backend',
        'tests',
        'cd'
    ]
}

// checks
const checks = response => {
    check(response, {
        'response type is JSON': res => res.headers['Content-Type'] && res.headers['Content-Type'].startsWith('application/json'),
        'response body has greet': res => res.json('greet'),
        'response is successful': res => res.status === 200
    })

    return response
}

// metrics
const IODuration = new Trend('x_request_delay')
const ServerError = new Counter('server_errors')

const capitalizeFirst = ([first, ...rest]) => `${first.toUpperCase()}${rest.join('').toLowerCase()}`
const toHeaderName = name => name.split('-').map(capitalizeFirst).join('-')
const getHeader = (name, response) => response.headers[name] || response.headers[toHeaderName(name)]

const report = response => {
    const durationHeader = getHeader('x-request-delay', response)
    const duration = parseFloat(durationHeader)

    if (duration) {
        IODuration.add(duration)
    }

    if (response.status >= 500 && response.status < 600) {
        ServerError.add(1)
    }

    return response
}

// executions
const buildScenario = (exec, startTime) => ({
    exec,
    startTime,
    executor: 'ramping-arrival-rate',
    preAllocatedVUs: 10,
    timeUnit: '1m',
    maxVUs: 20,
    startRate: 100,
    stages: [
        { target: 100, duration: '5m' },
        { target: 200, duration: '5m' },
        { target: 100, duration: '5m' },
        { target: 0, duration: '2m' }
    ]
})

export const rootRequest = () => {
    get()
}

export const namedRequest = () => {
    get({ name: randomElement(config.POSSIBLE_NAMES) })
}

export const expensiveRequest = () => {
    get({
        name: randomElement(config.POSSIBLE_NAMES),
        delay: randomInt(100, 500)
    })
}

// options

export const options = {
    scenarios: {
        root: buildScenario('rootRequest', '0'),
        named: buildScenario('namedRequest', '18'),
        expensive: buildScenario('expensiveRequest', '36'),
    },
    thresholds: {
        server_errors: ['count <= 5'],
        x_request_delay: ['p(95)<=500']
    }
}

// export default () => {
//     get()
//     sleep(randomInt(1, 2))

//     get({ name: randomElement(config.POSSIBLE_NAMES)})
//     sleep(randomInt(1, 2))

//     get({
//         name: randomElement(config.POSSIBLE_NAMES),
//         delay: randomInt(100, 500)
//     })
// }