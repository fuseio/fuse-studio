const ContractsType = [
  {
    label: 'Bridge to fuse',
    value: true,
    disabled: false,
    text: `A bridge is being used to transfer ERC-20 assets between Ethereum's mainnet and the Fuse sidechain. This action will add your token to the list of assets the bridge support.`,
    key: 'bridge',
    readOnly: true
  },
  {
    label: 'Members list',
    value: true,
    disabled: false,
    text: `A list that holds the members of the community and allows managing apporved users, add merchants and manage permissions. Managing the list trough a smart contract allows greater flexibility and provides security and transparency out of the box.`,
    key: 'membersList',
    readOnly: true
  },
  {
    label: 'Community contract | coming soon!',
    value: false,
    disabled: true,
    text: `More contracts and features coming soon!`,
    key: null
  }
]

export default ContractsType
