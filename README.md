# Lunar #
A simple code coverage library for use in web services.

Run Lunar with your project to get fast, simple, code coverage.

## Benefits ##
1. See which paths in your code is run, regardless if you directly call them or not.
2. Understand  the different paths that your code could take, and which percentage you have covered.
3. Get an instant HTML report that shows your code coverage.

## Installation ##

Something

## Usage ##

Mocha:
lunar mocha [mocha options]

This will run your test with mocha, and automatically generate a report with the coverage information for you.

## How It works ##

Before your tests run, lunar goes through and instruments the code. This will create additional files in the "lunar" directory. (You should ignore this in your version control).

Then, instead of running your normal code, we run the instrumented code. Lunar keeps track of when each line is called.

After the tests have finished, lunar will take the instrumented files and see which lines were called. It will generate an HTML report that will show the code and how many times each line has been called.
