fs = require 'fs'
path = require 'path'
jira = require '../src/jira-cli.coffee'

describe "JiraCli", ->
    jiraCli = null

    beforeEach ->
        configFile = path.join process.env.HOME, '.jiraclirc.json'
        unless fs.existsSync configFile
            console.log "Get your crap together and get a config file"
            console.log configFile
            return
        configFile = fs.readFileSync configFile, 'utf8'
        configFile = JSON.parse configFile
        jiraCli = new jira.JiraHelper configFile

    it "Gets an issue", ->
        jiraCli.getIssue "EG-135"

        waitsFor (->
            jiraCli.response? or jiraCli.error?), "We should get a response", 3000
        runs ->
            expect(jiraCli.response).not.toBeNull()
            expect(jiraCli.error).toBeNull()

    it "Gets my issues", ->
        jiraCli.getMyIssues false

        waitsFor (->
            jiraCli.myIssues? or jiraCli.error?), "We should get a response", 3000
        runs ->
            expect(jiraCli.myIssues).not.toBeNull()
            expect(jiraCli.myIssues.issues.length).toBeGreaterThan 0
            expect(jiraCli.error).toBeNull()

    it "Gets my OPEN issues", ->
        jiraCli.getMyIssues true

        waitsFor (->
            jiraCli.myIssues? or jiraCli.error?), "We should get a response", 3000
        runs ->
            expect(jiraCli.myIssues).not.toBeNull()
            expect(jiraCli.myIssues.issues.length).toBeGreaterThan 0
            expect(jiraCli.error).toBeNull()


    # This is also costly, maybe combine it with the add below?
    #it "Resolves an Issue", ->
    #    jiraCli.resolveIssue "EG-143"

    #    waitsFor (->
    #        jiraCli.response? or jiraCli.error?), "We should get a response", 3000
    #    runs ->
    #        expect(jiraCli.response).not.toBeNull()
    #        console.log jiraCli.response
    #        expect(jiraCli.error).toBeNull()

    # This is costly, you have to delete it from jira, because it really does
    # add it in 
    #it "Adds a new issue", ->
    #    myIssue =
    #        fields:
    #            project: { key:'EG' }
    #            summary: "Test Issue from Test Client"
    #            issuetype: { id:2 }
    #            assignee: { name:"cmoultrie" }
    #            description: "this is a test"

    #    jiraCli.addIssue myIssue

    #    waitsFor (->
    #        jiraCli.response? or jiraCli.error?), "We should get a response", 3000
    #    runs ->
    #        console.log jiraCli.response
    #        expect(jiraCli.response).not.toBeNull()
    #        console.log jiraCli.response
    #        expect(jiraCli.error).toBeNull()
