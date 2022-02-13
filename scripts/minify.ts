import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import tar from "tar";
// @ts-ignore
import ffs from "final-fs";

const folder = path.join(__dirname, "../dist");
const minFolder = path.join(__dirname, "../min");

if (!fs.existsSync(folder)) {
    console.error("Try running build first!");
    process.exit(0);
}

if (!fs.existsSync(minFolder)) fs.mkdirSync(minFolder);

async function main() {
    console.log("Reading files...");
    const files_ = await ffs.readdirRecursiveSync(folder, true);
    const files = [];
    for (let i = 0; i < files_.length; i++) {
        if (
            files_[i].endsWith(".js") &&
            !files_[i].includes(".min") &&
            !files_[i].includes(".d.ts") &&
            !files_[i].includes(".map")
        )
            files.push(files_[i]);
    }
    console.log(files);
    for (let i = 0; i < files.length; i++) {
        console.log(
            `[${i + 1}/${files.length}] Minifying ${files[i]} to ${files[i]}...`
        );
        console.log(
            `[${i + 1}/${files.length}] Skipped minify, just copying the file.`
        );
        let filefolder: string[] | string = (minFolder + "/" + files[i]).split(
            "/"
        );
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
            fs
                .readFileSync(folder + "/" + files[i].replace(".js", ".js.map"))
                .toString()
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
    if (!fs.existsSync(path.join(__dirname, "../out")))
        fs.mkdirSync(path.join(__dirname, "../out"));
    console.log("Creating zip archive...");
    try {
        const zip = new AdmZip();
        const out = "out/build.zip";
        zip.addLocalFolder("./dist", "/dist");
        zip.addLocalFolder("./min", "/min");
        zip.addLocalFile("./package.json");
        zip.writeZip(out);
    } catch (e) {
        console.log("An error occured: \n" + e);
        process.exit(0);
    }
    console.log("Generated:\n  - build.zip");
    console.log("Creating tar archive...");
    try {
        await tar.c({ gzip: true, file: "out/build.tgz" }, [
            "dist",
            "min",
            "package.json",
        ]);
        await tar.c({ gzip: true, file: "out/build.tar.gz" }, [
            "dist",
            "min",
            "package.json",
        ]);
    } catch (e) {
        console.log("An error occured: \n" + e);
        process.exit(0);
    }
    fs.rmSync(path.join(__dirname, "../dist"), {
        recursive: true,
        force: true,
    });
    fs.rmSync(path.join(__dirname, "../min"), { recursive: true, force: true });
    if (fs.existsSync(path.join(__dirname, "../pkg")))
        fs.rmSync(path.join(__dirname, "../pkg"), {
            recursive: true,
            force: true,
        });
    fs.renameSync(
        path.join(__dirname, "../out"),
        path.join(__dirname, "../pkg")
    );
    console.log("Generated:\n  - build.tgz");
    console.log("Completed!");
    process.exit(0);
}

main();
