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
if (!response2.ok) throw new Error(response2.statusText);
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
if (!response.ok) throw new Error(response.statusText);
const obj = await response.json();
const title = obj.title;
const md = obj.content;

window.document.title = title.concat(" - Operation47 Wiki");

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
