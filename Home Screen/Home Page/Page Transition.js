document.querySelector('.transition-trigger').addEventListener('click', () => {
  const overlay = document.querySelector('.transition-overlay');
  overlay.style.top = '0'; // Slide the overlay from bottom to top

  // Simulate navigation delay (e.g., 1 second)
  setTimeout(() => {
    window.location.href = 'Search.html'; // Replace with your target URL
  }, 1000);
});