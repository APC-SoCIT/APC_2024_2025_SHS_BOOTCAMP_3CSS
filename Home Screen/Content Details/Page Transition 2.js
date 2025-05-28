document.querySelector('.upButton').addEventListener('click', () => {
  const overlay = document.querySelector('.slideUp');
  overlay.style.top = '0'; // Slide the overlay from bottom to top
});