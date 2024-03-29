import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";
import { CollectionReqDTO } from "./fetch-palace.model";
import { FetchPalaceHttpService } from "./fetch-palace-http.service";
import { catchError, first } from "rxjs/operators";
import { of } from "rxjs";
import streamSaver from "StreamSaver";
// import { Blob } from "blob-polyfill";
// global['Blob'] = Blob;
import cheerio from "cheerio";
import axios from "axios";
import axiosRetry from "axios-retry";
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });
import chalk from "chalk";
const initUrl = "https://theme.npm.edu.tw";
const baseUrl = "/opendata/DigitImageSets.aspx";
const openDataUrl = "/opendata/";
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
  existingExport: any[] = [];
  statusArray = [] as any[];
  title = "TwArts";
  isValid = true;
  loading = false;
  errorText = [];
  successMessage = "";
  withDesc: boolean;
  constructor(
    public fetchPalaceHttpService: FetchPalaceHttpService,
    public cd: ChangeDetectorRef
  ) {}
  async getCollection() {
    const reqCollection: CollectionReqDTO = {
      limit: 20,
      offset: 0,
      lang: "cht",
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
    const url = `${this.fetchPalaceHttpService.CORS_PROXY}${initUrl}${baseUrl}${
      basePage ? "?pageNo=" + basePage : ""
    }`;
    const response = await axios(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const list = $("#fixPagination .wrap .search-info li");
    if (list) {
      const totalItemText = $(list[1]).text();
      totalItem = +totalItemText.replace(/\D/g, "");
      totalItem = basePage ? totalItem - basePage * perPageItems : totalItem;
      pageLimit = Math.ceil(totalItem / perPageItems);
      await this.getWebsiteContent(url);
    }
    this.loading = false;
  }

  getWebsiteContent = async (currUrl: string) => {
    try {
      console.log(chalk.cyan(`  Scraping: ${pageCounter} of ${pageLimit}`));
      console.log(chalk.cyan(`  Scraping: ${currUrl}`));
      const response = await axios(currUrl);
      const html = response.data;
      const $ = cheerio.load(html);
      const list = $("#fixPagination .wrap .painting-list .list");
      // Switch to sync mode to parse items per page

      // for (const el of list) {
      // }
      $("#fixPagination .wrap .painting-list .list").map(
        async (i: any, el: any) => {
          const count = resultCount++;
          const title = $(el).find("a").attr("title");
          const url = $(el).find("a").attr("href");
          const metadata = {
            count: count,
            title: title,
            url: url,
          };
          if (this.withDesc) {
            const responseItem = await axios(
              `${this.fetchPalaceHttpService.CORS_PROXY}${initUrl}${openDataUrl}${url}`
            );
            const htmlItem = responseItem.data;
            const $i = cheerio.load(htmlItem);
            const elItem = $i(
              "#fixPagination .project-detail ul li:last-child"
            );
            if (elItem && elItem[0]) {
              const desc = $i(elItem[0]).text();
              const descArr = desc.split("：");
              const itemDesc = descArr.splice(1).join();
              metadata["desc"] = itemDesc;
            }
          }

          console.log(metadata);
          parsedResults.push(metadata);
          downloadQueue.push(metadata);
        }
      );
      await this.batchDownload(downloadQueue);
      downloadQueue.length = 0;
      const nextPageLink = $("#fixPagination .page .next-blk")
        .find("a")
        .attr("href");
      pageCounter++;

      if (pageCounter === pageLimit) {
        await this.exportResults(parsedResults);
        return false;
      }

      await this.getWebsiteContent(
        this.fetchPalaceHttpService.CORS_PROXY + initUrl + nextPageLink
      );
    } catch (error) {
      console.log(error);
    }
  };

  async batchDownload(downloadQueue: any[]) {
    // for (const item of downloadQueue) {
    //   await this.delayedBatch(item);
    // }
    const array = downloadQueue.map(this.delayedBatch.bind(this));
    await Promise.all(array);
  }

  async delayedBatch(item: { url: string; title: any }) {
    const downloadNo = "" + item.url.replace(/\D/g, "");
    // Sometime the scrapped number is more or less digits than existing, but they are same
    if (
      this.existingExport.find((exist: string | string[]) =>
        exist.includes(downloadNo)
      )
    ) {
      console.log(`Skipping ${downloadNo}`);
      this.statusArray.find(
        (exist) =>
          downloadNo.includes(exist.id) || exist.id.includes(downloadNo)
      )["status"] = 1;
      this.statusArray = [...this.statusArray];
      this.cd.detectChanges();
      return;
    }
    try {
      console.log(`Downloading ${item.title}`);
      this.pushDownloadStatus(downloadNo, 2);
      this.cd.detectChanges();
      await this.download(
        this.fetchPalaceHttpService.CORS_PROXY +
          initUrl +
          baseUrlDownload +
          downloadNo,
        `${downloadNo}.zip`
      );
      console.log(`Downloaded ${item.title}`);
      this.statusArray.find(
        (exist) =>
          downloadNo.includes(exist.id) || exist.id.includes(downloadNo)
      )["status"] = 3;
      this.statusArray = [...this.statusArray];
      this.cd.detectChanges();
      return;
    } catch (e) {
      console.log(`Error downloading ${item.title}, continue for next`);
      this.statusArray.find(
        (exist) =>
          downloadNo.includes(exist.id) || exist.id.includes(downloadNo)
      )["status"] = 4;
      this.statusArray = [...this.statusArray];
      this.cd.detectChanges();
      return;
    }
  }

  pushDownloadStatus(itemId: string, status: number) {
    this.statusArray.unshift({
      id: itemId,
      status: status,
    });
    this.statusArray = [...this.statusArray];
  }

  exportResults = async (parsedResults: string | any[]) => {
    // Saving a blob is as simple as the fetch example, you just get the
    // readableStream from the blob by calling blob.stream() to get a
    // readableStream and then pipe it
    const blob = new Blob([JSON.stringify(parsedResults, null, 4)]);
    const fileStream = streamSaver.createWriteStream(
      `report-${this.getFormattedTime()}.json`,
      {
        size: blob.size, // Makes the procentage visiable in the download
      }
    );

    // One quick alternetive way if you don't want the hole blob.js thing:
    const readableStream = new Response(blob).body;
    // const readableStream = blob.stream()

    // more optimized pipe version
    // (Safari may have pipeTo but it's useless without the WritableStream)
    if (window.WritableStream && readableStream.pipeTo) {
      await readableStream.pipeTo(fileStream);
      return console.log(
        chalk.yellow.bgBlue(
          `\n ${chalk.underline.bold(
            parsedResults.length
          )} Results exported successfully to ${chalk.underline.bold(
            outputFile
          )}\n`
        )
      );
    }

    // Write (pipe) manually
    const writer = fileStream.getWriter();

    const reader = readableStream.getReader();
    const pump = () =>
      reader
        .read()
        .then((res) =>
          res.done ? writer.close() : writer.write(res.value).then(pump)
        );
    pump();
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

  async download(url: RequestInfo, filename: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.errorText.push("HTTP status error: " + filename);
        return;
      }
      let fileStream: { getWriter: () => any };
      const fileSize = response.headers.get("Content-Length"); // looks like it's not working :(
      if (fileSize) {
        fileStream = streamSaver.createWriteStream(filename, fileSize);
      } else {
        fileStream = streamSaver.createWriteStream(filename);
      }
      const writer = fileStream.getWriter();
      const reader = response.body.getReader();
      await this.pump(reader, writer, fileSize, filename);
      this.successMessage = filename + " done";
      setTimeout(() => {
        this.successMessage = "";
        return;
      });
    } catch (e) {
      this.errorText.push(e.message);
    }
  }

  async pump(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    writer: { close: () => any; write: (arg0: any) => any },
    fileSize?: string,
    filename?: any
  ) {
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
      await writer.write(result.value);
      this.pump(reader, writer, fileSize, filename);
    }
  }

  ngOnInit() {
    if (!streamSaver.supported) {
      this.isValid = false;
      this.errorText.push(
        "Your browser does not support Streams or Service Worker :("
      );
    }
    this.statusArray = this.existingExport.map((el: any) => {
      return {
        id: el,
        status: 0,
      };
    });
    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    (function () {
      if (!console) {
        console = {} as Console;
      }
      var old = console.log;
      var logger = document.getElementById("log");
      console.log = function (message: string) {
        if (typeof message == "object") {
          logger.insertAdjacentHTML(
            "afterbegin",
            (JSON && JSON.stringify
              ? JSON.stringify(message)
              : String(message)) + "<br />"
          );
        } else {
          logger.insertAdjacentHTML("afterbegin", message + "<br />");
        }
      };
    })();
  }
}
