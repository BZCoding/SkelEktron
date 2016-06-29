# SkelEktron

An unofficial [Electron](http://electron.atom.io) Application template.

SkelEktron was born to be a scratchpad application. A kitchen sink forked from the [Quick Start][electron-quick-start] app, where I could test code and ideas for another existing Electron project without messing the original source code. It eventually took its own road as a template application, a blueprint that provides common features and lets you concentrate on your application's specific code.

## Core Features

 - A smart cross-platform logger
 - A ready-to-go auto updater
 - Built-in support for [Electron Builder][electron-builder]
 - Built-in support for different _build targets_ (ie. release, debug, test, etc) with different settings
 - A printer management feature (optional, fully supported on 64bit Mac/Linux)

### Logger

SkelEktron's logger is a simple `console.*` redirector. During development all the output is written to the terminal. When the application is packaged the output is redirected to a file:

 - OSX applications log to `~/Library/Logs/YourAppNameWithoutSpaces.log`
 - Windows applications log to `C:\Users\[UserName]\AppData\Local\YourAppNameWithoutSpaces.log` (it also works when the app is packaged but not yet installed)
 - Linux applications log to `~/.YourAppNameWithoutSpaces.log`

In other operating systems the output is still redirected to `STDOUT` or `STDERR`, but it can be easily modified in `lib/log.js`.

The logger also adds the `console.debug()` method, which is silenced when the application is built in "release" mode (the default).

**Note**: the log file is truncated each time the application starts. If you need to keep the log files, you have to modify the related write stream to use an `a` or `a+` flags.

**Tip**: on Windows PowerShell you can tail the log file with the command:

~~~ console
PS C:\src\skelektron> Get-Content -Path "C:\Users\[UserName]\AppData\Local\YourAppNameWithoutSpaces.log" -Wait
~~~

### Auto Update

SkelEktron provides an ready-to-go auto update feature for Win and Mac applications, compatible with [Electron Release Server][ers]. The application checks for updates at startup and downloads the package automatically. Once the update is downloaded, the user is prompted to update the application instantly or at the next restart.

To enable the updates, you just need to set up your server (see below) and configure the update URL into `app/package.json`:

~~~ json
"config": {
  "update": {
    "url": "http://myapp.myerserver.com/update/"
  }
}
~~~

If the value is not set or is set to `false`, the feature is disabled.

### Printers management

With the [printer][printer] module the application has access to the printers list and can send data directly to the chosen printer. The current implementation prints test pages in PDF or TXT format. For your specific implementations you can have a look at [the examples][printer-examples].

**Please Note**: since very few apps would need printing ability, and it's not fully supported in Windows, printer management has been disabled by default. To enable the library:

 - add the [printer][printer] in `app/package.json`,
 - uncomment and customize `require('./lib/printer')` in `main.js`,
 - add and customize `require('./assets/js/printers.js')` to your HTML views.

### Electron Builder support

SkelEktron comes pre-packaged and configured for [Electron Builder][electron-builder] with a **two** `package.json` files structure. Build settings can be customized in development `package.json`, you can find more details in the [wiki][electron-builder-wiki].

### Targeted builds

Sometimes you need to build different versions of your application, for example for releasing it to the public, for testing, for QA, etc. And each of these targets could require different settings (i.e. URL to load, debug enabled/disabled).

Each target is a JSON file stored in `build/targets`, so you can have as many targets you need. The content of the selected file is merged with the `config` object loaded from `app/package.json`, allowing you to override default settings such as debug or update URL.

The default build target is "release", which builds a production version of the application with developer and debug tools disabled. You can build other targets by setting the `BUILD_TARGET` env var.

~~~ console
$ BUILD_TARGET=debug npm run build:osx
~~~

### Global settings

Once config is loaded from `app/package.json`, the `global.appSettings` variable is available to all backend modules, in frontend modules you can use `require('remote').getGlobal('appSettings').someProperty`.

### Other goodies

SkelEktron comes pre-packaged with other useful tools like `pre-comit`, [Devtron][devtron], and scripts for running tests and code coverage with [Spectron][spectron], [Mocha][mocha]/[Chai][chai] and [Istanbul][istanbul].

Be sure to check out the [Electron API Demos][electron-api-demos] for more goodies!

## Build/Update Workflow

A suitable build flow can be:

 - Version bump in `app/package.json`
 - Run `build` command for specific targets (dev/test/qa/release) platforms
 - Publish the packages
   * create the remote release(s) for target and platform
   * upload the assets

### Build Notes

Although theoretically you can cross-build all platform versions of your app on a single operating system, I've found that building each release on the target OS, using VMs obviously, works best for me.

I use both node v4 or v5 (v0.12 should be enough, but just in case...).

For Windows builds I use an official [Windows 10 development VM][win10dev] from Microsoft. You just need to install Python, Node and Git.

Sometimes I need a 32bit Windows 7 box, in those cases I use a [basic VM][win7dev] with [MS Visual C++ 2010 Redistributable Package (x86)][msvcpp] (when I don't need compile power) or the full [Visual Studio][vs2015], along with Node, Python and Git.

I often build `.deb` packages from OS X, with `fpm` and GraphicsMagick (`brew install GraphicsMagick`) installed. Please check [fpm repo][fpm] for installation instructions.

Also Linux build may fail if GraphicsMagick does not find suitable sizes inside the app Icon. Required sizes are: 16x16x32, 32x32x32, 256x256x32, 512x512x32, 1024x1024x32.

For more detailed and updated information, you can check the official build instructions for [Linux][buildlinux], [OS X][buildmac] and [Windows][buildwin].

## How To Customize The Installers

You can configure custom parameters for your platform installers inside the development `package.json` of your project, for example (the osx icon parameter targets the mounted DMG icon):

~~~ json
"build": {
  "app-bundle-id": "com.example.MyApp",
  "app-category-type": "public.app-category.business",
  "osx": {
    "title": "My Awesome App",
    "icon": "build/mount.icns",
    "icon-size": 120,
    "background": "build/background.png",
    "contents": [
      {
        "x": 478,
        "y": 170,
        "type": "link",
        "path": "/Applications"
      },
      {
        "x": 130,
        "y": 170,
        "type": "file"
      }
    ]
  },
  "win": {
    "loadingGif": "build/splash.gif",
    "iconUrl": "https://url/to/icon.ico",
    "msi": false
  }
}
~~~

See the [builder options][builderoptions] guide for the full reference.

## How To Sign The Installers

In order to sign the installers you need to obtain 2 code-signing certificate in `*.p12` format: one for Windows and one for OSX. The certificate must be accessible from the building machine via HTTPS (ie. GDrive, Dropbox).

Then on Windows PowerShell:

~~~ console
PS C:\src\skelektron> $env:CSC_LINK="https://url.to.my/certificate.p12"
PS C:\src\skelektron> $env:CSC_KEY_PASSWORD="CertificatePassword"
PS C:\src\skelektron> npm run build:win -- --sign
~~~

And from OSX Terminal:

~~~ console
$ export CSC_LINK="https://url.to.my/certificate.p12"
$ export CSC_KEY_PASSWORD="CertificatePassword"
$ npm run build:osx
~~~

Mac certificates are provided by Apple through XCode. To export a certificate in `p12` format [read this Apple doc][applecertdoc].

## How To Setup an Electron Release Server on Heroku with MySQL, Redis and S3

First checkout a copy of [Electron Release Server][ers] and configure it to use MySQL, Redis and [S3][ers-s3], then follow the instructions below.

**Note**: if you prefer, you can use mLab MongoDB for session storage and Heroku Postgres as main database.

 1. Setup an S3 bucket where
    - everyone can read (EveryOne: list)
    - a custom `yourAppUser`, with specific credentials can write
    ~~~ json
    {
    	"Version": "2012-10-17",
    	"Statement": [
    		{
    			"Sid": "",
    			"Effect": "Allow",
    			"Principal": {
    				"AWS": "arn:aws:iam::XXXXXXXXXXXX:user/your_user"
    			},
    			"Action": "s3:*",
    			"Resource": [
    				"arn:aws:s3:::your-bucket",
    				"arn:aws:s3:::your-bucket/*"
    			]
    		},
    		{
    			"Sid": "PublicReadGetObject",
    			"Effect": "Allow",
    			"Principal": "*",
    			"Action": "s3:GetObject",
    			"Resource": "arn:aws:s3:::your-bucket/*"
    		}
    	]
    }
    ~~~

 2. Create an Heroku app (i.e. `your-electron.herokuapp.com`) using Heroku web UI or CLI tool

 3. Configure Heroku add-ons
    - [JawsDB][jawsdb] for MySQL main database
    - [Heroku Redis][heroku-redis] for [session storage][salis-sessions]

 4. Configure the environment vars for the app
    - SITE_URL
    - DATABASE_URL
    - ADMIN_USERNAME
    - ADMIN_PASSWORD
    - S3_API_KEY
    - S3_API_SECRET
    - S3_BUCKET
    - S3_REGION
    - PORT
    - REDIS_HOST
    - REDIS_PASS
    - REDIS_PORT

 5. Import data into the app main database a tool of choice (Sequel for OSX, MySQL Workbench or other standard client)

 6. Push the app to Heroku
    - `git push heroku your-branch:master`

 7. Enjoy it!

## Running the Tests

`npm test` will run both unit and integration tests (Spectron). To run each test separately use `npm run unit` and `npm run integration`.

## Contributing

See CONTRIBUTING file.

## Credits

The [Electron](http://electron.atom.io) and [Electron Builder][electron-builder] team. [Arek Sredzki](http://arek.io/) for [Electron Release Server][ers], Ion for [printer][printer]. [Marco Piraccini](https://github.com/marcopiraccini) and [Bogdan Rotund](https://github.com/Bogdan-Rotund).

## Contributor Code of Conduct

Please note that this project is released with a [Contributor Code of
Conduct](http://contributor-covenant.org/). By participating in this project
you agree to abide by its terms. See CODE_OF_CONDUCT file.

## License

SkelEktron is released under the MIT License. See the bundled LICENSE file for details.

[ers]: https://github.com/ArekSredzki/electron-release-server
[printer]: https://www.npmjs.com/package/printer
[printer-examples]: https://github.com/tojocky/node-printer/tree/master/examples
[electron-builder]: https://www.npmjs.com/package/electron-builder
[electron-builder-wiki]: https://github.com/electron-userland/electron-builder/wiki
[devtron]: http://electron.atom.io/devtron/
[spectron]: http://electron.atom.io/spectron/
[istanbul]: https://www.npmjs.com/package/istanbul
[mocha]: https://www.npmjs.com/package/mocha
[chai]: https://www.npmjs.com/package/chai
[electron-quick-start]: https://github.com/electron/electron-quick-start
[electron-api-demos]: https://github.com/electron/electron-api-demos
[win10dev]: https://developer.microsoft.com/en-us/windows/downloads/virtual-machines
[win7dev]: https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/windows/
[msvcpp]: https://www.microsoft.com/en-us/download/details.aspx?id=5555
[vs2015]: https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx
[buildlinux]: http://electron.atom.io/docs/development/build-instructions-linux/
[buildmac]: http://electron.atom.io/docs/development/build-instructions-osx/
[buildwin]: http://electron.atom.io/docs/development/build-instructions-windows/
[builderoptions]: https://github.com/electron-userland/electron-builder/wiki/Options
[applecertdoc]: https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/AppDistributionGuide/MaintainingCertificates/MaintainingCertificates.html#//apple_ref/doc/uid/TP40012582-CH31-SW7
[fpm]: https://github.com/jordansissel/fpm
[ers-s3]: https://github.com/ArekSredzki/electron-release-server/issues/15
[sails-session]: http://sailsjs.org/documentation/reference/configuration/sails-config-session
[jawsdb]: https://elements.heroku.com/addons/jawsdb
[heroku-redis]: https://elements.heroku.com/addons/heroku-redis
