# ## Ask the user a question ##
# This is great, stole it from [St. On It](http://st-on-it.blogspot.com/2011/05/how-to-read-user-input-with-nodejs.html)
#
# Re-formatted it to be in coffeescript
# 
# ### Takes ###
# *  question: (text for the user)
# *  format: RegExp which determines if the input was valid
# *  callback: for when we have proper input
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

# ## Item Sorter ##
# 
# Function for JS .Sort() which sorts items by id in ascending order
itemSorter = (a, b)->
    first = parseInt a.id
    second = parseInt b.id
    return -1 if first < second
    return 0 if first is second
    return 1 if first > second

module.exports = {
    ask
    itemSorter
}
