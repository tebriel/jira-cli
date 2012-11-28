jira = require '../src/jira-cli.coffee'

describe "JiraCli", ->
    jiraCli = null

    beforeEach ->
       jiraCli = new jira.JiraCli

    it "Gets an issue", ->
        jiraCli.getIssue "EG-135"

        waitsFor (->
            jiraCli.response? or jiraCli.error?), "We should get a response", 1000
        runs ->
            expect(jiraCli.response).not.toBeNull()
