# ## Ask the user a question ##
# This is great, stole it from
# [St. On It](http://is.gd/JZj6V2)
#
# Re-formatted it to be in coffeescript
#
# ### Takes ###
# *  question: (text for the user)
# *  format: RegExp which determines if the input was valid
# *  callback: for when we have proper input
# *  range: integer array that specifies allowed input
ask = (question, format, callback, range) ->
    stdin = process.stdin
    stdout = process.stdout
 
    stdin.resume()
    stdout.write(question + ": ")
 
    stdin.once 'data', (data) ->
        data = data.toString().trim()
 
        if range?
            if parseInt(data) in range
                callback data
                return
        else if format.test data
            callback data
            return

        stdout.write("It should match: " + format + "\n")
        ask(question, format, callback, range)

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
