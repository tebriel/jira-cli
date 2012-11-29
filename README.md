# jira-cli

This is a command line client for jira, because no one likes their terrible
interface.

## Getting Started

Install the module with: `npm install jira-cli`


## What does it do?

*  Lists all a user's issues
*  List all a user's projects
*  Finds an issue by Key (AB-123) or Id (123456)
*  Opens an issue in your project (from .jiraclirc.json)
*  Transitions an issue (shows all available transition states)
*  Adds a worklog to an issue

## TODO

*  Allow searching to be limited by project id
*  Allow user to add a new ticket to different projects

## Documentation

[GitHub Documentation](http://tebriel.github.com/jira-cli/)

## Examples

`jira -l`

`jira -f AB-123`

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).


## Release History

*  _0.1.8 Now allows entry of worklog when transitioning items, or by itself_
*  _0.1.7 Now requiring my custom npm module for node-jira-devel_
*  _0.1.6 Transitioning now shows all available options_
*  _0.1.5 Listing Id for project_
*  _0.1.4 Listing Types in Create_
*  _0.1.3 Listing Projects_
*  _0.1.2 Moar Minor Doc Changes_
*  _0.1.1 Minor Doc Changes_
*  _0.1.0 Initial Release_

## License

Copyright (c) 2012 Chris Moultrie  
Licensed under the MIT license.
