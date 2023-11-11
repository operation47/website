import { MarkdownBlock } from "https://md-block.verou.me/md-block.js";
const slug = window.location.pathname
    .split("/")
    .slice(-1)[0]
    .replace("%20", " ");
const content = document.getElementById("markdown-content");

const request = {
    method: "GET",
};
const response2 = await fetch(`https://api.op47.de/v1/wiki/pages`, request);
const pages = await response2.json();

const thingy = document.getElementById("pages");

for (const page of pages) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", `/wiki/${page}`);
    a.textContent = page;
    li.appendChild(a);
    thingy.appendChild(li);
}
const response = await fetch(
    `https://api.op47.de/v1/wiki/page/${slug}`,
    request,
);
let title;
let md;
switch (response.status) {
    case 200:
        const obj = await response.json();
        title = obj.title;
        md = obj.content;
        break;
    case 404:
        title = "404";
        md = "## This page does not exist.";
        break;
    default:
        title = "Error";
        md = `# Error\n\nAn error occured while loading this page. Please try again later.\n\nError code: ${response.status}`;
        break;
}

window.document.title = title.concat(" - Operation47 Wiki");

md = "# ".concat(title).concat("\n\n").concat(md);
const mdBlock = new MarkdownBlock();
mdBlock.setAttribute("untrusted", "");
mdBlock.mdContent = md;

content.appendChild(mdBlock);
mdBlock.render();


const expand = document.getElementById("expand");
const aside = document.getElementsByClassName("wiki-nav")[0];
expand.addEventListener("click", () => {
    aside.classList.toggle("expanded");
});
