fs = require 'fs'
path = require 'path'
JiraApi = require('jira').JiraApi
config = require path.join process.env.HOME, '.jiraclirc.json'
color = require('ansi-color').set
util = require 'util'


class JiraCli
    constructor: ->
        @jira = new JiraApi('http', config.host, config.port, config.user, config.password, '2')
        @response = null
        @error = null
    getIssue: (issueNum)->
        @jira.findIssue issueNum, (error, issue) =>
            @response = issue
            @error = error

    getMyIssues: (open)->
        @jira.getUsersIssues config.user, open, (error, issueList) =>
            @myIssues = issueList
            @error = error
            for issue in issueList.issues
                sumColor = "green"
                sumColor = "red" if +issue.fields.status.id in [5,6]
                process.stdout.write color(issue.id, sumColor)
                process.stdout.write " - "
                process.stdout.write issue.fields.summary
                process.stdout.write "\n"
                #console.log color(issue.fields.status, "green")

module.exports = {
    JiraCli
}
