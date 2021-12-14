import http from "k6/http";

// options
export const options = {
    stages =[
        { target: 1, duration: '10s' },
        { target: 2, duration: '10s' },
        { target: 1, duration: '10s' }
    ]
}

// executions
export default () => {
    const BASE_URL = 'http://localhost:3000'

    http.get(`${BASE_URL}/hello`)
}