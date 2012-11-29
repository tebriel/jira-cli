# #Jira Command Line Client#
#
# This client depends on you having a json file in your home directory
# named '.jiraclirc.json' it must contain:
#
#     { 
#         "user": "USERNAME",
#         "password":"PASSWORD",
#         "host":"www.jira.com",
#         "port":80,
#         "project": 10100
#     }
#
# JiraCli is on [github](https://github.com/tebriel/jira-cli)

# Because colors are pretty
color = require('ansi-color').set
PrettyPrinter = require('./pretty-printer').PrettyPrinter
# We're using node-jira-devel, [my version](https://github.com/tebriel/node-jira)
JiraApi = require('node-jira-devel').JiraApi

class JiraCli
    # Builds a new JiraCli with the config file
    constructor: (@config)->
        @jira = new JiraApi('http', @config.host, @config.port, @config.user, @config.password, '2')
        @response = null
        @error = null
        @pp = new PrettyPrinter

    # Searches Jira for the issue number requested
    # this can be either a key AB-123 or just the number 123456
    getIssue: (issueNum)->
        @jira.findIssue issueNum, (error, response) =>
            if response?
                @response = response
                @pp.prettyPrintIssue response
            else
                @error = error if error?
                console.log color("Error finding issue: #{error}", "red")

    # ## Gets a list of all the available issue types ##
    getIssueTypes: (callback)->
        @jira.listIssueTypes (error, response) =>
            if response?
                callback response
            else
                console.log color("Error listing issueTypes: #{error}", "red")
                process.exit()

    # Takes in a summary, description, and issue type (1, 2, and 4 on my
    # servers) and creates a new issue, populating from your config file
    addIssue: (summary, description, issueType, project) ->
        newIssue =
            fields:
                project: { id:project }
                summary: summary
                issuetype: { id:issueType }
                assignee: { name:@config.user }
                description: description

        @jira.addNewIssue newIssue, (error, response) =>
            if response?
                @response = response if response?
                console.log "Issue #{response.key} has been #{color("created", "green")}"
            else
                # The error object is non-standard here from Jira, I'll parse
                # it better later
                @error = error if error?
                console.log color("Error creating issue: #{JSON.stringify(error)}", "red")

            process.exit()

    # Deletes an issue (if you have permissions) from Jira. I haven't tested
    # this successfully because I don't have permissions.
    deleteIssue: (issueNum)->
        # Don't have permissions currently
        @jira.deleteIssue issueNum, (error, response) =>
            if response?
                @response = response
                console.log "Issue #{issueNum} was #{color("deleted", "green")}"
            else
                @error = error if error?
                console.log color("Error deleting issue: #{error}", "red")

    # ## Adds a simple worklog to an issue ##
    addWorklog: (issueId, comment, timeSpent, exit)->
        worklog =
            comment:comment
            timeSpent:timeSpent
        @jira.addWorklog issueId, worklog, (error, response)=>
            if response?
                console.log "Worklog was #{color("added", "green")}"
            else
                @error = error if error?
                console.log color("Error adding worklog: #{error}", "red")
            process.exit() if exit


    # ## Get Transitions List for an Issue ##
    listTransitions: (issueNum, callback) ->
        @jira.listTransitions issueNum, (error, transitions)=>
            if transitions?
                callback transitions
            else
                console.log color("Error getting transitions: #{error}", "red")
                process.exit()


    # Resolves an issue in Jira, defaults to "Resolved", though maybe someday I
    # should change it to "closed" or at least give an option
    transitionIssue: (issueNum, transitionNum, comment, timeSpent)->
        issueUpdate =
            transition:
                id:transitionNum
            worklog:
                comment:comment
                timeSpent:timeSpent
        @jira.transitionIssue issueNum, issueUpdate, (error, response) =>
            if response?
                @response = response
                console.log "Issue #{issueNum} was #{color("transitioned", "green")}"
            else
                @error = error if error?
                console.log color("Error transitioning issue: #{error}", "red")

            process.exit()

    # Gets a list of issues for the user listed in the config file, pretty
    # prints them and only shows open ones by default from the cli, probably
    # should add an option, though I don't know who wants to see all their
    # closed issues
    getMyIssues: (open)->
        @jira.getUsersIssues @config.user, open, (error, issueList) =>
            if issueList?
                @myIssues = issueList
                for issue in issueList.issues
                    @pp.prettyPrintIssue issue
            else
                @error = error if error?
                console.log color("Error retreiving issues list: #{error}", "red")

    # ## List all Projects ##
    # 
    # This lists all the projects viewable with your account
    getMyProjects: (callback)->
        @jira.listProjects (error, projectList) =>
            if projectList?
                callback projectList
            else
                console.log color("Error listing projects: #{error}", "red")
                process.exit()


module.exports = {
    JiraCli
}
