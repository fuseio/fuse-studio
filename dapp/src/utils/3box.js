
export const addUser = (box, data) => {

}

export const userPublicFields = [
  'name',
  'account',
  'image',
  'address'
]

export const businessPublicFields = [
  'name',
  'website',
  'account',
  'image',
  'coverPhoto',
  'type',
  'address'
]

export const privateFields = [
  'email',
  'phoneNumber',
  'address'
]

export const getPublicData = (data) => {
  return data && data.type === 'user' ? userPublicFields.reduce((fields, field) =>
    data.hasOwnProperty(field) ? ({ ...fields, [field]: data[field] }) : fields,
  {}) : businessPublicFields.reduce((fields, field) =>
    data.hasOwnProperty(field) ? ({ ...fields, [field]: data[field] }) : fields,
  {})
}

export const getPrivateData = (data) => {
  return privateFields.reduce((fields, field) =>
    data.hasOwnProperty(field) ? ({ ...fields, [field]: data[field] }) : fields,
  {})
}

export const separateData = (data) => ({ publicData: getPublicData(data), privateData: getPrivateData(data) })
