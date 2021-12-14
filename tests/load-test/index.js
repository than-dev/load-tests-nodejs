import http from "k6/http";
import { Trend, Counter } from "k6/metrics";

// metrics
const IODuration = new Trend('x-request-delay')
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
}

// options
export const options = {
    stages: [
        { target: 1, duration: '3s' },
        { target: 2, duration: '3s' },
        { target: 1, duration: '3s' }
    ]
}

// executions
export default () => {
    const BASE_URL = 'http://localhost:3000'

    const response = http.get(`${BASE_URL}/hello`)

    report(response)
}