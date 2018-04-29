import 'isomorphic-fetch'

const API_ROOT = 'http://localhost:3000/api/v1'


export const fetchMetadata = (metadataHash) => {
  return fetch(`${API_ROOT}/metadata/${metadataHash}`).then(response => response.json())
}
