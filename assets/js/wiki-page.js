import { MarkdownBlock } from "https://md-block.verou.me/md-block.js";
const slug = window.location.pathname.split("/").slice(-1)[0];
const content = document.getElementById("markdown-content");

// fetch md from users from api out of db later
const md = `
# ${slug}
# Test heading 1
## Test heading 2
### Test heading 3
#### Test heading 4
##### Test heading 5
###### Test heading 6

this is a test

1. test
2. test
3. **test**
`;

const mdBlock = new MarkdownBlock();
mdBlock.setAttribute("untrusted", "");
mdBlock.mdContent = md;

content.appendChild(mdBlock);
mdBlock.render();
