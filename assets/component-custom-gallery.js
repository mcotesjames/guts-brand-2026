class CustomGallery {
  constructor(section) {
    this.section = section;
    this.viewport = section.querySelector('[data-custom-gallery-viewport]');
    this.track = section.querySelector('[data-custom-gallery-track]');
    if (!this.viewport || !this.track || !window.gsap) return;

    this.currentX = 0;
    this.startX = 0;
    this.startTranslate = 0;
    this.isDragging = false;
    this.pointerId = null;
    this.setX = window.gsap.quickSetter(this.track, 'x', 'px');
    this.clamp = window.gsap.utils.clamp;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.viewport.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('load', this.handleResize);

    this.handleResize();
  }

  handleResize() {
    const viewportWidth = this.viewport.offsetWidth;
    const trackWidth = this.track.scrollWidth;
    this.minX = Math.min(0, viewportWidth - trackWidth);
    this.maxX = 0;
    this.currentX = this.clamp(this.minX, this.maxX, this.currentX);
    this.setX(this.currentX);
  }

  handlePointerDown(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    this.isDragging = true;
    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startTranslate = this.currentX;
    this.track.classList.add('is-dragging');
    this.viewport.setPointerCapture(this.pointerId);
  }

  handlePointerMove(event) {
    if (!this.isDragging || event.pointerId !== this.pointerId) return;
    const delta = event.clientX - this.startX;
    const nextX = this.clamp(this.minX, this.maxX, this.startTranslate + delta);
    this.currentX = nextX;
    this.setX(nextX);
  }

  handlePointerUp(event) {
    if (!this.isDragging || event.pointerId !== this.pointerId) return;
    this.isDragging = false;
    this.track.classList.remove('is-dragging');
    this.viewport.releasePointerCapture(this.pointerId);
    this.pointerId = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-custom-gallery]').forEach((section) => {
    new CustomGallery(section);
  });
});
