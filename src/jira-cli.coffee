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
        @jira.findIssue issueNum, (error, response) =>
            if response?
                @response = response
                @prettyPrintIssue response
            else
                @error = error if error?
                console.log color("Error finding issue: #{error}", "red")

    prettyPrintIssue: (issue)->
        sumColor = "green"
        sumColor = "red" if +issue.fields.status.id in [5,6]
        process.stdout.write color(issue.id, sumColor)
        process.stdout.write " - "
        process.stdout.write issue.fields.summary
        process.stdout.write "\n"

    addIssue: (summary, description, issueType) ->
        # Bug == 1
        # New Feature == 2
        # Improvement == 4
        newIssue =
            fields:
                project: { id:config.project }
                summary: summary
                issuetype: { id:issueType }
                assignee: { name:config.user }
                description: description
        #console.log JSON.stringify(newIssue)

        @jira.addNewIssue newIssue, (error, response) =>
            if response?
                @response = response if response?
                console.log "Issue #{response.key} has been #{color("created", "green")}"
            else
                @error = error if error?
                console.log color("Error creating issue: #{JSON.stringify(error)}", "red")

            process.exit()

    deleteIssue: (issueNum)->
        # Don't have permissions currently
        @jira.deleteIssue issueNum, (error, response) =>
            if response?
                @response = response
                console.log "Issue #{issueNum} was #{color("deleted", "green")}"
            else
                @error = error if error?
                console.log color("Error deleting issue: #{error}", "red")

    resolveIssue: (issueNum)->
        # resolved == 5
        # closed == 6
        issueUpdate =
            transition:
                id:5
        @jira.transitionIssue issueNum, issueUpdate, (error, response) =>
            if response?
                @response = response
                console.log "Issue #{issueNum} was #{color("resolved", "green")}"
            else
                @error = error if error?
                console.log color("Error resolving issue: #{error}", "red")

    getMyIssues: (open)->
        @jira.getUsersIssues config.user, open, (error, issueList) =>
            if issueList?
                @myIssues = issueList
                for issue in issueList.issues
                    @prettyPrintIssue issue
            else
                @error = error if error?
                console.log color("Error retreiving issues list: #{error}", "red")

module.exports = {
    JiraCli
}
ask = (question, format, callback) ->
    stdin = process.stdin
    stdout = process.stdout
 
    stdin.resume()
    stdout.write(question + ": ")
 
    stdin.once 'data', (data) ->
        data = data.toString().trim()
 
        if format.test data
            callback data
        else
            stdout.write("It should match: "+ format +"\n")
            ask(question, format, callback)

if require.main is module
    argv = (require 'optimist')
        .options('f', {
            alias:'find'
            describe:'Finds the specified Jira ID'
        }).options('a', {
            alias:'add'
            describe:'Allows you to add a new Jira Task'
        }).options('r', {
            alias:'resolve'
            describe:'Allows you to resolve a specific Jira ID'
        }).options('l', {
            alias:'list'
            default: false
            describe:'Lists all your open issues'
        }).options('h', {
            alias:'help'
            describe:'Shows this help message'
            default:false
        }).usage('Usage: $0 -f "EG-143"\n $0 -r "EG-143"')
        .boolean('h')
        .boolean('l')
        .string('f')
        .string('r')

    if argv.argv.help
        argv.showHelp()
        return

    args = argv.argv

    jiraCli = new JiraCli

    if args.l
        jiraCli.getMyIssues true
        return
    else if args.f?
        jiraCli.getIssue args.f
        return
    else if args.r?
        jiraCli.resolveIssue args.r
        return
    else if args.a?
        ask "Summary", /.+/, (summary)->
            ask "Description", /.+/, (description)->
                ask "Type (Bug:1, Feature:2, Improvement:4)", /[1|2|4]/, (type)->
                    jiraCli.addIssue summary, description, type

    else
        argv.showHelp()
        return
