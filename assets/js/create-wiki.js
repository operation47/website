const form = document.getElementById("create-wiki-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("create-wiki-title").value;
    const content = document.getElementById("create-wiki-content").value;
    const password = document.getElementById("create-wiki-password").value;
    console.log(title, content);

    const endpoint = "https://api.op47.de/wiki/create";
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, password }),
    };
    const response = await fetch(endpoint, request);

    switch (response.status) {
        case 200:
            // success
            window.location.href = "/wiki/" + title;
            break;
        case 409:
            // conflict
            alert("Wiki already exists");
            break;
        case 400:
            // bad request
            alert("Invalid title or content");
            break;
        case 401:
            // unauthorized
            alert("You must be logged in to create a wiki");
            break;
        case 500:
            // server error
            alert("Server error");
            break;
    }
});

