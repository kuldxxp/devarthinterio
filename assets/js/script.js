'use strict';

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
};

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

// Function to open the navbar
const openNavbar = function () {
  navbar.classList.add("active"); // Add active class to show the navbar
  overlay.classList.add("active"); // Show the overlay
  navbar.style.transform = "translateX(300px)"; // Move menu into view
};

// Function to close the navbar
const closeNavbar = function () {
  navbar.classList.remove("active"); // Remove active class to hide the navbar
  overlay.classList.remove("active"); // Hide the overlay
  navbar.style.transform = "translateX(0)"; // Reset menu position
};

// Toggle navbar on menu button click
addEventOnElem(navTogglers, "click", function () {
  if (navbar.classList.contains("active")) {
    closeNavbar();
  } else {
    openNavbar();
  }
});

// Close navbar when clicking outside or on the overlay
overlay.addEventListener("click", closeNavbar);

// Ensure the navbar is closed initially
window.addEventListener("DOMContentLoaded", closeNavbar);
