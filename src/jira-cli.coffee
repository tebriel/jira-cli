# Because colors are pretty
color = require('ansi-color').set
# [PrettyPrinter Sourc/Doc](pretty-printer.html)
PrettyPrinter = require('./pretty-printer').PrettyPrinter
JiraApi = require('jira').JiraApi

# ## JiraHelper ##
#
# This does the fancy talking to JiraApi for us. It formats the objects the way
# that Jira expects them to come in. Basically a wrapper for node-jira-devel
class JiraHelper
    # ## Constructor ##
    #
    # Builds a new JiraCli with the config settings
    constructor: (@config)->
        @jira = new JiraApi('http', @config.host, @config.port, @config.user, @config.password, '2')
        @response = null
        @error = null
        @pp = new PrettyPrinter

    # ## Get Issue ##
    #
    # Searches Jira for the issue number requested
    # this can be either a key AB-123 or just the number 123456
    getIssue: (issueNum, details)->
        @jira.findIssue issueNum, (error, response) =>
            if response?
                @response = response
                @pp.prettyPrintIssue response, details
            else
                @error = error if error?
                console.log color("Error finding issue: #{error}", "red")

    # ## Get Issue Types ##
    #
    # Gets a list of all the available issue types
    getIssueTypes: (callback)->
        @jira.listIssueTypes (error, response) =>
            if response?
                callback response
            else
                console.log color("Error listing issueTypes: #{error}", "red")
                process.exit()

    # ## Add Issue ##
    #
    # ### Takes ###
    # *  summary: details for the title of the issue
    # *  description: more detailed than summary
    # *  issue type: Id of the type (types are like bug, feature)
    # *  project: this is the id of the project that you're assigning the issue # to
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

    # ## Delete an Issue ##
    #
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

    # ## Add Worklog Item ##
    #
    # Adds a simple worklog to an issue
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


    # ## List Transitions ##
    #
    # List the transitions available for an issue
    listTransitions: (issueNum, callback) ->
        @jira.listTransitions issueNum, (error, transitions)=>
            if transitions?
                callback transitions
            else
                console.log color("Error getting transitions: #{error}", "red")
                process.exit()

    # ## Transition Issue ##
    # 
    # Transitions an issue in Jira
    # 
    # ### Takes ###
    #
    # *  issueNum: the Id of the issue (either the AB-123 or the 123456)
    # *  transitionNum: this is the id of the transition to apply to the issue
    transitionIssue: (issueNum, transitionNum)->
        issueUpdate =
            transition:
                id:transitionNum
        @jira.transitionIssue issueNum, issueUpdate, (error, response) =>
            if response?
                @response = response
                console.log "Issue #{issueNum} was #{color("transitioned", "green")}"
            else
                @error = error if error?
                console.log color("Error transitioning issue: #{error}", "red")

            process.exit()

    # ## Search Jira ##
    #
    # Passes a jql formatted query to jira for search
    #
    # ### Takes ###
    #
    # *  searchQuery: a jql formatted search query string
    # shows all otherwise
    searchJira: (searchQuery, details)->
        fields = ["summary", "status", "assignee"]
        @jira.searchJira searchQuery, fields, (error, issueList) =>
            if issueList?
                @myIssues = issueList
                for issue in issueList.issues
                    @pp.prettyPrintIssue issue, details
            else
                @error = error if error?
                console.log color("Error retreiving issues list: #{error}", "red")

    # ## Get My Issues ##
    #
    # Gets a list of issues for the user listed in the config
    #
    # ### Takes ###
    #
    # *  open: `boolean` which indicates if only open items should be shown,
    # shows all otherwise
    getMyIssues: (open, details, projects)->
        jql = "assignee = " + @config.user
        if open
            jql += ' AND status in (Open, "In Progress", Reopened)'
        if projects?
            jql += " AND project in (#{projects})"
        console.log jql

        @searchJira jql, details
        return

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
    JiraHelper
}
