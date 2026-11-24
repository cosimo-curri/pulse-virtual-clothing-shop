exports.checkComponent = () => {
    if(document.querySelector(".HomeContainer"))
        document.body.style.overflow = "hidden";
    else
        document.body.style.overflow = "auto";
};