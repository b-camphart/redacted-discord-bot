const enableDocument = () => {
    document.querySelectorAll("[data-awaiting-page-load]").forEach((element) => {
        element.ariaDisabled = "false";
        if (element.hasAttribute("disabled")) element.removeAttribute("disabled");
        if (element.hasAttribute("aria-disabled")) element.removeAttribute("aria-disabled");
        element.removeAttribute("data-awaiting-page-load");
    });
};

const checkReadyState = () => {
    if (document.readyState === "complete") {
        enableDocument();
    } else {
        document.onreadystatechange = checkReadyState;
    }
};

checkReadyState();
