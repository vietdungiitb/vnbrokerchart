#### Setting up dev environment

fork or clone the repo

```sh
$ git clone <git url>
$ cd vnbrokercharts
$ npm install
$ npm run watch
```

open [http://localhost:3000](http://localhost:3000) in a browser

Logging is done using the [debug](https://www.npmjs.com/package/debug) package. To see logs in the browser's development console enter this code and refresh the page: `localStorage.debug = "react-stockcharts:*"`.

#### Updating documentation
To update the documentation or add an example, update the files under `docs`.

Most of documentation is written as markdown under the `docs/md` folder

see the `docs/documentation.js` file to understand how the different pages are organized

`docs/lib/charts` folder contains the different charts in the examples, the same are used to build the gists in quick start examples also

#### Updating source

To update the source update files under `src`

#### License

By contributing to this project, you agree that your contributions will be licensed under the **Mozilla Public License Version 2.0** (MPL-2.0).

All new source files must include the following Exhibit A notice at the top:

```
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
```

#### Help needed
