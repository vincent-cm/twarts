"use strict";
const fs = require("fs");
const path = require("path");
const walk = require("walk");
const pathToFiles = "/Volumes/Files/Chinese works of art/output/";
const options = {
  followLinks: false,
};
const original = [];

const walker = walk.walk(pathToFiles, options);

walker.on("file", (root, fileStat, next) => {
  // skip file names starting with '.'
  if (fileStat.name.substr(0, 1) === ".") {
    next();
    return;
  }
  // skip file non-zip
  if (fileStat.name.split(".").pop() !== "zip") {
    next();
    return;
  }

  console.log(`Inspecting "${fileStat.name}"`);
  // remove .zip extension
  original.push(fileStat.name.substr(0, fileStat.name.length - 4));
  next();
});

walker.on("errors", (root, nodeStatsArray, next) => {
  next();
});

walker.on("end", () => {
  reduceOriginal(original);
  console.log("DeDup Done!");
});

const reduceOriginal = () => {
  const removed = [];
  const res = original.reduce((prev, curr) => {
    if (prev.includes(curr) || prev.find((item) => item.includes(curr))) {
      if (!prev.includes(curr)) {
        removed.push(curr);
      }
      return prev;
    } else if (prev.find((item) => curr.includes(item))) {
      const index = prev.findIndex((item) => curr.includes(item));
      if (index > -1) {
        removed.push(prev[index]);
        prev.splice(index, 1);
        return [...prev, curr];
      }
    } else {
      return [...prev, curr];
    }
  }, []);

  console.log(res);

  fs.writeFileSync(__dirname + "/output.txt", res.join("\n"));
  fs.writeFileSync(__dirname + "/removed.txt", removed.join("\n"));
};
