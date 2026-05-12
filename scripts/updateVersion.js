var path = require("path");
var fs = require("fs");

var root = path.join(__dirname, "..");

var packageJson = fs.readFileSync(path.join(root, "package.json")).toString()
var version = JSON.parse(packageJson).version;

var indexTs = path.join(root, "src", "index.ts");

var indexContent = fs.readFileSync(indexTs).toString();
var updatedContent = indexContent.replace(/export const version = ".*";/, "export const version = \"" + version + "\";");

if (indexContent === updatedContent) {
	throw new Error("Unable to update version in src/index.ts");
}

fs.writeFileSync(indexTs, updatedContent);

console.log("updated version to", version);
