/**
 * Circular Motion and Simple Harmonic Motion (S.H.M.)
 * Grade XI Physics - Unit 7: Oscillation, Section 7.4
 * Presentation Controller & High-Definition Canvas Visuals
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. STATE & DOM REFERENCES
  // ==========================================================================
  const stage = document.getElementById('stage');
  const slides = Array.from(document.querySelectorAll('section.slide'));
  const counterEl = document.getElementById('counter');
  const stepInfoEl = document.getElementById('step-info');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  let currentSlide = 0;
  let currentStep = 1;

  // Theme color constants for Canvas rendering
  const COLORS = {
    paper: '#0f172a',
    soft: '#1e293b',
    rule: '#334155',
    ruleLight: '#475569',
    ink: '#f8fafc',
    muted: '#94a3b8',
    blue: '#38bdf8',
    blueWash: 'rgba(56, 189, 248, 0.15)',
    blueGlow: 'rgba(56, 189, 248, 0.4)',
    amber: '#fbbf24',
    amberWash: 'rgba(251, 191, 36, 0.15)',
    green: '#34d399',
    greenWash: 'rgba(52, 211, 153, 0.15)',
    red: '#f87171',
    redWash: 'rgba(248, 113, 113, 0.2)',
    pink: '#f43f5e',
    pinkWash: 'rgba(244, 63, 94, 0.15)',
    neon: '#00f3ff',
    neonWash: 'rgba(0, 243, 255, 0.15)'
  };

  // ==========================================================================
  // 2. RESPONSIVE 1600x900 SCALING ARCHITECTURE
  // ==========================================================================
  function fit() {
    const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    document.documentElement.style.setProperty('--scale', scale);
    if (stage) {
      stage.style.transform = `scale(${scale})`;
    }
  }

  window.addEventListener('resize', fit);
  window.addEventListener('DOMContentLoaded', fit);
  fit();

  // ==========================================================================
  // 3. NAVIGATION CONTROLLER & PROGRESSIVE REVEALS
  // ==========================================================================
  function getMaxSteps(slide) {
    if (!slide) return 1;
    if (slide.dataset.live === 'cycle') return 7;
    if (slide.dataset.live === 'kinematics') return 4;
    return parseInt(slide.dataset.steps, 10) || 1;
  }

  function updateSlide() {
    slides.forEach((slide, idx) => {
      if (idx === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    const activeSlide = slides[currentSlide];
    const maxSteps = getMaxSteps(activeSlide);

    // Update Progressive Reveals
    const reveals = activeSlide.querySelectorAll('.reveal');
    reveals.forEach(el => {
      const stepReq = parseInt(el.dataset.step, 10) || 1;
      if (stepReq <= currentStep) {
        el.classList.add('shown', 'visible');
      } else {
        el.classList.remove('shown', 'visible');
      }
    });

    // Handle Live Interactive Traces
    if (activeSlide.dataset.live === 'cycle') {
      renderCycleLive(currentStep - 1);
    } else if (activeSlide.dataset.live === 'kinematics') {
      renderKinematicsLive(currentStep - 1);
    }

    // Update Bottom Counter & Step Info
    if (counterEl) {
      counterEl.textContent = `${currentSlide + 1} / ${slides.length}`;
    }
    if (stepInfoEl) {
      if (activeSlide.dataset.live) {
        stepInfoEl.textContent = `LIVE TRACE STEP ${currentStep} / ${maxSteps}`;
      } else if (maxSteps > 1) {
        stepInfoEl.textContent = `STEP ${currentStep} / ${maxSteps}`;
      } else {
        stepInfoEl.textContent = `SLIDE ${currentSlide + 1}`;
      }
    }

    // Nav Button States
    if (btnPrev) {
      btnPrev.disabled = (currentSlide === 0 && currentStep === 1);
    }
    if (btnNext) {
      btnNext.disabled = (currentSlide === slides.length - 1 && currentStep === maxSteps);
    }

    // Redraw Canvases for this slide
    renderCanvasesForSlide(currentSlide, currentStep);
  }

  function next() {
    const activeSlide = slides[currentSlide];
    const maxSteps = getMaxSteps(activeSlide);

    if (currentStep < maxSteps) {
      currentStep++;
      updateSlide();
    } else if (currentSlide < slides.length - 1) {
      currentSlide++;
      currentStep = 1;
      updateSlide();
    }
  }

  function previous() {
    if (currentStep > 1) {
      currentStep--;
      updateSlide();
    } else if (currentSlide > 0) {
      currentSlide--;
      const prevSlide = slides[currentSlide];
      currentStep = getMaxSteps(prevSlide);
      updateSlide();
    }
  }

  function goToSlide(index) {
    if (index >= 0 && index < slides.length) {
      currentSlide = index;
      currentStep = 1;
      updateSlide();
    }
  }

  // Expose global nav functions for inline button click handlers
  window.next = next;
  window.previous = previous;
  window.goToSlide = goToSlide;

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
      case 'Enter':
        e.preventDefault();
        next();
        break;
      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        previous();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(slides.length - 1);
        break;
      default:
        break;
    }
  });

  // Touch navigation (swipe)
  let touchStartX = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (deltaX < -50) {
        next();
      } else if (deltaX > 50) {
        previous();
      }
    }
  }, { passive: true });

  // ==========================================================================
  // 4. CANVAS DRAWING HELPERS
  // ==========================================================================
  function clearCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);
  }

  function drawArrow(ctx, fromX, fromY, toX, toY, color, width = 2, headLen = 10) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);

    if (length < 2) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawGlowDot(ctx, x, y, radius, color, glowRadius = 12) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = glowRadius;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ==========================================================================
  // 5. CANVAS RENDERERS (SLIDE BY SLIDE)
  // ==========================================================================

  // --- Slide 2: The Shadow Analogy (Turntable + Overhead Lamps) ---
  function drawShadowAnalogy() {
    const canvas = document.getElementById('canvas-shadow');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    clearCanvas(ctx, W, H);

    // 1. Overhead Lamps & Light Beams
    const lampPositions = [140, 280, 420];
    lampPositions.forEach((lx) => {
      // Lamp Housing
      ctx.fillStyle = COLORS.ruleLight;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(lx - 25, 12, 50, 16, 4);
      } else {
        ctx.rect(lx - 25, 12, 50, 16);
      }
      ctx.fill();

      // Bulb glow
      ctx.fillStyle = COLORS.amber;
      ctx.beginPath();
      ctx.arc(lx, 28, 8, 0, Math.PI);
      ctx.fill();

      // Light beam cone
      const grad = ctx.createLinearGradient(lx, 28, lx, 320);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
      grad.addColorStop(0.8, 'rgba(251, 191, 36, 0.08)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(lx - 20, 28);
      ctx.lineTo(lx - 55, 320);
      ctx.lineTo(lx + 55, 320);
      ctx.lineTo(lx + 20, 28);
      ctx.closePath();
      ctx.fill();
    });

    ctx.fillStyle = COLORS.muted;
    ctx.font = '600 14px sans-serif';
    ctx.fillText('Overhead Parallel Light Source', 20, 28);

    // 2. Isometric Turntable
    const cx = 280;
    const cy = 165;
    const rx = 180;
    const ry = 55;

    // Turntable cylinder depth base
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 14, rx, ry, 0, 0, Math.PI);
    ctx.lineTo(cx - rx, cy);
    ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, true);
    ctx.lineTo(cx + rx, cy + 14);
    ctx.fill();
    ctx.stroke();

    // Turntable top surface
    const surfaceGrad = ctx.createLinearGradient(cx - rx, cy, cx + rx, cy);
    surfaceGrad.addColorStop(0, '#1a2234');
    surfaceGrad.addColorStop(0.5, '#222f46');
    surfaceGrad.addColorStop(1, '#1a2234');
    ctx.fillStyle = surfaceGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.blue;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Turntable center spindle
    drawGlowDot(ctx, cx, cy, 5, COLORS.muted, 6);
    ctx.fillStyle = COLORS.muted;
    ctx.font = '13px sans-serif';
    ctx.fillText('O (Axis)', cx - 18, cy - 10);

    // Circular motion path (dashed ellipse)
    const orbitRx = 140;
    const orbitRy = 42;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = COLORS.blueGlow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, orbitRx, orbitRy, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Particle P on orbit (at theta = 45 degrees)
    const theta = Math.PI / 4;
    const px = cx + orbitRx * Math.cos(theta);
    const py = cy - orbitRy * Math.sin(theta);

    // Radius line
    ctx.strokeStyle = COLORS.blue;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Rotation direction arrow
    drawArrow(ctx, cx + orbitRx * Math.cos(theta + 0.35), cy - orbitRy * Math.sin(theta + 0.35),
      cx + orbitRx * Math.cos(theta + 0.65), cy - orbitRy * Math.sin(theta + 0.65), COLORS.amber, 2, 8);

    ctx.fillStyle = COLORS.amber;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('ω', cx + orbitRx * Math.cos(theta + 0.5) + 12, cy - orbitRy * Math.sin(theta + 0.5) - 4);

    // Draw Particle P
    drawGlowDot(ctx, px, py, 9, COLORS.blue, 16);
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Particle P (Mass m)', px + 14, py - 4);

    // 3. Vertical Projection Light Ray down to Screen
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = COLORS.neon;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, 325);
    ctx.stroke();
    ctx.restore();

    // 4. Flat Screen / 1D Projection Track at bottom
    const screenY = 325;
    const trackLeft = cx - orbitRx;
    const trackRight = cx + orbitRx;

    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(trackLeft - 20, screenY);
    ctx.lineTo(trackRight + 20, screenY);
    ctx.stroke();

    // Mean position mark O
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, screenY - 10);
    ctx.lineTo(cx, screenY + 10);
    ctx.stroke();
    ctx.fillStyle = COLORS.muted;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('O (x = 0)', cx - 22, screenY + 28);

    // Extremes A and B
    ctx.strokeStyle = COLORS.blue;
    ctx.beginPath();
    ctx.moveTo(trackRight, screenY - 10);
    ctx.lineTo(trackRight, screenY + 10);
    ctx.stroke();
    ctx.fillStyle = COLORS.blue;
    ctx.fillText('+r (A)', trackRight - 16, screenY + 28);

    ctx.strokeStyle = COLORS.blue;
    ctx.beginPath();
    ctx.moveTo(trackLeft, screenY - 10);
    ctx.lineTo(trackLeft, screenY + 10);
    ctx.stroke();
    ctx.fillText('-r (B)', trackLeft - 16, screenY + 28);

    // Shadow Q
    drawGlowDot(ctx, px, screenY, 8, COLORS.neon, 18);
    ctx.fillStyle = COLORS.neon;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Shadow Q', px - 32, screenY - 16);

    // S.H.M. Oscillating double arrow
    drawArrow(ctx, px - 24, screenY + 12, px - 46, screenY + 12, COLORS.neon, 2, 6);
    drawArrow(ctx, px + 24, screenY + 12, px + 46, screenY + 12, COLORS.neon, 2, 6);
    ctx.fillStyle = COLORS.muted;
    ctx.font = '13px sans-serif';
    ctx.fillText('Oscillates back and forth (S.H.M.)', trackLeft + 35, screenY - 14);
  }

  // --- Slide 3: Geometric Setup & Standard Notation ---
  function drawSetupCircle() {
    const canvas = document.getElementById('canvas-setup');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    clearCanvas(ctx, W, H);

    const cx = 270;
    const cy = 205;
    const R = 145;

    // Background Axes
    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Horizontal Diameter AB
    ctx.beginPath();
    ctx.moveTo(cx - R - 35, cy);
    ctx.lineTo(cx + R + 35, cy);
    ctx.stroke();

    // Vertical Diameter
    ctx.beginPath();
    ctx.moveTo(cx, cy - R - 30);
    ctx.lineTo(cx, cy + R + 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reference Circle
    ctx.strokeStyle = COLORS.blueGlow;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Angle theta = 52 degrees
    const theta = 52 * Math.PI / 180;
    const px = cx + R * Math.cos(theta);
    const py = cy - R * Math.sin(theta);
    const qx = px;
    const qy = cy;

    // Triangle fill (Delta OQP)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.lineTo(qx, qy);
    ctx.closePath();
    ctx.fill();

    // Angle Arc
    ctx.strokeStyle = COLORS.amber;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, -theta, 0);
    ctx.stroke();
    ctx.fillStyle = COLORS.amber;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('θ = ωt', cx + 46, cy - 14);

    // Radius Vector OP (r)
    drawArrow(ctx, cx, cy, px, py, COLORS.blue, 2.5, 9);
    ctx.fillStyle = COLORS.blue;
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('r (Radius = x₀)', cx + (px - cx) / 2 - 45, cy + (py - cy) / 2 - 12);

    // Perpendicular drop line from P to Q
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(qx, qy);
    ctx.stroke();
    ctx.restore();

    // Right angle symbol at Q
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.strokeRect(qx - 14, qy - 14, 14, 14);

    // Displacement segment OQ (x = r cos theta)
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(qx, qy);
    ctx.stroke();

    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('x = r cos θ', cx + (qx - cx) / 2 - 35, cy + 26);

    // Angular velocity omega arrow
    ctx.strokeStyle = COLORS.amber;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 18, -theta - 0.25, -theta + 0.35);
    ctx.stroke();
    drawArrow(ctx, cx + (R + 18) * Math.cos(theta + 0.25), cy - (R + 18) * Math.sin(theta + 0.25),
      cx + (R + 18) * Math.cos(theta + 0.38), cy - (R + 18) * Math.sin(theta + 0.38), COLORS.amber, 2, 7);
    ctx.fillText('ω', cx + (R + 26) * Math.cos(theta + 0.1), cy - (R + 26) * Math.sin(theta + 0.1));

    // Points & Labels
    // Point O
    drawGlowDot(ctx, cx, cy, 6, COLORS.ink, 8);
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('O (Mean)', cx - 35, cy - 14);

    // Point P
    drawGlowDot(ctx, px, py, 9, COLORS.blue, 16);
    ctx.fillStyle = COLORS.blue;
    ctx.fillText('P (Particle)', px + 12, py - 4);

    // Point Q
    drawGlowDot(ctx, qx, qy, 8, COLORS.green, 14);
    ctx.fillStyle = COLORS.green;
    ctx.fillText('Q (Projection)', qx - 45, qy + 48);

    // Extremes A and B
    ctx.fillStyle = COLORS.muted;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('A (+r)', cx + R + 10, cy + 5);
    ctx.fillText('B (-r)', cx - R - 55, cy + 5);
  }

  // --- Slide 5: Mini Reference Circles (3 Key Angles) ---
  function drawMiniPos(canvasId, angleDeg, caseNum) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    clearCanvas(ctx, W, H);

    const cx = 175;
    const cy = 100;
    const R = 64;

    // Horizontal Diameter
    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - R - 20, cy);
    ctx.lineTo(cx + R + 20, cy);
    ctx.stroke();

    // Circle outline
    ctx.strokeStyle = COLORS.blueGlow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Mean & Extremes marks
    ctx.fillStyle = COLORS.muted;
    ctx.font = '11px sans-serif';
    ctx.fillText('B', cx - R - 14, cy + 4);
    ctx.fillText('O', cx - 4, cy + 18);
    ctx.fillText('A', cx + R + 6, cy + 4);

    const rad = angleDeg * Math.PI / 180;
    const px = cx + R * Math.cos(rad);
    const py = cy - R * Math.sin(rad);
    const qx = px;
    const qy = cy;

    // Perpendicular drop (if not on diameter)
    if (Math.abs(py - qy) > 2) {
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = COLORS.muted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(qx, qy);
      ctx.stroke();
      ctx.restore();
    }

    // Radius line
    ctx.strokeStyle = COLORS.blue;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Particle P
    drawGlowDot(ctx, px, py, 6, COLORS.blue, 10);
    ctx.fillStyle = COLORS.blue;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('P', px + (px >= cx ? 8 : -16), py - 6);

    // Projection Q
    drawGlowDot(ctx, qx, qy, 6, COLORS.green, 10);
    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Q', qx - 5, qy - 10);

    // Case-specific Vector Annotations
    if (caseNum === 1) {
      // theta = 0 deg: Q at +r, v_x = 0, a_x = max left
      ctx.fillStyle = COLORS.amber;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('vx = 0', qx - 20, qy + 24);

      // Max restoring acceleration arrow pointing LEFT
      drawArrow(ctx, qx, qy + 36, qx - 55, qy + 36, COLORS.red, 3, 7);
      ctx.fillStyle = COLORS.red;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('ax = -ω²r (MAX)', qx - 105, qy + 40);
    } else if (caseNum === 2) {
      // theta = 60 deg: Q at +0.5r, both vx and ax pointing left
      drawArrow(ctx, qx, qy + 22, qx - 42, qy + 22, COLORS.green, 2.5, 7);
      ctx.fillStyle = COLORS.green;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('vx (Left)', qx - 90, qy + 26);

      drawArrow(ctx, qx, qy + 42, qx - 30, qy + 42, COLORS.red, 2.5, 7);
      ctx.fillStyle = COLORS.red;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('ax (Left)', qx - 80, qy + 46);
    } else if (caseNum === 3) {
      // theta = 90 deg: Q at O, vx = MAX left, ax = 0
      drawArrow(ctx, qx + 30, qy + 24, qx - 45, qy + 24, COLORS.green, 3, 8);
      ctx.fillStyle = COLORS.green;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('vx = -rω (MAX)', qx - 40, qy + 42);

      ctx.fillStyle = COLORS.amber;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('ax = 0 (Equilibrium)', qx - 55, qy + 60);
    }
  }

  // --- Slide 6: Centripetal Acceleration Proof ---
  function drawAccelVector() {
    const canvas = document.getElementById('canvas-accel');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    clearCanvas(ctx, W, H);

    const cx = 270;
    const cy = 180;
    const R = 125;

    // Horizontal Diameter
    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx - R - 30, cy);
    ctx.lineTo(cx + R + 30, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reference Circle
    ctx.strokeStyle = COLORS.blueGlow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    const theta = 45 * Math.PI / 180;
    const px = cx + R * Math.cos(theta);
    const py = cy - R * Math.sin(theta);
    const qx = px;
    const qy = cy;

    // Perpendicular drop to Q
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(qx, qy);
    ctx.stroke();
    ctx.restore();

    // Radius line
    ctx.strokeStyle = COLORS.ruleLight;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Centripetal Acceleration Vector ac (Pink) inward from P toward O
    const acLen = 85;
    const acEndX = px - acLen * Math.cos(theta);
    const acEndY = py + acLen * Math.sin(theta);
    drawArrow(ctx, px, py, acEndX, acEndY, COLORS.pink, 3.5, 10);
    ctx.fillStyle = COLORS.pink;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ac = rω² (Centripetal)', px - 110, py + 30);

    // Component Resolution Triangle at P:
    // Horizontal component ax = -ac cos(theta)
    const compAx = px - acLen * Math.cos(theta);
    drawArrow(ctx, px, py, compAx, py, COLORS.red, 3, 9);
    ctx.fillStyle = COLORS.red;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('ax = -ac cos θ', px - 75, py - 12);

    // Vertical component ay
    ctx.save();
    ctx.setLineDash([3, 3]);
    drawArrow(ctx, compAx, py, acEndX, acEndY, COLORS.pink, 2, 6);
    ctx.restore();

    // Angle theta at P between horizontal and ac
    ctx.strokeStyle = COLORS.amber;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, 26, Math.PI, Math.PI - theta, true);
    ctx.stroke();
    ctx.fillStyle = COLORS.amber;
    ctx.font = '13px sans-serif';
    ctx.fillText('θ', px - 35, py + 12);

    // Displacement x on diameter (Green)
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(qx, qy);
    ctx.stroke();
    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('x = r cos θ', cx + 18, cy + 22);

    // Restoring Acceleration on Q (Red Arrow pointing left toward O)
    drawArrow(ctx, qx, qy + 40, qx - 65, qy + 40, COLORS.red, 3.5, 9);
    ctx.fillStyle = COLORS.red;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ax = -ω²x (Restoring)', qx - 170, qy + 45);

    // Points
    drawGlowDot(ctx, cx, cy, 5, COLORS.ink, 6);
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('O (Mean)', cx - 25, cy - 12);

    drawGlowDot(ctx, px, py, 8, COLORS.blue, 12);
    ctx.fillStyle = COLORS.blue;
    ctx.fillText('P', px + 10, py - 2);

    drawGlowDot(ctx, qx, qy, 7, COLORS.green, 10);
    ctx.fillStyle = COLORS.green;
    ctx.fillText('Q', qx + 10, qy + 4);
  }

  // --- Slide 7: Time Period & Frequency Mapping ---
  function drawPeriodDiagram() {
    const canvas = document.getElementById('canvas-period');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    clearCanvas(ctx, W, H);

    // Top: Reference Circle Revolution
    const cx = 280;
    const cy = 115;
    const R = 80;

    // Full circle circumference glow
    ctx.strokeStyle = COLORS.blue;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // 4 Key Milestones around circle
    const milestones = [
      { angle: 0, label: 't = 0 (A)', color: COLORS.blue },
      { angle: Math.PI / 2, label: 't = T/4', color: COLORS.green },
      { angle: Math.PI, label: 't = T/2 (B)', color: COLORS.amber },
      { angle: 3 * Math.PI / 2, label: 't = 3T/4', color: COLORS.green }
    ];

    milestones.forEach((m) => {
      const mx = cx + R * Math.cos(m.angle);
      const my = cy - R * Math.sin(m.angle);
      drawGlowDot(ctx, mx, my, 6, m.color, 10);

      ctx.fillStyle = m.color;
      ctx.font = 'bold 13px sans-serif';
      if (m.angle === 0) ctx.fillText(m.label, mx + 10, my + 4);
      else if (m.angle === Math.PI / 2) ctx.fillText(m.label, mx - 20, my - 12);
      else if (m.angle === Math.PI) ctx.fillText(m.label, mx - 68, my + 4);
      else ctx.fillText(m.label, mx - 22, my + 20);
    });

    // Circular direction flow arrow
    drawArrow(ctx, cx + (R + 14) * Math.cos(0.3), cy - (R + 14) * Math.sin(0.3),
      cx + (R + 14) * Math.cos(0.9), cy - (R + 14) * Math.sin(0.9), COLORS.neon, 2, 7);

    ctx.fillStyle = COLORS.neon;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('s = 2πr (One Full Revolution in time T)', cx - 130, cy - 95);

    // Bottom: 1D Track of Projection Q
    const trackY = 270;
    const trackLeft = cx - R - 30;
    const trackRight = cx + R + 30;

    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(trackLeft - 10, trackY);
    ctx.lineTo(trackRight + 10, trackY);
    ctx.stroke();

    // Mean O and Extremes
    drawGlowDot(ctx, cx, trackY, 5, COLORS.muted, 6);
    ctx.fillStyle = COLORS.muted;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('O (x=0)', cx - 18, trackY + 22);

    ctx.fillStyle = COLORS.blue;
    ctx.fillText('+r (A)', trackRight - 15, trackY + 22);
    ctx.fillStyle = COLORS.amber;
    ctx.fillText('-r (B)', trackLeft - 15, trackY + 22);

    // Forward path: A -> O -> B (t = T/2)
    drawArrow(ctx, trackRight, trackY - 18, trackLeft, trackY - 18, COLORS.amber, 2.5, 8);
    ctx.fillStyle = COLORS.amber;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('First Half: A → B (Δt = T/2)', cx - 75, trackY - 26);

    // Return path: B -> O -> A (t = T/2)
    drawArrow(ctx, trackLeft, trackY + 40, trackRight, trackY + 40, COLORS.green, 2.5, 8);
    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Return Half: B → A (Δt = T/2)', cx - 75, trackY + 56);
  }

  // --- Slide 8: Live Cycle Trace Canvas ---
  function drawLiveCycleCanvas(stepIdx) {
    const canvas = document.getElementById('canvas-live-cycle');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    clearCanvas(ctx, W, H);

    const cx = 135;
    const cy = 115;
    const R = 75;

    // Reference Circle on Left
    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Axes
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx - R - 15, cy);
    ctx.lineTo(cx + R + 15, cy);
    ctx.moveTo(cx, cy - R - 15);
    ctx.lineTo(cx, cy + R + 15);
    ctx.stroke();
    ctx.setLineDash([]);

    // Checkpoint Angles
    const anglesDeg = [0, 60, 90, 120, 180, 270, 360];
    const angle = (anglesDeg[stepIdx] || 0) * Math.PI / 180;

    const px = cx + R * Math.cos(angle);
    const py = cy - R * Math.sin(angle);

    // Radius line
    ctx.strokeStyle = COLORS.blue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Particle P
    drawGlowDot(ctx, px, py, 7, COLORS.blue, 12);
    ctx.fillStyle = COLORS.blue;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('P', px + (px >= cx ? 8 : -16), py - 6);

    // 1D Projection Track on Right
    const trackCenter = 370;
    const trackY = 115;
    const trackSpan = 100; // max displacement visual scale

    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(trackCenter - trackSpan - 15, trackY);
    ctx.lineTo(trackCenter + trackSpan + 15, trackY);
    ctx.stroke();

    // Mean and Extremes
    ctx.fillStyle = COLORS.muted;
    ctx.font = '12px sans-serif';
    ctx.fillText('-r (B)', trackCenter - trackSpan - 28, trackY + 22);
    ctx.fillText('O', trackCenter - 4, trackY + 22);
    ctx.fillText('+r (A)', trackCenter + trackSpan + 4, trackY + 22);

    // Projection Q position
    const qx = trackCenter + trackSpan * Math.cos(angle);
    const qy = trackY;

    // Dashed connection from P to Q
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = COLORS.neonWash;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(qx, qy);
    ctx.stroke();
    ctx.restore();

    // Projection dot Q
    drawGlowDot(ctx, qx, qy, 8, COLORS.neon, 14);
    ctx.fillStyle = COLORS.neon;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Q', qx - 6, qy - 14);

    // Restoring Acceleration Vector ax
    const axMag = -trackSpan * 0.55 * Math.cos(angle);
    if (Math.abs(axMag) > 4) {
      drawArrow(ctx, qx, qy + 36, qx + axMag, qy + 36, COLORS.red, 3, 7);
      ctx.fillStyle = COLORS.red;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('ax (restoring)', qx + axMag / 2 - 35, qy + 54);
    } else {
      ctx.fillStyle = COLORS.amber;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('ax = 0', qx - 18, qy + 45);
    }
  }

  // --- Slide 9: Velocity Derivation Canvas ---
  function drawVelocityVector() {
    const canvas = document.getElementById('canvas-velocity');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    clearCanvas(ctx, W, H);

    const cx = 270;
    const cy = 155;
    const R = 105;

    // Horizontal Diameter
    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx - R - 30, cy);
    ctx.lineTo(cx + R + 30, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reference Circle
    ctx.strokeStyle = COLORS.blueGlow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    const theta = 55 * Math.PI / 180;
    const px = cx + R * Math.cos(theta);
    const py = cy - R * Math.sin(theta);
    const qx = px;
    const qy = cy;

    // Radius line OP
    ctx.strokeStyle = COLORS.blue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.fillStyle = COLORS.blue;
    ctx.font = '13px sans-serif';
    ctx.fillText('r', cx + (px - cx) / 2 - 12, cy + (py - cy) / 2);

    // Tangential Velocity v = r*omega (perpendicular to OP)
    const vLen = 78;
    const vAngle = theta + Math.PI / 2; // tangent angle
    const vxEnd = px - vLen * Math.sin(theta);
    const vyEnd = py - vLen * Math.cos(theta);

    drawArrow(ctx, px, py, vxEnd, vyEnd, COLORS.amber, 3.5, 9);
    ctx.fillStyle = COLORS.amber;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('v = rω (Tangential)', px - 65, py - 48);

    // Perpendicular symbol between radius and tangent
    ctx.strokeStyle = COLORS.amber;
    ctx.lineWidth = 1.5;
    const sqSize = 12;
    const rUnitX = Math.cos(theta);
    const rUnitY = -Math.sin(theta);
    const tUnitX = -Math.sin(theta);
    const tUnitY = -Math.cos(theta);
    ctx.beginPath();
    ctx.moveTo(px - sqSize * rUnitX, py - sqSize * rUnitY);
    ctx.lineTo(px - sqSize * rUnitX + sqSize * tUnitX, py - sqSize * rUnitY + sqSize * tUnitY);
    ctx.lineTo(px + sqSize * tUnitX, py + sqSize * tUnitY);
    ctx.stroke();

    // Horizontal velocity component vx = v sin(theta)
    drawArrow(ctx, px, py, vxEnd, py, COLORS.green, 3, 8);
    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('vx = v sin θ', px - 85, py - 10);

    // Vertical dashed drop line for vector component
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = COLORS.ruleLight;
    ctx.beginPath();
    ctx.moveTo(vxEnd, py);
    ctx.lineTo(vxEnd, vyEnd);
    ctx.stroke();
    ctx.restore();

    // Drop to Q
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = COLORS.muted;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(qx, qy);
    ctx.stroke();
    ctx.restore();

    // Velocity of Q along diameter
    drawArrow(ctx, qx, qy + 30, qx - (vLen * Math.sin(theta)), qy + 30, COLORS.green, 3, 8);
    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('vx = ω√(r² - x²)', qx - 145, qy + 48);

    // Points
    drawGlowDot(ctx, cx, cy, 5, COLORS.ink, 6);
    drawGlowDot(ctx, px, py, 7, COLORS.blue, 10);
    drawGlowDot(ctx, qx, qy, 7, COLORS.green, 10);
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('O', cx - 14, cy - 8);
    ctx.fillStyle = COLORS.green;
    ctx.fillText('Q', qx + 10, qy + 4);
  }

  // --- Slide 11: Waveform Unrolling Canvas (1440 x 310) ---
  function drawWaveformUnroll() {
    const canvas = document.getElementById('canvas-waveform');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    clearCanvas(ctx, W, H);

    // 1. Reference Circle on Left
    const cx = 150;
    const cy = 155;
    const R = 95;

    // Axes
    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - R - 25, cy);
    ctx.lineTo(cx + R + 25, cy);
    ctx.moveTo(cx, cy - R - 25);
    ctx.lineTo(cx, cy + R + 25);
    ctx.stroke();

    // Circle
    ctx.strokeStyle = COLORS.blue;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Key angles on circle
    const angles = [
      { a: 0, label: '0, 2π' },
      { a: Math.PI / 4, label: 'π/4' },
      { a: Math.PI / 2, label: 'π/2' },
      { a: 3 * Math.PI / 4, label: '3π/4' },
      { a: Math.PI, label: 'π' },
      { a: 3 * Math.PI / 2, label: '3π/2' }
    ];

    angles.forEach((p) => {
      const x = cx + R * Math.cos(p.a);
      const y = cy - R * Math.sin(p.a);
      drawGlowDot(ctx, x, y, 4, COLORS.blue, 6);
    });

    // 2. Waveform Plot on Right
    const plotStartX = 340;
    const plotEndX = 1380;
    const periodWidth = 920; // 1 full cycle (2*pi)

    // Baseline & Amplitude Bounds
    ctx.strokeStyle = COLORS.rule;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plotStartX, cy);
    ctx.lineTo(plotEndX + 30, cy);
    ctx.stroke();

    // +r and -r dashed bounds
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = COLORS.ruleLight;
    ctx.beginPath();
    ctx.moveTo(plotStartX, cy - R);
    ctx.lineTo(plotEndX + 30, cy - R);
    ctx.moveTo(plotStartX, cy + R);
    ctx.lineTo(plotEndX + 30, cy + R);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = COLORS.muted;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('+r (Amplitude x₀)', plotStartX - 150, cy - R + 5);
    ctx.fillText('0 (Mean Position)', plotStartX - 145, cy + 5);
    ctx.fillText('-r (-x₀)', plotStartX - 80, cy + R + 5);

    // Time Milestones on axis
    const tPoints = [
      { t: 0, label: 't = 0 (0)', frac: 0 },
      { t: Math.PI / 2, label: 'T/4 (π/2)', frac: 0.25 },
      { t: Math.PI, label: 'T/2 (π)', frac: 0.5 },
      { t: 3 * Math.PI / 2, label: '3T/4 (3π/2)', frac: 0.75 },
      { t: 2 * Math.PI, label: 'T (2π)', frac: 1.0 }
    ];

    tPoints.forEach((tp) => {
      const tx = plotStartX + tp.frac * periodWidth;
      ctx.strokeStyle = COLORS.rule;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx, cy - R - 10);
      ctx.lineTo(tx, cy + R + 10);
      ctx.stroke();

      ctx.fillStyle = COLORS.amber;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(tp.label, tx - 22, cy + R + 30);
    });

    // Draw the Cosine Wave: x(t) = r * cos(omega * t)
    ctx.save();
    ctx.strokeStyle = COLORS.neon;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = COLORS.neon;
    ctx.shadowBlur = 10;
    ctx.beginPath();

    const totalSteps = 240;
    for (let i = 0; i <= totalSteps; i++) {
      const x = plotStartX + (i / totalSteps) * (plotEndX - plotStartX);
      const phase = ((x - plotStartX) / periodWidth) * 2 * Math.PI;
      const y = cy - R * Math.cos(phase);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Horizontal connection line linking circle extreme to waveform peak
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = COLORS.amber;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + R, cy); // peak of projection is +r
    ctx.lineTo(plotStartX, cy - R);
    ctx.stroke();
    ctx.restore();

    // Milestone glowing points on wave
    tPoints.forEach((tp) => {
      const wx = plotStartX + tp.frac * periodWidth;
      const wy = cy - R * Math.cos(tp.t);
      drawGlowDot(ctx, wx, wy, 6, COLORS.neon, 12);
    });

    // Period T bracket
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plotStartX, cy - R - 22);
    ctx.lineTo(plotStartX, cy - R - 32);
    ctx.lineTo(plotStartX + periodWidth, cy - R - 32);
    ctx.lineTo(plotStartX + periodWidth, cy - R - 22);
    ctx.stroke();

    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('One Full Period (T = 2π/ω)', plotStartX + periodWidth / 2 - 95, cy - R - 38);
  }

  // --- Master Canvas Dispatcher ---
  function renderCanvasesForSlide(slideIndex, step) {
    switch (slideIndex) {
      case 1: // Slide 2
        drawShadowAnalogy();
        break;
      case 2: // Slide 3
        drawSetupCircle();
        break;
      case 4: // Slide 5 (3 mini circles)
        drawMiniPos('canvas-pos-1', 0, 1);
        drawMiniPos('canvas-pos-2', 60, 2);
        drawMiniPos('canvas-pos-3', 90, 3);
        break;
      case 5: // Slide 6
        drawAccelVector();
        break;
      case 6: // Slide 7
        drawPeriodDiagram();
        break;
      case 7: // Slide 8 (Live Trace 1)
        drawLiveCycleCanvas(step - 1);
        break;
      case 8: // Slide 9
        drawVelocityVector();
        break;
      case 10: // Slide 11
        drawWaveformUnroll();
        break;
      default:
        break;
    }
  }

  // ==========================================================================
  // 6. LIVE TRACE 1: CYCLE TRACE CONTROLLER (SLIDE 8)
  // ==========================================================================
  const CYCLE_TRACE = [
    {
      step: 1,
      angle: '0° (0 rad)',
      xVal: '+0.10 m',
      axVal: '-0.40 m/s²',
      dir: 'At Right Extreme (+x₀) — Restores LEFT toward O',
      math: 'x = 0.10 cos(0°) = +0.10 m &nbsp;&bull;&nbsp; ax = -(2.0)²(0.10) = -0.40 m/s²',
      explanation: '<strong>Checkpoint 1: Starting at the Right Extreme (θ = 0°).</strong> The particle P is at (r, 0). The projection Q is at its maximum positive displacement x = +0.10 m (Amplitude x₀). Here, velocity is momentarily zero, and the restoring acceleration reaches its peak value of <strong>-0.40 m/s²</strong> directed leftward toward equilibrium O.'
    },
    {
      step: 2,
      angle: '60° (π/3 rad)',
      xVal: '+0.05 m',
      axVal: '-0.20 m/s²',
      dir: 'Moving leftward — Accelerating LEFT toward O',
      math: 'x = 0.10 cos(60°) = +0.05 m &nbsp;&bull;&nbsp; ax = -(2.0)²(0.05) = -0.20 m/s²',
      explanation: '<strong>Checkpoint 2: Intermediate Inward Motion (θ = 60°).</strong> Since cos 60° = 0.5, projection Q has moved halfway back to the center (x = +0.05 m). Notice that the acceleration has halved to <strong>-0.20 m/s²</strong>, still pointing leftward toward O. Both velocity and acceleration are currently negative.'
    },
    {
      step: 3,
      angle: '90° (π/2 rad)',
      xVal: '0.00 m',
      axVal: '0.00 m/s²',
      dir: 'At Mean Position O — Instantaneous ax = 0 (v is MAX)',
      math: 'x = 0.10 cos(90°) = 0.00 m &nbsp;&bull;&nbsp; ax = -(2.0)²(0) = 0.00 m/s²',
      explanation: '<strong>Checkpoint 3: The Mean Position / Equilibrium (θ = 90°).</strong> P is directly at the top of the circle. Projection Q crosses center O (x = 0). Restoring acceleration drops to <strong>0.00 m/s²</strong> because there is zero displacement! However, Q has built up maximum velocity (v_max = -rω = -0.20 m/s).'
    },
    {
      step: 4,
      angle: '120° (2π/3 rad)',
      xVal: '-0.05 m',
      axVal: '+0.20 m/s²',
      dir: 'Left of center — Restores RIGHT toward O',
      math: 'x = 0.10 cos(120°) = -0.05 m &nbsp;&bull;&nbsp; ax = -(2.0)²(-0.05) = +0.20 m/s²',
      explanation: '<strong>Checkpoint 4: Crossing into Negative Territory (θ = 120°).</strong> Displacement is now negative (x = -0.05 m). Look at the acceleration sign: ax = -(4.0)(-0.05) = <strong>+0.20 m/s²</strong>! Because displacement is to the left of O, the restoring force immediately acts to the right, slowing Q down.'
    },
    {
      step: 5,
      angle: '180° (π rad)',
      xVal: '-0.10 m',
      axVal: '+0.40 m/s²',
      dir: 'At Left Extreme (-x₀) — Restores RIGHT toward O (MAX)',
      math: 'x = 0.10 cos(180°) = -0.10 m &nbsp;&bull;&nbsp; ax = -(2.0)²(-0.10) = +0.40 m/s²',
      explanation: '<strong>Checkpoint 5: The Left Extreme (θ = 180°).</strong> P reaches the leftmost point on the circle. Q halts at x = -0.10 m (velocity reverses). Acceleration is at positive maximum <strong>+0.40 m/s²</strong>, pulling powerfully back toward center O. This marks exactly half the period (t = T/2).'
    },
    {
      step: 6,
      angle: '270° (3π/2 rad)',
      xVal: '0.00 m',
      axVal: '0.00 m/s²',
      dir: 'Returning through O — Instantaneous ax = 0',
      math: 'x = 0.10 cos(270°) = 0.00 m &nbsp;&bull;&nbsp; ax = -(2.0)²(0) = 0.00 m/s²',
      explanation: '<strong>Checkpoint 6: Return Crossing Through Equilibrium (θ = 270°).</strong> P is at the bottom of the circle. Q is crossing center O again, this time moving to the right at +0.20 m/s. Once more, at x = 0, acceleration is <strong>0.00 m/s²</strong>. Three-quarters of the period (t = 3T/4) has elapsed.'
    },
    {
      step: 7,
      angle: '360° (2π rad)',
      xVal: '+0.10 m',
      axVal: '-0.40 m/s²',
      dir: 'Back at Right Extreme (+x₀) — Full Period T completed',
      math: 'x = 0.10 cos(360°) = +0.10 m &nbsp;&bull;&nbsp; ax = -(2.0)²(0.10) = -0.40 m/s²',
      explanation: '<strong>Checkpoint 7: One Full Period Complete (θ = 360° = 2π rad).</strong> P has completed a 360° circuit and Q has executed one complete oscillation: A → O → B → O → A in time T = 2π/ω = 3.14 s. Q is back at +0.10 m with maximum leftward acceleration <strong>-0.40 m/s²</strong>. The cycle now repeats indefinitely!'
    }
  ];

  function renderCycleLive(stepIdx) {
    const table = document.getElementById('cycle-table');
    const mathEval = document.getElementById('cycle-math-eval');
    const explanation = document.getElementById('cycle-explanation');
    if (!table) return;

    let html = `
      <thead>
        <tr>
          <th>Step</th>
          <th>Angle θ</th>
          <th>Displacement x = r cos θ</th>
          <th>Accel ax = -ω²x</th>
          <th>Direction of Q</th>
        </tr>
      </thead>
      <tbody>
    `;

    CYCLE_TRACE.forEach((row, i) => {
      const isCurrent = (i === stepIdx);
      const isPast = (i < stepIdx);
      const rowClass = isCurrent ? 'hl-row' : (isPast ? '' : 'invisible');

      html += `
        <tr class="${rowClass}">
          <td class="${isCurrent ? 'hl-cell-amber' : ''}"><strong>#${row.step}</strong></td>
          <td class="${isCurrent ? 'hl-cell-amber' : ''}">${row.angle}</td>
          <td class="${isCurrent ? 'hl-cell-blue' : ''}">${row.xVal}</td>
          <td class="${isCurrent ? 'hl-cell-red' : ''}">${row.axVal}</td>
          <td style="font-size:17px; text-align:left;">${row.dir}</td>
        </tr>
      `;
    });

    html += `</tbody>`;
    table.innerHTML = html;

    const currentData = CYCLE_TRACE[stepIdx] || CYCLE_TRACE[0];
    if (mathEval) mathEval.innerHTML = currentData.math;
    if (explanation) explanation.innerHTML = currentData.explanation;

    drawLiveCycleCanvas(stepIdx);
  }

  // ==========================================================================
  // 7. LIVE TRACE 2: KINEMATICS EVALUATOR (SLIDE 10)
  // ==========================================================================
  const KIN_TRACE = [
    {
      step: 1,
      pos: 'Setup & Bounds',
      x: 'r = 0.50 m, ω = 4.0 rad/s',
      v: 'v_max = rω = 2.00 m/s',
      a: 'a_max = ω²r = 8.00 m/s²',
      math: 'r = 0.50 m &nbsp;&bull;&nbsp; ω = 4.0 rad/s &nbsp;&bull;&nbsp; v_max = (0.50)(4.0) = 2.00 m/s &nbsp;&bull;&nbsp; a_max = (4.0)²(0.50) = 8.00 m/s²',
      explanation: '<strong>Step 1: Setup & Given Parameters.</strong> Radius r = 0.50 m (Amplitude x₀), angular frequency ω = 4.0 rad/s. Before evaluating specific points, compute the bounds: maximum velocity at mean position is v_max = rω = <strong>2.00 m/s</strong>, and maximum acceleration at extreme position is a_max = ω²r = <strong>8.00 m/s²</strong>.',
      summary: 'Bounds established: Velocity ranges from 0 to 2.00 m/s. Acceleration ranges from 0 to 8.00 m/s².'
    },
    {
      step: 2,
      pos: 'Mean Position (x = 0)',
      x: '0.00 m',
      v: '2.00 m/s (MAXIMUM)',
      a: '0.00 m/s² (MINIMUM)',
      math: '|vx| = 4.0 √(0.50² - 0²) = 4.0(0.50) = <strong>2.00 m/s</strong> &nbsp;&bull;&nbsp; |ax| = (4.0)²(0) = <strong>0.00 m/s²</strong>',
      explanation: '<strong>Step 2: Mean Position (x = 0.00 m).</strong> At the center O, the displacement is zero, so restoring acceleration is exactly <strong>0.00 m/s²</strong>. All the energy is kinetic: velocity reaches its absolute maximum: |vx| = 4.0√(0.50² - 0) = <strong>2.00 m/s</strong>.',
      summary: 'At Mean Position: Maximum speed (2.00 m/s), Zero restoring acceleration.'
    },
    {
      step: 3,
      pos: 'Intermediate Position',
      x: '0.30 m',
      v: '1.60 m/s',
      a: '4.80 m/s²',
      math: '|vx| = 4.0 √(0.25 - 0.09) = 4.0(0.40) = <strong>1.60 m/s</strong> &nbsp;&bull;&nbsp; |ax| = 16.0(0.30) = <strong>4.80 m/s²</strong>',
      explanation: '<strong>Step 3: Intermediate Position (x = 0.30 m).</strong> Notice the classic 3-4-5 Pythagorean triangle: √(0.50² - 0.30²) = √(0.25 - 0.09) = √0.16 = 0.40 m. Velocity is |vx| = 4.0 × 0.40 = <strong>1.60 m/s</strong>. Restoring acceleration is |ax| = (4.0)² × 0.30 = <strong>4.80 m/s²</strong>.',
      summary: 'At Intermediate Position: Both velocity (1.60 m/s) and acceleration (4.80 m/s²) are non-zero.'
    },
    {
      step: 4,
      pos: 'Extreme Position (x = r)',
      x: '0.50 m',
      v: '0.00 m/s (MINIMUM)',
      a: '8.00 m/s² (MAXIMUM)',
      math: '|vx| = 4.0 √(0.50² - 0.50²) = <strong>0.00 m/s</strong> &nbsp;&bull;&nbsp; |ax| = (4.0)²(0.50) = <strong>8.00 m/s²</strong>',
      explanation: '<strong>Step 4: Extreme Position (x = 0.50 m = r).</strong> At the outer limit, the particle stops instantaneously to reverse direction: |vx| = 4.0√(0.50² - 0.50²) = <strong>0.00 m/s</strong>. Restoring acceleration is at its absolute peak: |ax| = (4.0)² × 0.50 = <strong>8.00 m/s²</strong> directed inward toward O!',
      summary: 'At Extreme Position: Zero speed (turning point), Maximum restoring acceleration (8.00 m/s²).'
    }
  ];

  function renderKinematicsLive(stepIdx) {
    const table = document.getElementById('kin-table');
    const mathEval = document.getElementById('kin-math-eval');
    const explanation = document.getElementById('kin-explanation');
    const summary = document.getElementById('kin-summary-text');
    if (!table) return;

    let html = `
      <thead>
        <tr>
          <th>Step</th>
          <th>Position</th>
          <th>Displacement x</th>
          <th>Velocity |vx|</th>
          <th>Acceleration |ax|</th>
        </tr>
      </thead>
      <tbody>
    `;

    KIN_TRACE.forEach((row, i) => {
      const isCurrent = (i === stepIdx);
      const isPast = (i < stepIdx);
      const rowClass = isCurrent ? 'hl-row' : (isPast ? '' : 'invisible');

      html += `
        <tr class="${rowClass}">
          <td class="${isCurrent ? 'hl-cell-amber' : ''}"><strong>#${row.step}</strong></td>
          <td class="${isCurrent ? 'hl-cell-amber' : ''}">${row.pos}</td>
          <td class="${isCurrent ? 'hl-cell-blue' : ''}">${row.x}</td>
          <td class="${isCurrent ? 'hl-cell-green' : ''}">${row.v}</td>
          <td class="${isCurrent ? 'hl-cell-red' : ''}">${row.a}</td>
        </tr>
      `;
    });

    html += `</tbody>`;
    table.innerHTML = html;

    const currentData = KIN_TRACE[stepIdx] || KIN_TRACE[0];
    if (mathEval) mathEval.innerHTML = currentData.math;
    if (explanation) explanation.innerHTML = currentData.explanation;
    if (summary) summary.innerHTML = currentData.summary;
  }

  // ==========================================================================
  // 8. INITIALIZE ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    fit();
    updateSlide();
  });

  // Also run immediately if script loaded after DOM
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fit();
    updateSlide();
  }
})();
