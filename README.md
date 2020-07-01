<h1 align="center">
  <a href="https://www.npm.gov.tw/">
  <img src="./src/assets/image/logo.svg"></a>
</h1>

<h4 align="center">A Chinese Works of Art downloading app built on top of <a href="https://cheerio.js.org" target="_blank">cheerio</a>.</h4>
<h3 align="center">Thanks to the open data provider <a href="https://www.npm.gov.tw/" target="_blank"> 國立故宮博物院</a>.</h3>

<p align="center">
  <a href="https://gitter.im/vincent-cm/community"><img src="https://badges.gitter.im/vincent-cm.png"></a>
  <a href="https://saythanks.io/to/vincent.chen.meng@gmail.com">
      <img src="https://img.shields.io/badge/Say%20Thanks-!-1EAEDB.svg">
  </a>
  <a href="https://paypal.me/vctsweet?locale.x=en_GB">
    <img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat">
  </a>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#download">Download</a> •
  <a href="#credits">Credits</a> •
  <a href="#related">Related</a> •
  <a href="#license">License</a>
</p>

![screenshot](https://raw.githubusercontent.com/vincent-cm/twarts/master/src/assets/image/Screenshot.png)

## Key Features

- Scrapping and downloading the high-resolution images from https://www.npm.gov.tw/

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone git@github.com:vincent-cm/twarts.git

# Go into the repository
$ cd twarts

# Install dependencies
$ npm install

# Run the app
$ npm start

# Run chrome without CORS check

## Windows N
#### Right click on desktop, add new shortcut
Add the target as "[PATH_TO_CHROME]\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp
#### Click OK.

## Windows 10
$ "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp

## Linux
$ google-chrome --disable-web-security

## macOS
$ open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security

```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## Download

You can now go to http://localhost:4200 and click `Get Scraper`
There may be some pages, images populate errors, ignore them.
After 999 images downloaded, Chrome may stop downloading more items.

In this case, you have to collect the previously downloaded file names and put it into the array in `existingExport.ts`
The official npm.gov.tw may upload more items over time, so enjoy.

## Credits

This software uses the following open-source packages:

- [精選圖像下載](https://theme.npm.edu.tw/opendata/)
- [cheerio](https://cheerio.js.org/)
- [Node.js](https://nodejs.org/)
- [axios](https://github.com/axios/axios)

## Support

<a href="https://www.buymeacoffee.com/vincent.cm" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 160px !important;" ></a>

<p>Or</p>

<a href="https://www.patreon.com/vincent_cm">
	<img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

## You may also like...

- [DecisionEase - under construction](https://decisionea.se) - Web based data and machine learning pipeline platform for Fine Art

## License

MIT

---

> [team.warekit.io](http://team.warekit.io/) &nbsp;&middot;&nbsp;
> GitHub [@vincent-cm](https://github.com/vincent-cm) &nbsp;&middot;&nbsp;
> Twitter [@VctSweet](https://twitter.com/VctSweet)
