import MintableBurnable from 'images/mintable.svg'
import OneTimeIssuer from 'images/one_time_issuer_token.svg'

const CommunityTypes = [
  {
    label: 'Mintable/Burnable token',
    icon: MintableBurnable,
    value: 'mintableBurnable',
    tooltipText: ` This option allows you, the economy creator, to mint and/or burn tokens at your will. These types of tokens are used for credit or reward points systems that can be used for any company or organization. `
  },
  {
    label: 'One time issued token',
    icon: OneTimeIssuer,
    value: 'basic',
    tooltipText: `This option mints a fixed supply of tokens that cannot be changed. This allows you to create assets which are digitally scarce and can be produced in limited supply.`
  }
]

export default CommunityTypes
