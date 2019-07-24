import { useState } from 'react'
import request from 'superagent'

const useFetch = (url, { verb = 'get' }) => {
  const [data, setData] = useState([])

  const [loading, setLoading] = useState(true)

  async function fetchData () {
    const response = await request[verb](url)
    const json = await response.body
    setData(json)
    setLoading(false)
  }

  return [data, loading, fetchData]
}
export { useFetch }
