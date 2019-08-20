import request from 'superagent'

export const fetchImage = (apiRoot, { hash }) =>
  request.get(`${apiRoot}/images/${hash}`)
    .then(response => response.body)

export const imageUpload = (apiRoot, { image }) => {
  const formData = new window.FormData()
  formData.append('image', image)
  return request.post(`${apiRoot}/images`)
    .send(formData)
    .then(response => response.body)
}

export const uploadImage = ({ image }) => {
  return request.post('https://ipfs.infura.io:5001/api/v0/add')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .attach('path', image)
}
