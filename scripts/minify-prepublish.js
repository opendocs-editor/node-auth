const fs = require("fs");
const path = require("path");
const minify = require("@node-minify/core");
const ffs = require("final-fs");
const gcc = require("@node-minify/google-closure-compiler");

const folder = path.join(__dirname, "../dist");
const minFolder = path.join(__dirname, "../min");

if (!fs.existsSync(folder)) {
    console.error("Try running build first!");
    process.exit(0);
}

if (!fs.existsSync(minFolder)) fs.mkdirSync(minFolder);

async function main() {
    console.log("Reading files...");
    const files_ = ffs.readdirRecursiveSync(folder, true);
    const files = [];
    for (var i = 0; i < files_.length; i++) {
        if (files_[i].endsWith(".js") && !files_[i].includes(".min"))
            files.push(files_[i]);
    }
    for (var i = 0; i < files.length; i++) {
        console.log(
            `[${i + 1}/${files.length}] Minifying ${files[i]} to ${files[i]}...`
        );
        // try {
        //     await minify({
        //         compressor: gcc,
        //         input: folder + "/" + files[i],
        //         output: minFolder + "/" + files[i],
        //         options: {
        //             createSourceMap: true,
        //             compilationLevel: "WHITESPACE_ONLY",
        //             languageIn: "STABLE",
        //             languageOut: "STABLE",
        //         },
        //     });
        // } catch (e) {
        //     console.error("An error occured: \n" + e);
        //     process.exit(1);
        // }
        let filefolder = (minFolder + "/" + files[i]).split("/");
        filefolder = filefolder.slice(0, -1);
        filefolder = filefolder.join("/");
        if (!fs.existsSync(filefolder))
            fs.mkdirSync(filefolder, { recursive: true });
        fs.copyFileSync(folder + "/" + files[i], minFolder + "/" + files[i]);
        fs.copyFileSync(
            folder + "/" + files[i].replace(".js", ".d.ts"),
            minFolder + "/" + files[i].replace(".js", ".d.ts")
        );
        const mapContent = JSON.parse(
            fs.readFileSync(folder + "/" + files[i].replace(".js", ".js.map"))
        );
        mapContent.file = files[i];
        fs.writeFileSync(
            minFolder + "/" + files[i].replace(".js", ".js.map"),
            JSON.stringify(mapContent)
        );
        console.log(
            `Generated:\n  - min/${files[i]}\n  - min/${files[i].replace(
                ".js",
                ".js.map"
            )}\n  - min/${files[i].replace(".js", ".d.ts")}`
        );
    }
    console.log("Completed!");
    process.exit(0);
}

main();
