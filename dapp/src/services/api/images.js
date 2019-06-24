import request from 'superagent'

export const fetchImage = (apiRoot, { hash }) =>
  request.get(`${apiRoot}/images/${hash}`)
    .then(response => response.body)

export const uploadImage = ({ image }) => {
  console.log('image: ', image)
  return request.post(`${'https://ipfs.infura.io:5001/api/v0/add'}`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    // .attach()
    .attach('path', image)
    // .then(response => response.json)
}
