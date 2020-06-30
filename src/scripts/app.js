const Jimp = require("jimp");
const fs = require("fs");

const path = require("path");
const basePath = "/Volumes/Backups/process/";
console.log(path.dirname(basePath));
console.log(path.basename(basePath));
console.log(path.extname(basePath));
console.log(path.resolve(basePath));
//if you are following along, create the following 2 images relative to this script:
let imgRaw = "raw/image1.png"; //a 1024px x 1024px background image
let imgLogo = "raw/logo.png"; //a 155px x 72px logo
//---

let imgActive = "active/image.jpg";
let imgExported = "export/image1.jpg";

let textData = {
  text: "© JKRB Investments Limited", //the text to be rendered on the image
  maxWidth: 1004, //image width - 10px margin left - 10px margin right
  maxHeight: 72 + 20, //logo height + margin
  placementX: 10, // 10px in on the x axis
  placementY: 1024 - (72 + 20) - 10 //bottom of the image: height - maxHeight - margin
};

fs.access(basePath, fs.F_OK, err => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(true);
});

const access = fs.createWriteStream(dir + "/node.access.log", { flags: "a" }),
  error = fs.createWriteStream(dir + "/node.error.log", { flags: "a" });

// redirect stdout / stderr
proc.stdout.pipe(access);
proc.stderr.pipe(error);

//read template & clone raw image
// Jimp.read(imgRaw)
//   .then(tpl => tpl.clone().write(imgActive))

//   //read cloned (active) image
//   .then(() => Jimp.read(imgActive))

//   //combine logo into image
//   .then(tpl =>
//     Jimp.read(imgLogo).then(logoTpl => {
//       logoTpl.opacity(0.2);
//       return tpl.composite(logoTpl, 512 - 75, 512, [
//         Jimp.BLEND_DESTINATION_OVER,
//         0.2,
//         0.2
//       ]);
//     })
//   )

//   //load font
//   .then(tpl => Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(font => [tpl, font]))

//   //add footer text
//   .then(data => {
//     tpl = data[0];
//     font = data[1];

//     return tpl.print(
//       font,
//       textData.placementX,
//       textData.placementY,
//       {
//         text: textData.text,
//         alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
//         alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
//       },
//       textData.maxWidth,
//       textData.maxHeight
//     );
//   })

//   //export image
//   .then(tpl => tpl.quality(100).write(imgExported))

//   //log exported filename
//   .then(tpl => {
//     console.log("exported file: " + imgExported);
//   })

//   //catch errors
//   .catch(err => {
//     console.error(err);
//   });
