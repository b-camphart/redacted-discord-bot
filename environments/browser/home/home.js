const onCreateGame = () => {
    const request = new XMLHttpRequest();
    request.open("post", "../api/game");
    request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
            request.responseURL;
        }
    };
    request.send();
};
