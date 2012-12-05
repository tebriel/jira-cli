color = require('ansi-color').set
wrap = require('wordwrap')(5, 65)

class PrettyPrinter
    # Because I like colors, and I don't want to format them any more than this
    # TODO: Don't hardcode 5 and 6 anymore
    prettyPrintIssue: (issue, detail)->
        sumColor = "green"
        sumColor = "red" if +issue.fields.status.id in [5,6]
        process.stdout.write color(issue.key, sumColor + "+bold")
        # I don't think this could happen, but maybe....
        issue.fields.summary = "None" unless issue.fields.summary?
        process.stdout.write " - "
        process.stdout.write issue.fields.summary
        process.stdout.write "\n"
        if detail and issue.fields.description?
            process.stdout.write color("Description:\n", "white+bold")
            process.stdout.write wrap(issue.fields.description)
            process.stdout.write "\n\n"

    # ## Do some fancy formatting on issue types ##
    prettyPrintIssueTypes: (issueType, index)->
        process.stdout.write color(index, "white+bold")
        process.stdout.write " - "
        process.stdout.write issueType.name
        if issueType.description.length > 0
            process.stdout.write " - "
            process.stdout.write issueType.description
        process.stdout.write "\n"

    # ## Pretty Print Transition ##
    # 
    # Show a transition with the ID in bold followed by the name
    prettyPrintTransition: (transition, index) ->
        process.stdout.write color(index, "white+bold")
        process.stdout.write " - "
        process.stdout.write transition.name
        process.stdout.write "\n"

    # ## Pretty Print Projects ##
    #
    # Prints the project list in a non-awful format
    prettyPrintProject: (project) ->
        key = project.key
        while key.length < 12
            key = ' ' + key
        process.stdout.write color(key, "white+bold")
        process.stdout.write " - "
        process.stdout.write project.id
        process.stdout.write " - "
        process.stdout.write project.name
        process.stdout.write "\n"

module.exports = {
    PrettyPrinter
}
