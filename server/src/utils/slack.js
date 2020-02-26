const slack = require('@services/slack')

const notify = (msg) => {
  slack.notify(`${msg}`, (err, data) => {
    if (err) {
      console.error(`Slack notification`, err)
    } else {
      console.log(`Slack notification`, data)
    }
  })
}

module.exports = {
  notify
}
