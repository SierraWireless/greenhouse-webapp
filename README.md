Install it
==========================
1. Install [Node.js](http://nodejs.org/).
2. Install Bower: `$ sudo npm install -g bower`.
    * `-g` means _globally_, so it will be available system wide.
3. Go to the greenhouse root folder.
4. Install server application dependencies:`$ npm install`.
    * `npm` will use `package.json` to fetch dependencies.
    * Without `-g`, packages will be available only from this projects.
5. Go to `app/`: `$ cd app/`.

6. Install UI dependencies using `bower`: `$ bower install`.
    * `bower` will use `component.json` to fectch dependencies.
    * They will also be available only for this project.
7. You're good to go.

__Note__: You could also run all this at once from repository root:
```bash
$ sudo npm install -g bower && npm install && cd app/ && bower install && cd ..
```

Run it
==========================
1. Go to the greenhouse root folder
2. run server on the port 80 by default (be aware that on linux only the root user can launch a server on the port 80):
   21. `$ node serverstub [port]` to use a server which will use stub services instead of AirVantage services.
   22. `$ node server [port]` to use a server which proxifies AirVantage services (edge.m2mop.net).
      * :heavy_exclamation_mark: In this case, you should set your AirVantage information (credentials, IDs, ...) in `app/js/credentials.js`(see `app/js/credentials.default.js` sample).
                          
Test it
==========================
1. Open [http://localhost](http://localhost), if any, precise the port of your server by adding ":<portnumber>"
