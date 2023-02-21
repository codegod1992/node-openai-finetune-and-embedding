The nature of a [Node.js][1] application lends itself to many tiny servers running together in a cloud. Consequently, I end up making many little projects.

Whenever I begin a new node project, I begin with a call to [`express`][3].  Not a bad start, but I usually want a little more boiler-plate code to begin. So, this project doesn't do anything itself, it is just the start to all my other projects...

Feel free to use it (you'd probably want to fork it), and change the project to suit your own needs.

Installing
----------

Make sure you have the following engines installed locally:

  * [Node][1]
  * [NPM][2] ... Node.js' package manager

Next, download the code and run the following to download the dependencies:

    npm install

Running
-------

Start up the server, via:

    node app.js

Finally, open up a browser and view the results:

    http://localhost:3000/
    
Using
-----

You won't see much at this point, as everything is just a skeleton waiting for the flesh. However, the project does have some initial behavior that you may appreciate... or not.

**Caveat:** My projects usually only expose JSON objects through a REST interface. I do not have the server spend any cycles rendering HTML files. Instead, my projects serve static HTML files and the client
renders the data into the web page using [FuzzyToast][6] calls.

What you do get from this project is the following:

  * Express without any HTML rendering engine (I always let the client do this).
  * Jake file that builds the REST API from the `router.js` file.
  * Jake file that runs [Mocha][4] tests from the `tests` directory.
  * A `public` directory with an `index.html` that loads [jQuery][5] from Google.

  [1]: http://nodejs.org/
  [2]: http://npmjs.org/
  [3]: http://expressjs.com/
  [4]: https://mochajs.org/
  [5]: http://jquery.com
  [6]: http://www.fuzzytoast.com
