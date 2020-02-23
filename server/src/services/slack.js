const Slack = require('node-slackr')
const config = require('config')

const slack = new Slack(config.get('slack.incomingWebhookURL'), {
  channel: `#${config.get('slack.channel')}`,
  username: `${config.get('slack.channel')}-bot`,
  icon_emoji: `:warning:`
})

module.exports = slack
