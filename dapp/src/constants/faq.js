import React from 'react'
import { FormattedMessage } from 'react-intl';

export default (() => {
  return [
    {
      question: <FormattedMessage defaultMessage='What is Fuse?' />,
      answer: <FormattedMessage defaultMessage={`The Fuse Studio is a smart contract platform intended for entrepreneurs.`} />,
      link: 'https://docs.fuse.io/the-fuse-studio/faq#what-is-fuse'
    },
    {
      question: <FormattedMessage defaultMessage='How much does it cost to launch an economy on Fuse?' />,
      answer: <FormattedMessage defaultMessage={`The only cost of launching an economy on Fuse is paying Ethereum gas prices.`} />,
      link: 'https://docs.fuse.io/the-fuse-studio/faq#how-much-does-it-cost-to-launch-an-economy-on-fuse'
    },
    {
      question: <FormattedMessage defaultMessage='What are some use cases for Fuse?' />,
      answer: <FormattedMessage defaultMessage={`There are many different parties who can benefit from launching their own digital economy.`} />,
      link: 'https://docs.fuse.io/the-fuse-studio/faq#what-are-some-use-cases-for-fuse'
    },
    {
      question: <FormattedMessage defaultMessage='How do I create an economy on Fuse?' />,
      answer: <FormattedMessage defaultMessage={`Check out our video tutorial to the right!`} />
    }
  ]
})()
