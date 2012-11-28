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
            expect(jiraCli.error).toBeNull()

    it "Gets my issues", ->
        jiraCli.getMyIssues(false)

        waitsFor (->
            jiraCli.myIssues? or jiraCli.error?), "We should get a response", 3000
        runs ->
            expect(jiraCli.myIssues).not.toBeNull()
            expect(jiraCli.myIssues.issues.length).toBeGreaterThan 0
            expect(jiraCli.error).toBeNull()

    it "Gets my OPEN issues", ->
        jiraCli.getMyIssues(true)

        waitsFor (->
            jiraCli.myIssues? or jiraCli.error?), "We should get a response", 3000
        runs ->
            expect(jiraCli.myIssues).not.toBeNull()
            expect(jiraCli.myIssues.issues.length).toBeGreaterThan 0
            expect(jiraCli.error).toBeNull()
