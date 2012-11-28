fs = require 'fs'
path = require 'path'
JiraApi = require('jira').JiraApi
config = require path.join process.env.HOME, '.jiraclirc.json'

class JiraCli
    constructor: ->
        @jira = new JiraApi('http', config.host, config.port, config.user, config.password, '2')
        @response = null
        @error = null
    getIssue: (issueNum)->
        @jira.findIssue (issueNum), (error, issue) =>
            @response = issue
            @error = error

module.exports = {
    JiraCli
}
