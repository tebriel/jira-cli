color = require('ansi-color').set

class PrettyPrinter
    # Because I like colors, and I don't want to format them any more than this
    prettyPrintIssue: (issue)->
        sumColor = "green"
        sumColor = "red" if +issue.fields.status.id in [5,6]
        process.stdout.write color(issue.key, sumColor)
        process.stdout.write " - "
        process.stdout.write issue.fields.summary
        process.stdout.write "\n"

    # ## Do some fancy formatting on issue types ##
    prettyPrintIssueTypes: (issueType)->
        process.stdout.write color(issueType.id, "white+bold")
        process.stdout.write " - "
        process.stdout.write issueType.name
        if issueType.description.length > 0
            process.stdout.write " - "
            process.stdout.write issueType.description
        process.stdout.write "\n"

    # ## Pretty Print Transition ##
    # 
    # Show a transition with the ID in bold followed by the name
    prettyPrintTransition: (transition) ->
        process.stdout.write color(transition.id, "white+bold")
        process.stdout.write " - "
        process.stdout.write transition.name
        process.stdout.write "\n"

    # ## Pretty Print Projects ##
    #
    # Prints the project list in a non-awful format
    prettyPrintProject: (project) ->
        process.stdout.write color(project.key, "white+bold")
        process.stdout.write " - "
        process.stdout.write project.id
        process.stdout.write " - "
        process.stdout.write project.name
        process.stdout.write "\n"

module.exports = {
    PrettyPrinter
}
