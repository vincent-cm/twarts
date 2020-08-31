import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { CollectionReqDTO } from "./fetch-palace.model";
import { FetchPalaceHttpService } from "./fetch-palace-http.service";
import { catchError, first } from "rxjs/operators";
import { of } from "rxjs";
import streamSaver from 'StreamSaver';
import { existingExport } from './existingExport';
// import { Blob } from "blob-polyfill";
// global['Blob'] = Blob;
const axios = require("axios");
const cheerio = require("cheerio");
const chalk = require("chalk");
const initUrl = 'https://theme.npm.edu.tw'
const baseUrl = "/opendata/DigitImageSets.aspx";
const baseUrlDownload = "/opendata/Authorize.aspx?sNo=";
const basePage = 0;
const outputFile = "data.json";
const parsedResults = [];
const downloadQueue = [];
const perPageItems = 9;
let pageLimit = 0;
let pageCounter = 0;
let resultCount = 0;
let totalItem = 0;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterViewInit {
  existingExport = existingExport;
  statusArray = [] as any[];
  title = "TwArts";
  isValid = true;
  loading = false;
  errorText = [];
  successMessage = '';
  constructor(public fetchPalaceHttpService: FetchPalaceHttpService, public cd: ChangeDetectorRef) {
  }
  async getCollection() {
    const reqCollection: CollectionReqDTO = {
      limit: 20,
      offset: 0,
      lang: "cht"
    };
    this.loading = true;

    const data = await this.fetchPalaceHttpService
      .fetchCollection(reqCollection)
      .pipe(
        catchError(() => {
          return of({} as any);
        }),
        first()
      )
      .toPromise();

    this.loading = false;
    console.log(data);
  }

  async getScraper() {
    this.loading = true;
    console.log(
      chalk.yellow.bgBlue(
        `\n  Scraping of ${chalk.underline.bold(baseUrl)} initiated...\n`
      )
    );
    const url = `${this.fetchPalaceHttpService.CORS_PROXY}${initUrl}${baseUrl}${basePage ? '?pageNo=' + basePage : ''}`;
    const response = await axios(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const list = $("#fixPagination .wrap .search-info li");
    if (list) {
      const totalItemText = $(list[1]).text();
      totalItem = +totalItemText.replace(/\D/g, '');
      totalItem = basePage ? totalItem - basePage * perPageItems : totalItem;
      pageLimit = Math.ceil(totalItem / perPageItems);
      await this.getWebsiteContent(url);
    }
    this.loading = false;
  }

  getWebsiteContent = async (currUrl) => {
    try {
      console.log(chalk.cyan(`  Scraping: ${pageCounter} of ${pageLimit}`))
      console.log(chalk.cyan(`  Scraping: ${currUrl}`))
      const response = await axios(currUrl);
      const html = response.data;
      const $ = cheerio.load(html);
      $("#fixPagination .wrap .painting-list .list").map((i, el) => {
        const count = resultCount++;
        const title = $(el)
          .find("a")
          .attr("title");
        const url = $(el)
          .find("a")
          .attr("href");
        const metadata = {
          count: count,
          title: title,
          url: url
        };
        parsedResults.push(metadata);
        downloadQueue.push(metadata);
      });
      await this.batchDownload(downloadQueue);
      downloadQueue.length = 0;
      const nextPageLink = $('#fixPagination .page .next-blk').find('a').attr('href')
      pageCounter++

      if (pageCounter === pageLimit) {
        this.exportResults(parsedResults)
        return false
      }

      await this.getWebsiteContent(this.fetchPalaceHttpService.CORS_PROXY + initUrl + nextPageLink)
    } catch (error) {
      console.log(error);
    }
  }

  async batchDownload(downloadQueue) {
    const array = downloadQueue.map(this.delayedBatch.bind(this))
    await Promise.all(array);
  }

  async delayedBatch(item) {
    const downloadNo = '' + item.url.replace(/\D/g, '');
    if (existingExport.includes(downloadNo)) {
      console.log(`Skipping ${downloadNo}`);
      this.statusArray.find(el => el.id === downloadNo)['status'] = 1;
      this.statusArray = [...this.statusArray];
      this.cd.detectChanges();
      return;
    }
    try {
      console.log(`Downloading ${item.title}`);
      this.pushDownloadStatus(downloadNo, 2);
      this.cd.detectChanges();
      await this.download(this.fetchPalaceHttpService.CORS_PROXY + initUrl + baseUrlDownload + downloadNo, `${downloadNo}.zip`);
      console.log(`Downloaded ${item.title}`);
      this.statusArray.find(el => el.id === downloadNo)['status'] = 3;
      this.statusArray = [...this.statusArray];
      this.cd.detectChanges();
      return;
    } catch (e) {
      console.log(`Error downloading ${item.title}, continue for next`);
      this.statusArray.find(el => el.id === downloadNo)['status'] = 4;
      this.statusArray = [...this.statusArray];
      this.cd.detectChanges();
      return;
    }
  }

  pushDownloadStatus(itemId, status) {
    this.statusArray.unshift({
      id: itemId,
      status: status
    })
    this.statusArray = [...this.statusArray];
  }

  exportResults = parsedResults => {
    // Saving a blob is as simple as the fetch example, you just get the
    // readableStream from the blob by calling blob.stream() to get a
    // readableStream and then pipe it
    const blob = new Blob([JSON.stringify(parsedResults, null, 4)])
    const fileStream = streamSaver.createWriteStream(`report-${this.getFormattedTime()}.json`, {
      size: blob.size // Makes the procentage visiable in the download
    })

    // One quick alternetive way if you don't want the hole blob.js thing:
    const readableStream = new Response(blob).body
    // const readableStream = blob.stream()

    // more optimized pipe version
    // (Safari may have pipeTo but it's useless without the WritableStream)
    if (window.WritableStream && readableStream.pipeTo) {
      return readableStream.pipeTo(fileStream)
        .then(() => console.log(
          chalk.yellow.bgBlue(
            `\n ${chalk.underline.bold(
              parsedResults.length
            )} Results exported successfully to ${chalk.underline.bold(
              outputFile
            )}\n`
          )
        ))
    }

    // Write (pipe) manually
    const writer = fileStream.getWriter()

    const reader = readableStream.getReader()
    const pump = () => reader.read()
      .then(res => res.done
        ? writer.close()
        : writer.write(res.value).then(pump))
    pump()
  };

  getFormattedTime() {
    var today = new Date();
    var y = today.getFullYear();
    // JavaScript months are 0-based.
    var m = today.getMonth() + 1;
    var d = today.getDate();
    var h = today.getHours();
    var mi = today.getMinutes();
    var s = today.getSeconds();
    return y + "-" + m + "-" + d + "-" + h + "-" + mi + "-" + s;
  }

  async download(url, filename) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.errorText.push("HTTP status error: " + filename);
        return;
      }
      let fileStream;
      const fileSize = response.headers.get("Content-Length"); // looks like it's not working :(
      if (fileSize) {
        fileStream = streamSaver.createWriteStream(
          filename,
          fileSize
        );
      } else {
        fileStream = streamSaver.createWriteStream(filename);
      }
      const writer = fileStream.getWriter();
      const reader = response.body.getReader();
      const res = await this.pump(reader, writer, fileSize, filename);
      this.successMessage = filename + " done";
      setTimeout(() => {
        this.successMessage = "";
        return;
      });
    } catch (e) {
      this.errorText.push(e.message);
    }
  }

  async pump(reader, writer, fileSize?, filename?) {
    let readByteCount = 0;

    const result = await reader.read();
    if (result.done) {
      return writer.close();
    } else {
      readByteCount += result.value.length;
      if (fileSize) {
        this.successMessage = `Downloaded ${filename} ${Math.ceil(
          (readByteCount / +fileSize) * 100
        )} %...`;
      } else {
        this.successMessage = `Downloading ${filename}...`;
      }
      const res = await writer.write(result.value)
      this.pump(reader, writer, fileSize, filename);
    }
  }

  ngOnInit() {
    if (!streamSaver.supported) {
      this.isValid = false;
      this.errorText.push('Your browser does not support Streams or Service Worker :(');
    }
    this.statusArray = existingExport.map(el => {
      return {
        id: el,
        status: 0
      }
    })
    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    (function () {
      if (!console) {
        console = {} as Console;
      }
      var old = console.log;
      var logger = document.getElementById('log');
      console.log = function (message) {
        if (typeof message == 'object') {
          logger.insertAdjacentHTML("afterbegin", (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '<br />');
        } else {
          logger.insertAdjacentHTML("afterbegin", message + '<br />');
        }
      }
    })();
  }
}
