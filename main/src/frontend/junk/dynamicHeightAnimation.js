window.test = () => {
  window.test2 = (e) => {
    
    const buttonContent = e.currentTarget;
    console.log(buttonContent.clientHeight, buttonContent.scrollHeight);
    // buttonContent.style.height = buttonContent.scrollHeight + "px";
  }

  const buttons = document.getElementsByClassName("button-content");

  const clickHandler = () => { return window.test2 };

  
  if (window.alreadyAssigned) {
    return;
  }
  
  window.alreadyAssigned = true;
  Array.from(buttons).forEach(button => {
    button.addEventListener("click", (e) => clickHandler()(e));
  });
}
window.test()



/*

const containerElements = document.getElementsByClassName("container");

const hoverHandler = function(e) {
 const containerDetails = e.currentTarget.querySelector('.container-details');
  const heightToExpand = !containerDetails.clientHeight ?   containerDetails.scrollHeight : 0;
  
  containerDetails.style.height = heightToExpand + "px";
}

Array.from(containerElements).forEach(elem => {
  elem.  addEventListener("mouseenter", (e) => hoverHandler(e)); elem.addEventListener("mouseleave", (e) => hoverHandler(e));
});


*/