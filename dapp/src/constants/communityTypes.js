import MintableBurnable from 'images/mintable.svg'
import OneTimeIssuer from 'images/one_time_issuer_token.svg'

const CommunityTypes = [
  {
    label: 'Mintable/Burnable token',
    icon: MintableBurnable,
    value: 'mintableBurnable',
    tooltipText: `This allows community manager to mint or burn tokens and fully control the token supply. Those types of tokens are used for credit-like or reward systems that can be used by any organization.`
  },
  {
    label: 'One time issued token',
    icon: OneTimeIssuer,
    value: 'basic',
    tooltipText: `Those types of tokens could be minted once and their supply is fixed. This allows to create assets which are digitally scarce and can be produced in limited supply. Usually to achieve a higher level of protection and guarantee no one can create more coins of this type can protect its value and decentralization.`
  }
]

export default CommunityTypes
